/**
 * src/hooks/useGame.ts
 * Lightweight hook that exposes the game store to UI components.
 */

import useGameStore from '../store/gameStore'
import type { GameState, Move, Position } from '../lib/game/types'

export function useGame() {
  const state = useGameStore(s => s.state)
  const validMoves = useGameStore(s => s.validMoves)
  const selectPiece = useGameStore(s => s.selectPiece)
  const tryMoveTo = useGameStore(s => s.tryMoveTo)
  const applyMove = useGameStore(s => s.applyMove)
  const makeAIMove = useGameStore(s => s.makeAIMove)
  const init = useGameStore(s => s.init)

  return { state, validMoves, selectPiece, tryMoveTo, applyMove, makeAIMove, init }
}

export default useGame