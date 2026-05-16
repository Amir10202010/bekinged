"use client"
import React, { useEffect, useState } from 'react'
import GameBoard from '../../components/game/GameBoard'
import { useGame } from '../../hooks/useGame'
import type { Move, Position } from '../../lib/game/types'

export default function Page() {
  const { state, validMoves, selectPiece, tryMoveTo, makeAIMove, init } = useGame()
  const [lastMove, setLastMove] = useState<Move | null>(null)
  const [aiThinking, setAiThinking] = useState(false)

  useEffect(() => {
    init()
  }, [init])

  // Update lastMove when history changes
  useEffect(() => {
    if (state.moveHistory.length > 0) {
      setLastMove(state.moveHistory[state.moveHistory.length - 1])
    }
  }, [state.moveHistory.length])

  const handlePieceClick = (pos: Position) => {
    if (aiThinking) return
    selectPiece(pos)
  }

  const handleSquareClick = (pos: Position) => {
    if (aiThinking) return
    const moved = tryMoveTo(pos)
    if (moved) {
      setAiThinking(true)
      setTimeout(() => {
        makeAIMove(4, 'tactical')
        setAiThinking(false)
      }, 400)
    }
  }

  const redCount = Array.from(state.pieces.values()).filter(p => p.color === 'red').length
  const blackCount = Array.from(state.pieces.values()).filter(p => p.color === 'black').length

  const recent = state.moveHistory.slice(-5)

  return (
    <div style={{ background: '#0d0f14', minHeight: '100vh' }} className="flex items-center justify-center p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div>
          <GameBoard
            state={state}
            validMoves={validMoves}
            selectedPiece={state.selectedPiece}
            onPieceClick={handlePieceClick}
            onSquareClick={handleSquareClick}
            lastMove={lastMove ?? undefined}
            disabled={aiThinking}
          />
        </div>

        <aside style={{ width: 200 }} className="bg-[#161b27] rounded-xl p-5 border border-[#2a3245]">
          <div className="mb-4">
            {state.status === 'ended' ? (
              state.winner === 'red' ? (
                <div className="text-green-400 font-semibold">You won! 🏆</div>
              ) : (
                <div className="text-red-400 font-semibold">AI wins 🤖</div>
              )
            ) : state.currentTurn === 'red' ? (
              <div className="flex items-center text-white font-semibold">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2 pulse" />
                Your turn
              </div>
            ) : (
              <div className="text-gray-400 font-medium">AI thinking...</div>
            )}
          </div>

          <div className="mb-4 text-sm text-[#94a3b8]">
            <div>🔴 Your pieces: <span className="text-white ml-2">{redCount}</span></div>
            <div>⚫ AI pieces: <span className="text-white ml-2">{blackCount}</span></div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-[#94a3b8] mb-2">Move History</div>
            <div style={{ maxHeight: 120, overflowY: 'auto' }}>
              {recent.length === 0 ? (
                <div className="text-sm text-[#475569]">No moves yet</div>
              ) : (
                recent.map((m, idx) => {
                  const globalIndex = state.moveHistory.length - recent.length + idx + 1
                  return (
                    <div key={`${m.from.row}-${m.from.col}-${idx}`} className="text-sm text-white">
                      Move {globalIndex}: ({m.from.row},{m.from.col})→({m.to.row},{m.to.col})
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <button
            onClick={() => init()}
            className="w-full text-left"
            style={{ background: '#1e2535', border: '1px solid #2a3245', color: '#94a3b8', borderRadius: 8, padding: '10px 20px' }}
            onMouseOver={e => (e.currentTarget.style.borderColor = '#6366f1')}
            onMouseOut={e => (e.currentTarget.style.borderColor = '#2a3245')}
          >
            Reset
          </button>
        </aside>
      </div>
    </div>
  )
}
