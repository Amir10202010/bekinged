import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { handleMatchmaking, removeFromQueue } from './matchmaking'
import { handleMove, getRoom, deleteRoom } from './rooms'

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }))
app.get('/health', (_, res) => res.json({ ok: true }))

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000' }
})

io.on('connection', (socket) => {
  console.log('connected:', socket.id)

  socket.on('queue:join', (data: { userId: string; username: string; elo: number }) => {
    handleMatchmaking(io, socket, data)
  })

  socket.on('queue:leave', () => {
    removeFromQueue(socket.id)
  })

  socket.on('game:move', (data: { roomId: string; move: unknown; gameState: unknown }) => {
    handleMove(io, socket, data)
  })

  socket.on('disconnect', () => {
    removeFromQueue(socket.id)
    const room = getRoom(socket.id)
    if (room) {
      io.to(room.id).emit('opponent:disconnected')
      deleteRoom(room.id)
    }
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => console.log(`Socket server on port ${PORT}`))
