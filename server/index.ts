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
  deleteRoom,
} from './rooms'

// Allow configuration of allowed origins via env var `ALLOWED_ORIGINS` (comma separated)
// Example: ALLOWED_ORIGINS="https://app.example.com,https://staging.example.com"
const envList = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

const ALLOWED_ORIGINS = Array.from(new Set([
  'http://localhost:3000',
  ...envList,
])).map(o => o.replace(/\/$/, ''))

function isAllowed(origin: string | undefined): boolean {
  // If no origin (e.g., same-origin request from server), allow
  if (!origin) return true
  // Allow all when explicitly set (temporary/development)
  if (process.env.ALLOW_ALL_ORIGINS === 'true') return true
  const cleaned = origin.replace(/\/$/, '')
  const ok = ALLOWED_ORIGINS.includes(cleaned)
  if (!ok) console.warn('CORS blocked origin:', origin, 'allowed:', ALLOWED_ORIGINS)
  return ok
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
      // The player who requested end is considered the loser (forfeit)
      const leavingColor = room.players.red.socketId === socket.id ? 'red' : 'black'
      const winnerColor = leavingColor === 'red' ? 'black' : 'red'
      const loser = room.players[leavingColor]
      const winner = room.players[winnerColor]

      io.to(room.id).emit('game:timeout', {
        loserColor: leavingColor,
        winnerColor,
        loserId: loser.userId,
        winnerId: winner.userId,
        reason: 'forfeit',
      })

      // cleanup
      try { deleteRoom(room.id) } catch (e) { console.warn('deleteRoom failed', e) }
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