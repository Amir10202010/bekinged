import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { handleMatchmaking, removeFromQueue } from './matchmaking'
import {
  handleMove,
  handleDisconnect,
  handleReconnect,
  getRoom,
  getRoomByUserId,
} from './rooms'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  process.env.CLIENT_URL ?? '',
].filter(Boolean).map(o => o.replace(/\/$/, ''))

function isAllowed(origin: string | undefined): boolean {
  if (!origin) return true
  return ALLOWED_ORIGINS.some(o => origin.replace(/\/$/, '') === o)
}

const app = express()
app.use(cors({
  origin: (origin, cb) =>
    isAllowed(origin) ? cb(null, true) : cb(new Error('CORS')),
  credentials: true,
}))
app.get('/health', (_, res) => res.json({ ok: true }))

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: (origin, cb) =>
      isAllowed(origin) ? cb(null, true) : cb(new Error('CORS')),
    credentials: true,
  },
})

io.on('connection', (socket) => {
  console.log('connected:', socket.id)

  // Реконнект — проверить есть ли активная игра
  socket.on('player:reconnect', (data: { userId: string }) => {
    handleReconnect(io, socket, data.userId)
  })

  socket.on(
    'queue:join',
    (data: { userId: string; username: string; elo: number }) => {
      // Проверить не в игре ли уже
      const existingRoom = getRoomByUserId(data.userId)
      if (existingRoom) {
        socket.emit('error:already_in_game')
        return
      }
      handleMatchmaking(io, socket, { ...data, socketId: socket.id })
    }
  )

  socket.on('queue:leave', () => {
    removeFromQueue(socket.id)
  })

  socket.on(
    'game:move',
    (data: {
      roomId: string
      move: unknown
      gameState: unknown
      color: string
    }) => {
      handleMove(io, socket, data)
    }
  )

  socket.on('game:end', (data: { roomId: string }) => {
    const room = getRoom(socket.id)
    if (room) {
      io.to(room.id).emit('game:ended_confirmed')
    }
  })

  socket.on('disconnect', () => {
    removeFromQueue(socket.id)
    handleDisconnect(io, socket.id)
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () =>
  console.log(`Socket server running on port ${PORT}`)
)