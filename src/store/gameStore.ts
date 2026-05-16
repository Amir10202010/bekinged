import { create } from 'zustand'
import type { GameState, Move, Position, Personality } from '../lib/game/types'
import {
  initGame as engineInit,
  getValidMoves as engineGetValidMoves,
  applyMove as engineApplyMove,
  getBestMove as engineGetBestMove,
} from '../lib/game/gameEngine'

interface GameStore {
  state: GameState
  validMoves: Move[]
  init: () => void
  selectPiece: (pos: Position | null) => void
  tryMoveTo: (pos: Position) => boolean
  applyMove: (move: Move) => void
  makeAIMove: (depth: number, personality?: Personality) => void
  reset: () => void
}

const useGameStore = create<GameStore>((set, get) => ({
  state: engineInit(),
  validMoves: [],

  init: () => set({ state: engineInit(), validMoves: [] }),

  selectPiece: (pos) => {
    const st = get().state
    if (pos === null) {
      set({ state: { ...st, selectedPiece: null }, validMoves: [] })
      return
    }

    const moves = engineGetValidMoves(st, pos)
    set({ state: { ...st, selectedPiece: pos }, validMoves: moves })
  },

  tryMoveTo: (pos) => {
    const st = get().state
    const sel = st.selectedPiece
    if (!sel) return false

    const moves = get().validMoves.filter(
      m => m.from.row === sel.row && m.from.col === sel.col,
    )
    const mv = moves.find(m => m.to.row === pos.row && m.to.col === pos.col)
    if (!mv) return false

    const newState = engineApplyMove(st, mv)
    set({ state: newState, validMoves: [] })
    return true
  },

  applyMove: (mv) => {
    const s = get().state
    const newState = engineApplyMove(s, mv)
    set({ state: newState, validMoves: [] })
  },

  makeAIMove: (depth, personality = 'tactical') => {
    const s = get().state
    const best = engineGetBestMove(s, depth, personality)
    if (best) {
      const newState = engineApplyMove(s, best)
      set({ state: newState, validMoves: [] })
    }
  },

  reset: () => set({ state: engineInit(), validMoves: [] }),
}))

export default useGameStore