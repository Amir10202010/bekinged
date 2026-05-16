/**
 * src/lib/game/types.ts
 * Shared types for the checkers engine and UI.
 */

/** Board size (8x8 standard) */
export const BOARD_SIZE = 8

export type Color = 'red' | 'black'
export type PieceType = 'man' | 'king'

export interface Position { row: number; col: number }
export interface Piece { id: string; color: Color; type: PieceType; position: Position }
export interface Move { from: Position; to: Position; captures: Position[] }

export interface GameState {
  board: (Piece | null)[][]
  pieces: Map<string, Piece>
  currentTurn: Color
  status: 'active' | 'ended'
  winner: Color | null
  moveHistory: Move[]
  selectedPiece: Position | null
}

export type Personality = 'aggressive' | 'defensive' | 'tactical' | 'random'