/**
 * src/lib/game/gameEngine.ts
 * Pure Russian checkers engine (immutable, no React, no DOM, no Zustand).
 */

import {
  Color,
  PieceType,
  Position,
  Piece,
  Move,
  GameState,
  BOARD_SIZE,
  Personality,
} from './types'

const ALL_DIRECTIONS = [
  { dr: -1, dc: -1 },
  { dr: -1, dc: 1 },
  { dr: 1, dc: -1 },
  { dr: 1, dc: 1 },
]

function inBounds(p: Position): boolean {
  return p.row >= 0 && p.row < BOARD_SIZE && p.col >= 0 && p.col < BOARD_SIZE
}

function clonePiece(p: Piece): Piece {
  return {
    id: p.id,
    color: p.color,
    type: p.type,
    position: { row: p.position.row, col: p.position.col },
  }
}

function createEmptyBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = []
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row: (Piece | null)[] = new Array(BOARD_SIZE).fill(null)
    board.push(row)
  }
  return board
}

function otherColor(c: Color): Color {
  return c === 'red' ? 'black' : 'red'
}

function posEq(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col
}

function isPromotionRow(color: Color, row: number): boolean {
  return color === 'red' ? row === 0 : row === BOARD_SIZE - 1
}

function isPromotion(piece: Piece, to: Position): boolean {
  return piece.type === 'man' && isPromotionRow(piece.color, to.row)
}

function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map(row => row.map(cell => (cell ? clonePiece(cell) : null)))
}

function cloneState(state: GameState): GameState {
  const newPieces = new Map<string, Piece>()
  state.pieces.forEach((p, id) => newPieces.set(id, clonePiece(p)))

  const board = createEmptyBoard()
  for (const p of newPieces.values()) {
    board[p.position.row][p.position.col] = p
  }

  return {
    board,
    pieces: newPieces,
    currentTurn: state.currentTurn,
    status: state.status,
    winner: state.winner,
    moveHistory: state.moveHistory.slice(),
    selectedPiece: state.selectedPiece ? { ...state.selectedPiece } : null,
  }
}

/**
 * Initialize standard 8x8 Russian checkers position:
 * black top, red bottom.
 */
export function initGame(): GameState {
  const board = createEmptyBoard()
  const pieces = new Map<string, Piece>()
  let idCounter = 1

  for (let r = 0; r <= 2; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if ((r + c) % 2 === 1) {
        const id = `b${idCounter++}`
        const piece: Piece = {
          id,
          color: 'black',
          type: 'man',
          position: { row: r, col: c },
        }
        board[r][c] = piece
        pieces.set(id, clonePiece(piece))
      }
    }
  }

  for (let r = 5; r <= 7; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if ((r + c) % 2 === 1) {
        const id = `r${idCounter++}`
        const piece: Piece = {
          id,
          color: 'red',
          type: 'man',
          position: { row: r, col: c },
        }
        board[r][c] = piece
        pieces.set(id, clonePiece(piece))
      }
    }
  }

  return {
    board,
    pieces,
    currentTurn: 'red',
    status: 'active',
    winner: null,
    moveHistory: [],
    selectedPiece: null,
  }
}

/**
 * Simple moves:
 * - man: only forward, 1 square
 * - king: any distance diagonally until blocked
 */
function generateSimpleMovesForPiece(board: (Piece | null)[][], piece: Piece): Move[] {
  const moves: Move[] = []

  if (piece.type === 'man') {
    const dirs =
      piece.color === 'red'
        ? ALL_DIRECTIONS.filter(d => d.dr < 0)
        : ALL_DIRECTIONS.filter(d => d.dr > 0)

    for (const { dr, dc } of dirs) {
      const to = { row: piece.position.row + dr, col: piece.position.col + dc }
      if (!inBounds(to)) continue
      if (board[to.row][to.col] === null) {
        moves.push({ from: { ...piece.position }, to, captures: [] })
      }
    }
    return moves
  }

  // Russian kings fly.
  for (const { dr, dc } of ALL_DIRECTIONS) {
    let r = piece.position.row + dr
    let c = piece.position.col + dc
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      if (board[r][c] !== null) break
      moves.push({
        from: { ...piece.position },
        to: { row: r, col: c },
        captures: [],
      })
      r += dr
      c += dc
    }
  }

  return moves
}

type CaptureOption = {
  captured: Position
  landing: Position
}

/**
 * Immediate capture options from a given position.
 * Russian rules:
 * - man captures forward/backward by jumping exactly 2 squares
 * - king captures any distance: must jump over one enemy piece and land on any empty square beyond it
 */
