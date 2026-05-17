import { Server, Socket } from 'socket.io'

interface RoomPlayer {
  socketId: string
  userId: string
  username: string
  elo: number
}

interface Room {
  id: string
  red: RoomPlayer
  black: RoomPlayer
  currentTurn: 'red' | 'black'
  turnTimer: ReturnType<typeof setTimeout> | null
  disconnectTimer: ReturnType<typeof setTimeout> | null
  gameState?: any
}

const rooms = new Map<string, Room>()
const socketToRoom = new Map<string, string>()
const userToRoom = new Map<string, string>()

export function createRoom(
  roomId: string,
  red: RoomPlayer,
  black: RoomPlayer
): Room {
  const room: Room = {
    id: roomId,
    red,
    black,
    currentTurn: 'red',
    turnTimer: null,
    disconnectTimer: null,
  }
  rooms.set(roomId, room)
  socketToRoom.set(red.socketId, roomId)
  socketToRoom.set(black.socketId, roomId)
  userToRoom.set(red.userId, roomId)
  userToRoom.set(black.userId, roomId)
  room.gameState = null
  return room
}

export function handleMove(
  io: Server,
  socket: Socket,
  data: { roomId: string; move: unknown; gameState: unknown }
): void {
  const room = rooms.get(data.roomId)
  if (!room) {
    socket.emit('game:error', { message: 'Room not found' })
    return
  }

  // Определяем цвет отправителя
  const senderColor =
    room.red.socketId === socket.id ? 'red'
    : room.black.socketId === socket.id ? 'black'
    : null

  if (!senderColor) {
    socket.emit('game:error', { message: 'Not in this room' })
    return
  }

  // Проверяем очерёдность
  if (senderColor !== room.currentTurn) {
    socket.emit('game:error', { message: 'Not your turn' })
    return
  }

  // Сбросить таймер
  if (room.turnTimer) clearTimeout(room.turnTimer)

  // Сменить очерёдность
  room.currentTurn = senderColor === 'red' ? 'black' : 'red'

  // Отправить ход ТОЛЬКО сопернику (не обратно отправителю)
  socket.to(data.roomId).emit('game:move', {
    move: data.move,
    gameState: data.gameState,
    currentTurn: room.currentTurn,
  })

  // Подтвердить отправителю что ход принят
  socket.emit('game:move_ack', {
    currentTurn: room.currentTurn,
  })

  // Store the authoritative game state snapshot if provided by the sender
  try {
    const incomingState = (data as any).gameState
    room.gameState = incomingState?.state ?? incomingState ?? null
  } catch (e) {
    room.gameState = null
  }

  // Таймер 60 сек на следующий ход
  room.turnTimer = setTimeout(() => {
    const loserColor = room.currentTurn
    const winnerColor = loserColor === 'red' ? 'black' : 'red'
    io.to(room.id).emit('game:over', {
      winnerId: room[winnerColor].userId,
      loserId: room[loserColor].userId,
      winnerColor,
      loserColor,
      reason: 'timeout',
    })
    cleanupRoom(room)
  }, 60_000)
}

export function forfeitGame(
  io: Server,
  socket: Socket
): void {
  const roomId = socketToRoom.get(socket.id)
  if (!roomId) return
  const room = rooms.get(roomId)
  if (!room) return

  const loserColor =
    room.red.socketId === socket.id ? 'red' : 'black'
  const winnerColor = loserColor === 'red' ? 'black' : 'red'

  io.to(room.id).emit('game:over', {
    winnerId: room[winnerColor].userId,
    loserId: room[loserColor].userId,
    winnerColor,
    loserColor,
    reason: 'forfeit',
  })
  cleanupRoom(room)
}

export function handlePlayerDisconnect(
  io: Server,
  socketId: string
): void {
  const roomId = socketToRoom.get(socketId)
  if (!roomId) return
  const room = rooms.get(roomId)
  if (!room) return

  const dcColor = room.red.socketId === socketId ? 'red' : 'black'
  const opponentColor = dcColor === 'red' ? 'black' : 'red'

  io.to(room[opponentColor].socketId).emit('opponent:disconnected')

  room.disconnectTimer = setTimeout(() => {
    io.to(room.id).emit('game:over', {
      winnerId: room[opponentColor].userId,
      loserId: room[dcColor].userId,
      winnerColor: opponentColor,
      loserColor: dcColor,
      reason: 'disconnect',
    })
    cleanupRoom(room)
  }, 60_000)
}

export function handlePlayerReconnect(
  io: Server,
  socket: Socket,
  userId: string
): boolean {
  const roomId = userToRoom.get(userId)
  if (!roomId) return false
  const room = rooms.get(roomId)
  if (!room) return false

  const color =
    room.red.userId === userId ? 'red'
    : room.black.userId === userId ? 'black'
    : null
  if (!color) return false

  // Отменить таймер дисконнекта
  if (room.disconnectTimer) {
    clearTimeout(room.disconnectTimer)
    room.disconnectTimer = null
  }

  // Обновить socketId
  const oldSocketId = room[color].socketId
  socketToRoom.delete(oldSocketId)
  room[color].socketId = socket.id
  socketToRoom.set(socket.id, roomId)
  socket.join(roomId)

  const opponentColor = color === 'red' ? 'black' : 'red'
  io.to(room[opponentColor].socketId).emit('opponent:reconnected')

  socket.emit('game:reconnected', {
    roomId: room.id,
    color,
    currentTurn: room.currentTurn,
    opponent: {
      id: room[opponentColor].userId,
      username: room[opponentColor].username,
      elo: room[opponentColor].elo,
    },
  })

  return true
}

function cleanupRoom(room: Room): void {
  if (room.turnTimer) clearTimeout(room.turnTimer)
  if (room.disconnectTimer) clearTimeout(room.disconnectTimer)
  socketToRoom.delete(room.red.socketId)
  socketToRoom.delete(room.black.socketId)
  userToRoom.delete(room.red.userId)
  userToRoom.delete(room.black.userId)
  rooms.delete(room.id)
}

export function getRoomBySocket(socketId: string): Room | undefined {
  const roomId = socketToRoom.get(socketId)
  return roomId ? rooms.get(roomId) : undefined
}

export function isUserInGame(userId: string): boolean {
  return userToRoom.has(userId)
}

export function getRoomById(roomId: string): Room | undefined {
  return rooms.get(roomId)
}

export function startTurnTimerByRoomId(io: Server, roomId: string): void {
  const room = rooms.get(roomId)
  if (!room) return
  if (room.turnTimer) clearTimeout(room.turnTimer)
  room.turnTimer = setTimeout(() => {
    const loserColor = room.currentTurn
    const winnerColor = loserColor === 'red' ? 'black' : 'red'
    io.to(room.id).emit('game:over', {
      winnerId: room[winnerColor].userId,
      loserId: room[loserColor].userId,
      winnerColor,
      loserColor,
      reason: 'timeout',
    })
    cleanupRoom(room)
  }, 60_000)
}

export default {}
