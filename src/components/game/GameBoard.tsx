"use client"
import React from 'react'
import type { GameState, Position, Move } from '../../lib/game/types'
// framer-motion not used here
import Piece from './Piece'

interface Props {
  state: GameState
  validMoves: Move[]
  selectedPiece?: Position | null
  onPieceClick: (pos: Position) => void
  onSquareClick: (pos: Position) => void
  lastMove?: Move | null
  disabled?: boolean
}

function posKey(p: Position) {
  return `${p.row},${p.col}`
}

export default function GameBoard({ state, validMoves, selectedPiece, onPieceClick, onSquareClick, lastMove = null, disabled = false }: Props) {
  const highlights = new Set(validMoves.map(m => posKey(m.to)))

  const cells: { r: number; c: number }[] = []
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) cells.push({ r, c })

  return (
    <div
      style={{ display: 'inline-block', borderRadius: 12, overflow: 'hidden', border: '2px solid var(--border)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
    >
      <div
        className="grid"
        style={{
          position: 'relative',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gridTemplateRows: 'repeat(8, 1fr)',
          width: 'min(480px, calc(100vw - 32px))',
          height: 'min(480px, calc(100vw - 32px))',
        }}
      >
        {cells.map(({ r, c }) => {
          const isDark = (r + c) % 2 === 1
          const piece = state.board[r][c]
          const key = `${r}-${c}`
          const highlighted = highlights.has(`${r},${c}`)
          const isLast = lastMove && ((lastMove.from.row === r && lastMove.from.col === c) || (lastMove.to.row === r && lastMove.to.col === c))

          const baseBg = isDark ? 'var(--board-dark)' : 'var(--board-light)'
          const hoverBg = isDark ? 'var(--board-dark)' : undefined
          const highlightBg = highlighted ? 'var(--board-highlight)' : null
          const lastBg = isLast ? 'rgba(250,204,21,0.15)' : null

          const bg = lastBg ?? highlightBg ?? baseBg

          return (
            <div
              key={key}
              onClick={() => { if (!disabled) onSquareClick({ row: r, col: c }) }}
              className={`flex items-center justify-center ${isDark ? 'cursor-pointer' : ''}`}
              style={{
                background: bg as string,
                width: '100%',
                height: '100%',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => { if (!disabled && hoverBg) (e.currentTarget as HTMLElement).style.background = hoverBg }}
              onMouseLeave={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.background = (lastBg ?? (highlighted ? 'var(--board-highlight)' : baseBg)) as string }}
            >
              {highlighted && !piece && (
                <div style={{ width: 12, height: 12, borderRadius: 9999, background: 'var(--board-highlight)' }} />
              )}

              {piece && (
                <div
                  onClick={(e) => { e.stopPropagation(); if (!disabled) onPieceClick(piece.position) }}
                  style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Piece piece={piece} selected={selectedPiece ? selectedPiece.row === r && selectedPiece.col === c : false} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}