function getImmediateCaptureOptions(
  board: (Piece | null)[][],
  piece: Piece,
): CaptureOption[] {
  const options: CaptureOption[] = []

  if (piece.type === 'man') {
    for (const { dr, dc } of ALL_DIRECTIONS) {
      const mid = { row: piece.position.row + dr, col: piece.position.col + dc }
      const land = { row: piece.position.row + dr * 2, col: piece.position.col + dc * 2 }

      if (!inBounds(mid) || !inBounds(land)) continue

      const middlePiece = board[mid.row][mid.col]
      if (!middlePiece || middlePiece.color === piece.color) continue
      if (board[land.row][land.col] !== null) continue

      options.push({ captured: mid, landing: land })
    }
    return options
  }

  // King capture: any number of empty squares before the enemy, then any empty square after it.
  for (const { dr, dc } of ALL_DIRECTIONS) {
    let r = piece.position.row + dr
    let c = piece.position.col + dc

    while (inBounds({ row: r, col: c }) && board[r][c] === null) {
      r += dr
      c += dc
    }

    if (!inBounds({ row: r, col: c })) continue

    const firstPiece = board[r][c]
    if (!firstPiece || firstPiece.color === piece.color) continue

    const captured = { row: r, col: c }
    r += dr
    c += dc

    while (inBounds({ row: r, col: c }) && board[r][c] === null) {
      options.push({
        captured,
        landing: { row: r, col: c },
      })
      r += dr
      c += dc
    }
  }

  return options
}

type CaptureSequence = {
  to: Position
  captures: Position[]
}

/**
 * Generate all capture sequences for a single piece.
 * Promotion during a capture sequence is handled immediately:
 * if a man lands on the last row, it becomes a king and may continue capturing.
 */
function generateCaptureSequencesForPiece(board: (Piece | null)[][], piece: Piece): Move[] {
  const results: Move[] = []

  const dfs = (
    currentBoard: (Piece | null)[][],
    currentPiece: Piece,
    capturedSoFar: Position[],
    startPos: Position,
  ) => {
    const options = getImmediateCaptureOptions(currentBoard, currentPiece)

    if (options.length === 0) {
      if (capturedSoFar.length > 0) {
        results.push({
          from: { ...startPos },
          to: { ...currentPiece.position },
          captures: capturedSoFar,
        })
      }
      return
    }

    for (const option of options) {
      const nextBoard = cloneBoard(currentBoard)

      // Remove moving piece from its current square
      nextBoard[currentPiece.position.row][currentPiece.position.col] = null

      // Remove captured enemy
      nextBoard[option.captured.row][option.captured.col] = null

      const promotedType: PieceType =
        currentPiece.type === 'man' && isPromotionRow(currentPiece.color, option.landing.row)
          ? 'king'
          : currentPiece.type

      const movedPiece: Piece = {
        id: currentPiece.id,
        color: currentPiece.color,
        type: promotedType,
        position: { ...option.landing },
      }

      nextBoard[option.landing.row][option.landing.col] = movedPiece

      dfs(
        nextBoard,
        movedPiece,
        [...capturedSoFar, { ...option.captured }],
        startPos,
      )
    }
  }

  dfs(cloneBoard(board), clonePiece(piece), [], piece.position)

  return results
}

function getLegalMovesForColor(state: GameState, color: Color): Move[] {
  const captureMoves: Move[] = []
  const simpleMoves: Move[] = []

  for (const p of state.pieces.values()) {
    if (p.color !== color) continue

    const caps = generateCaptureSequencesForPiece(state.board, p)
    if (caps.length > 0) captureMoves.push(...caps)
    else simpleMoves.push(...generateSimpleMovesForPiece(state.board, p))
  }

  // Russian checkers: if any capture exists, only captures are legal.
  if (captureMoves.length > 0) {
    const maxCaptured = Math.max(...captureMoves.map(m => m.captures.length))
    return captureMoves.filter(m => m.captures.length === maxCaptured)
  }

  return simpleMoves
}

/** Return all valid moves for the current player. */
export function getAllValidMoves(state: GameState): Move[] {
  return getLegalMovesForColor(state, state.currentTurn)
}

/** Return all valid moves for a specific position. */
export function getValidMoves(state: GameState, position: Position): Move[] {
  const all = getAllValidMoves(state)
  return all.filter(m => posEq(m.from, position))
}

/** Check whether a man reaches promotion row. */
export function isKingPromotion(piece: Piece, move: Move): boolean {
  return piece.type === 'man' && isPromotionRow(piece.color, move.to.row)
}

