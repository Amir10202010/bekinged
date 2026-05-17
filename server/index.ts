import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { handleMatchmaking, removeFromQueue } from './matchmaking'
import {
  handleMove,
  forfeitGame,
  handlePlayerDisconnect,
  handlePlayerReconnect,
  isUserInGame,
  getRoomById,
} from './rooms'

const ALLOWED = [
  'http://localhost:3000',
  (process.env.CLIENT_URL ?? '').replace(/\/$/, ''),
].filter(Boolean)

const originFn = (
  origin: string | undefined,
  cb: (e: Error | null, ok?: boolean) => void
) => {
  if (!origin) return cb(null, true)
  if (ALLOWED.includes(origin.replace(/\/$/, ''))) return cb(null, true)
  cb(new Error('CORS'))
}

const app = express()
app.use(cors({ origin: originFn, credentials: true }))
app.get('/health', (_, res) => res.json({ ok: true }))

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: originFn, credentials: true },
})

io.on('connection', (socket) => {
  console.log('[connect]', socket.id)

  socket.on('player:reconnect', ({ userId }: { userId: string }) => {
    const rejoined = handlePlayerReconnect(io, socket, userId)
    if (!rejoined) socket.emit('player:no_active_game')
  })

  socket.on('queue:join', (data: { userId: string; username: string; elo: number }) => {
    if (isUserInGame(data.userId)) {
      socket.emit('game:error', { message: 'Already in a game' })
      return
    }
    handleMatchmaking(io, socket, { ...data, socketId: socket.id })
  })

  socket.on('queue:leave', () => {
    removeFromQueue(socket.id)
  })

  socket.on('game:move', (data: { roomId: string; move: unknown; gameState: unknown }) => {
    handleMove(io, socket, data)
  })

  socket.on('game:forfeit', () => {
    forfeitGame(io, socket)
  })

  socket.on('disconnect', () => {
    console.log('[disconnect]', socket.id)
    removeFromQueue(socket.id)
    handlePlayerDisconnect(io, socket.id)
  })

  socket.on('player:request_state', (data: { roomId: string }) => {
    const room = getRoomById(data.roomId)
    if (!room || !room.gameState) {
      socket.emit('game:error', { message: 'No game state available' })
      return
    }
    socket.emit('game:state', room.gameState)
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () =>
  console.log(`Server on :${PORT} | allowed:`, ALLOWED)
)