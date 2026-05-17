import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { handleMatchmaking, removeFromQueue } from './matchmaking'
import { handleMove, getRoom, deleteRoom } from './rooms'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://bekinged-rt5h.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean).map(o => (o as string).replace(/\/$/, ''))

function isAllowed(origin: string | undefined): boolean {
  if (!origin) return true
  return ALLOWED_ORIGINS.some(o => origin.replace(/\/$/, '') === o)
}

const app = express()
app.use(cors({
  origin: (origin, cb) => isAllowed(origin) ? cb(null, true) : cb(new Error('CORS')),
  credentials: true,
}))
app.get('/health', (_, res) => res.json({ ok: true }))

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: (origin, cb) => isAllowed(origin) ? cb(null, true) : cb(new Error('CORS')),
    credentials: true,
  }
})

io.on('connection', (socket) => {
  console.log('connected:', socket.id)

  socket.on('queue:join', (data: { userId: string; username: string; elo: number }) => {
    handleMatchmaking(io, socket, { ...data, socketId: socket.id })
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