/** Apply a move immutably and return new GameState. */
export function applyMove(state: GameState, move: Move): GameState {
  const newState = cloneState(state)

  const from = move.from
  const to = move.to
  const movingPiece = newState.board[from.row][from.col]
  if (!movingPiece) throw new Error('No piece at from position')

  for (const cap of move.captures) {
    const capPiece = newState.board[cap.row][cap.col]
    if (capPiece) newState.pieces.delete(capPiece.id)
    newState.board[cap.row][cap.col] = null
  }

  newState.board[from.row][from.col] = null

  const moved: Piece = clonePiece(movingPiece)
  moved.position = { row: to.row, col: to.col }

  if (isKingPromotion(moved, move)) {
    moved.type = 'king'
  }

  newState.board[to.row][to.col] = moved
  newState.pieces.set(moved.id, moved)

  newState.moveHistory = [...newState.moveHistory, move]
  newState.currentTurn = otherColor(newState.currentTurn)
  newState.selectedPiece = null

  const winner = checkWinner(newState)
  if (winner) {
    newState.status = 'ended'
    newState.winner = winner
  }

  return newState
}

/** Determine if the current player has lost. */
export function checkWinner(state: GameState): Color | null {
  const current = state.currentTurn

  let hasPiece = false
  for (const p of state.pieces.values()) {
    if (p.color === current) {
      hasPiece = true
      break
    }
  }
  if (!hasPiece) return otherColor(current)

  const moves = getLegalMovesForColor(state, current)
  if (moves.length === 0) return otherColor(current)

  return null
}

/** Evaluate board for `color`. Higher is better for `color`. */
export function evaluateBoard(
  state: GameState,
  color: Color,
  personality: Personality = 'tactical',
): number {
  let score = 0

  const MAN_VAL = 100
  const KING_VAL = 230

  for (const p of state.pieces.values()) {
    const v = p.type === 'man' ? MAN_VAL : KING_VAL
    score += p.color === color ? v : -v

    const advancement =
      p.color === 'red'
        ? BOARD_SIZE - 1 - p.position.row
        : p.position.row

    score += (p.color === color ? 1 : -1) * Math.min(20, advancement)
  }

  const myMoves = getLegalMovesForColor(state, color)
  const oppMoves = getLegalMovesForColor(state, otherColor(color))

  score += (myMoves.length - oppMoves.length) * 10

  const myCapturePotential = myMoves.filter(m => m.captures.length > 0).length
  const oppCapturePotential = oppMoves.filter(m => m.captures.length > 0).length

  const weights = {
    aggressive: { cap: 1.5, safe: 0.8 },
    defensive: { cap: 0.8, safe: 1.5 },
    tactical: { cap: 1.2, safe: 1.2 },
    random: { cap: 1.0, safe: 1.0 },
  } as Record<Personality, { cap: number; safe: number }>

  const w = weights[personality]
  score += (myCapturePotential - oppCapturePotential) * 50 * w.cap

  return score * w.safe
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  colorToMax: Color,
  personality: Personality,
): number {
  if (depth === 0 || state.status === 'ended') {
    return evaluateBoard(state, colorToMax, personality)
  }

  const moves = getAllValidMoves(state)
  if (moves.length === 0) return evaluateBoard(state, colorToMax, personality)

  if (maximizing) {
    let value = -Infinity
    for (const m of moves) {
      const next = applyMove(state, m)
      const v = minimax(next, depth - 1, alpha, beta, false, colorToMax, personality)
      value = Math.max(value, v)
      alpha = Math.max(alpha, v)
      if (alpha >= beta) break
    }
    return value
  } else {
    let value = Infinity
    for (const m of moves) {
      const next = applyMove(state, m)
      const v = minimax(next, depth - 1, alpha, beta, true, colorToMax, personality)
      value = Math.min(value, v)
      beta = Math.min(beta, v)
      if (alpha >= beta) break
    }
    return value
  }
}

/** Get best move for current player using minimax + alpha-beta. */
export function getBestMove(
  state: GameState,
  depth: number,
  personality: Personality = 'tactical',
): Move | null {
  const moves = getAllValidMoves(state)
  if (moves.length === 0) return null

  if (personality === 'random') {
    return moves[Math.floor(Math.random() * moves.length)] ?? null
  }

  const color = state.currentTurn
  let best: Move | null = null
  let bestVal = -Infinity

  for (const m of moves) {
    const next = applyMove(state, m)
    const val = minimax(next, depth - 1, -Infinity, Infinity, false, color, personality)
    if (val > bestVal) {
      bestVal = val
      best = m
    }
  }

  return best
}

// Exports for testing/consumption
export { generateCaptureSequencesForPiece, generateSimpleMovesForPiece }