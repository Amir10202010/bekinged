"use client"
import React from 'react'
import type { Piece as PieceType } from '../../lib/game/types'

interface Props {
  piece: PieceType
  selected?: boolean
}

/**
 * Presentational `Piece` component.
 * - purely visual (no click handling here)
 */
export default function Piece({ piece, selected = false }: Props) {
  const isRed = piece.color === 'red'
  const bg = isRed
    ? 'linear-gradient(145deg, #ef4444, #b91c1c)'
    : 'linear-gradient(145deg, #94a3b8, #334155)'

  const style: React.CSSProperties = {
    width: '75%',
    height: '75%',
    borderRadius: '50%',
    background: bg,
    boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s ease',
    transform: selected ? 'scale(1.1)' : 'none',
    outline: selected ? '3px solid #facc15' : 'none',
    outlineOffset: selected ? '2px' : undefined,
  }

  return (
    <div aria-hidden style={style}>
      {piece.type === 'king' && (
        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>♛</span>
      )}
    </div>
  )
}
