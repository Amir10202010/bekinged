import { Server, Socket } from 'socket.io'

interface RoomPlayer {
  socketId: string
  userId: string
  username: string
  elo: number
}

interface Room {
  id: string
  players: { red: RoomPlayer; black: RoomPlayer }
  createdAt: Date
}

const rooms = new Map<string, Room>()
const socketToRoom = new Map<string, string>()

export function createRoom(roomId: string, red: RoomPlayer, black: RoomPlayer) {
  const room: Room = { id: roomId, players: { red, black }, createdAt: new Date() }
  rooms.set(roomId, room)
  socketToRoom.set(red.socketId, roomId)
  socketToRoom.set(black.socketId, roomId)
  return room
}

export function handleMove(io: Server, socket: Socket, data: {
  roomId: string; move: unknown; gameState: unknown
}) {
  socket.to(data.roomId).emit('game:move', {
    move: data.move,
    gameState: data.gameState,
  })
}

export function getRoom(socketId: string): Room | undefined {
  const roomId = socketToRoom.get(socketId)
  if (!roomId) return undefined
  return rooms.get(roomId)
}

export function deleteRoom(roomId: string) {
  const room = rooms.get(roomId)
  if (room) {
    socketToRoom.delete(room.players.red.socketId)
    socketToRoom.delete(room.players.black.socketId)
    rooms.delete(roomId)
  }
}
