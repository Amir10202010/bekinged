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
  currentTurn: 'red' | 'black'
  moveCount: number
  createdAt: Date
  turnTimer?: ReturnType<typeof setTimeout>
  disconnectTimer?: ReturnType<typeof setTimeout>
}

const rooms = new Map<string, Room>()
const socketToRoom = new Map<string, string>()

export function createRoom(
  roomId: string,
  red: RoomPlayer,
  black: RoomPlayer
): Room {
  const room: Room = {
    id: roomId,
    players: { red, black },
    currentTurn: 'red',
    moveCount: 0,
    createdAt: new Date(),
  }
  rooms.set(roomId, room)
  socketToRoom.set(red.socketId, roomId)
  socketToRoom.set(black.socketId, roomId)
  return room
}

export function handleMove(
  io: Server,
  socket: Socket,
  data: { roomId: string; move: unknown; gameState: unknown; color: string }
) {
  const room = rooms.get(data.roomId)
  if (!room) return

  // Проверяем что ходит правильный игрок
  const playerColor =
    room.players.red.socketId === socket.id ? 'red' : 'black'
  if (playerColor !== room.currentTurn) {
    socket.emit('error:not_your_turn')
    return
  }

  // Сбросить таймер хода
  if (room.turnTimer) clearTimeout(room.turnTimer)

  // Сменить ход
  room.currentTurn = room.currentTurn === 'red' ? 'black' : 'red'
  room.moveCount++

  // Отправить ход сопернику
  socket.to(data.roomId).emit('game:move', {
    move: data.move,
    gameState: data.gameState,
    currentTurn: room.currentTurn,
  })

  // Запустить таймер на следующий ход (60 секунд)
  startTurnTimer(io, room)
}

function startTurnTimer(io: Server, room: Room) {
  if (room.turnTimer) clearTimeout(room.turnTimer)

  room.turnTimer = setTimeout(() => {
    // Игрок чья очередь — проигрывает по таймауту
    const loserColor = room.currentTurn
    const winnerColor = loserColor === 'red' ? 'black' : 'red'
    const loser = room.players[loserColor]
    const winner = room.players[winnerColor]

    io.to(room.id).emit('game:timeout', {
      loserColor,
      winnerColor,
      loserId: loser.userId,
      winnerId: winner.userId,
      reason: 'timeout',
    })

    cleanupRoom(room)
  }, 60_000)
}

export function handleDisconnect(
  io: Server,
  socketId: string
) {
  const roomId = socketToRoom.get(socketId)
  if (!roomId) return

  const room = rooms.get(roomId)
  if (!room) return

  const disconnectedColor =
    room.players.red.socketId === socketId ? 'red' : 'black'
  const opponentColor = disconnectedColor === 'red' ? 'black' : 'red'
  const opponent = room.players[opponentColor]
  const disconnected = room.players[disconnectedColor]

  // Уведомить соперника
  io.to(opponent.socketId).emit('opponent:disconnected', {
    reconnectWindowMs: 60_000,
  })

  // Дать 60 секунд на реконнект
  room.disconnectTimer = setTimeout(() => {
    io.to(room.id).emit('game:timeout', {
      loserColor: disconnectedColor,
      winnerColor: opponentColor,
      loserId: disconnected.userId,
      winnerId: opponent.userId,
      reason: 'disconnect',
    })
    cleanupRoom(room)
  }, 60_000)
}

export function handleReconnect(
  io: Server,
  socket: Socket,
  userId: string
) {
  // Найти комнату где был этот юзер
  for (const [, room] of rooms) {
    const isRed = room.players.red.userId === userId
    const isBlack = room.players.black.userId === userId
    if (!isRed && !isBlack) continue

    const color = isRed ? 'red' : 'black'

    // Обновить socketId
    room.players[color].socketId = socket.id
    socketToRoom.set(socket.id, room.id)
    socket.join(room.id)

    // Отменить таймер дисконнекта
    if (room.disconnectTimer) clearTimeout(room.disconnectTimer)

    // Уведомить соперника
    const opponentColor = color === 'red' ? 'black' : 'red'
    io.to(room.players[opponentColor].socketId).emit('opponent:reconnected')

    // Отправить текущее состояние переподключившемуся
    socket.emit('game:reconnected', {
      roomId: room.id,
      color,
      currentTurn: room.currentTurn,
      opponent: room.players[opponentColor],
    })

    return
  }
}

function cleanupRoom(room: Room) {
  if (room.turnTimer) clearTimeout(room.turnTimer)
  if (room.disconnectTimer) clearTimeout(room.disconnectTimer)
  socketToRoom.delete(room.players.red.socketId)
  socketToRoom.delete(room.players.black.socketId)
  rooms.delete(room.id)
}

export function getRoom(socketId: string): Room | undefined {
  const roomId = socketToRoom.get(socketId)
  if (!roomId) return undefined
  return rooms.get(roomId)
}

export function deleteRoom(roomId: string) {
  const room = rooms.get(roomId)
  if (!room) return
  cleanupRoom(room)
}

export function getRoomByUserId(userId: string): Room | undefined {
  for (const [, room] of rooms) {
    if (
      room.players.red.userId === userId ||
      room.players.black.userId === userId
    ) return room
  }
  return undefined
}

export function startTurnTimerByRoomId(io: Server, roomId: string) {
  const room = rooms.get(roomId)
  if (!room) return
  startTurnTimer(io, room)
}

export { startTurnTimer }
