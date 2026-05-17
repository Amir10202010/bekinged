"use client"
import React from 'react'

type Opponent = { id?: string; username: string; elo: number } | null

export default function MultiplayerControls({
  gameMode,
  setGameMode,
  matchState,
  onFindMatch,
  onCancelSearch,
  opponent,
}: {
  gameMode: 'ai' | 'multiplayer'
  setGameMode: (m: 'ai' | 'multiplayer') => void
  matchState: 'idle' | 'searching' | 'found' | 'playing'
  onFindMatch: () => void
  onCancelSearch: () => void
  opponent: Opponent
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <button onClick={() => { setGameMode('ai'); }} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer', border: `1px solid ${gameMode === 'ai' ? 'var(--accent)' : 'var(--border)'}`, color: gameMode === 'ai' ? 'var(--accent)' : 'var(--text-muted)', background: gameMode === 'ai' ? 'rgba(99,102,241,0.08)' : 'transparent' }}>vs AI</button>
        <button onClick={() => { setGameMode('multiplayer'); }} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer', border: `1px solid ${gameMode === 'multiplayer' ? 'var(--accent)' : 'var(--border)'}`, color: gameMode === 'multiplayer' ? 'var(--accent)' : 'var(--text-muted)', background: gameMode === 'multiplayer' ? 'rgba(99,102,241,0.08)' : 'transparent' }}>Multiplayer</button>
      </div>

      {gameMode === 'multiplayer' && (
        <div>
          {matchState === 'idle' && (
            <button onClick={onFindMatch} style={{ background: '#6366f1', color: 'white', width: '100%', padding: 10, borderRadius: 8, marginTop: 8 }}>Find Match</button>
          )}

          {matchState === 'searching' && (
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Searching for opponent<span className="ml-2">...</span></div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span className="h-2 w-2 rounded-full bg-white animate-pulse delay-75" />
                <span className="h-2 w-2 rounded-full bg-white animate-pulse delay-150" />
              </div>
              <button onClick={onCancelSearch} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '8px 12px', borderRadius: 8 }}>Cancel</button>
            </div>
          )}

          {matchState === 'playing' && opponent && (
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Opponent</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{opponent.username}</div>
              <div style={{ color: 'var(--text-muted)' }}>ELO: {opponent.elo}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
