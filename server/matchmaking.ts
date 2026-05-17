import { Server, Socket } from 'socket.io'
import { createRoom } from './rooms'

interface QueuePlayer {
  socketId: string
  userId: string
  username: string
  elo: number
}

const queue: QueuePlayer[] = []

export function handleMatchmaking(io: Server, socket: Socket, data: QueuePlayer) {
  const existing = queue.find(p => p.userId === data.userId)
  if (existing) return

  queue.push({ ...data, socketId: socket.id })

  if (queue.length >= 2) {
    const p1 = queue.shift()!
    const p2 = queue.shift()!
    const roomId = `room_${Date.now()}`

    createRoom(roomId, p1, p2)

    const s1 = io.sockets.sockets.get(p1.socketId)
    const s2 = io.sockets.sockets.get(p2.socketId)

    s1?.join(roomId)
    s2?.join(roomId)

    s1?.emit('match:found', {
      roomId, color: 'red',
      opponent: { id: p2.userId, username: p2.username, elo: p2.elo }
    })
    s2?.emit('match:found', {
      roomId, color: 'black',
      opponent: { id: p1.userId, username: p1.username, elo: p1.elo }
    })
  } else {
    socket.emit('queue:waiting', { position: queue.length })
  }
}

export function removeFromQueue(socketId: string) {
  const idx = queue.findIndex(p => p.socketId === socketId)
  if (idx !== -1) queue.splice(idx, 1)
}
