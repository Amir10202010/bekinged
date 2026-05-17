"use client"
import React, { useEffect, useState, useRef } from 'react'
import GameBoard from '../../../components/game/GameBoard'
import { useGame } from '../../../hooks/useGame'
import { useAuth } from '../../../hooks/useAuth'
import { connectSocket, getSocket, disconnectSocket } from '@/lib/socket'
import type { Move, Position } from '../../../lib/game/types'
import { analyzeGame } from '@/lib/analysis'

export default function Page() {
  const { state, validMoves, selectPiece, tryMoveTo, applyMove, makeAIMove, init } = useGame()
  const { user } = useAuth()

  // multiplayer state
  const [gameMode, setGameMode] = useState<'ai' | 'multiplayer'>('ai')
  const [matchState, setMatchState] = useState<'idle' | 'searching' | 'found' | 'playing' | 'ended'>('idle')
  const [myColor, setMyColor] = useState<'red' | 'black'>('red')
  const [roomId, setRoomId] = useState<string | null>(null)
  const [opponentInfo, setOpponentInfo] = useState<{ id: string; username: string; elo: number } | null>(null)
  const [showMatchFound, setShowMatchFound] = useState(false)
  const [matchCountdown, setMatchCountdown] = useState(3)
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(60)
  const [opponentDisconnected, setOpponentDisconnected] = useState(false)
  const [disconnectCountdown, setDisconnectCountdown] = useState<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const gameSaved = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const disconnectTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const s = getSocket()

    // if user had an active session, ask server to reconnect them
    if (user) {
      s.connect()
      s.emit('player:reconnect', { userId: user.id })
    }

    const onMatchFound = (payload: { roomId: string; color: 'red' | 'black'; opponent: { id: string; username: string; elo: number } }) => {
      setRoomId(payload.roomId)
      setMyColor(payload.color)
      setOpponentInfo(payload.opponent)
      setShowMatchFound(true)
      setMatchState('found')
      init()
      setMatchCountdown(3)
      // countdown for the modal
      const cd = setInterval(() => {
        setMatchCountdown(prev => {
          if (prev <= 1) {
            clearInterval(cd)
            setShowMatchFound(false)
            setMatchState('playing')
            startTimeRef.current = Date.now()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      // auto-clear after 3s as a safety
      setTimeout(() => {
        setShowMatchFound(false)
        setMatchState('playing')
      }, 3000)
    }

    const onGameMove = (payload: { move: unknown; gameState: unknown; currentTurn?: 'red' | 'black' }) => {
      try {
        // apply only if now it's not our turn (i.e., opponent moved)
        if (state.currentTurn !== myColor) {
          const move = payload.move as unknown as Move
          if (move) applyMove(move)
        }
      } catch (e) {
        console.warn('applyMove failed', e)
      }
    }

    const onGameTimeout = (payload: { loserColor: string; winnerColor: string; loserId: string; winnerId: string; reason?: string }) => {
      setMatchState('ended')
      if (user && !gameSaved.current) {
        gameSaved.current = true
        const userWon = payload.winnerId === user.id
        fetch('/api/games/save', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userWon, redUserId: user.id, moves: state.moveHistory, difficulty: null, mode: 'multiplayer' })
        }).catch(() => {})
      }
    }

    const onOppDisconnected = (payload?: { reconnectWindowMs?: number }) => {
      setOpponentDisconnected(true)
      const ms = payload?.reconnectWindowMs ?? 60000
      setDisconnectCountdown(Math.floor(ms / 1000))
      // start local countdown
      if (disconnectTimerRef.current) clearInterval(disconnectTimerRef.current)
      disconnectTimerRef.current = setInterval(() => {
        setDisconnectCountdown(prev => {
          if (!prev || prev <= 1) {
            if (disconnectTimerRef.current) clearInterval(disconnectTimerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    const onOppReconnected = () => {
      setOpponentDisconnected(false)
      setDisconnectCountdown(null)
      if (disconnectTimerRef.current) clearInterval(disconnectTimerRef.current)
    }

    const onGameReconnected = (payload: { roomId: string; color: 'red' | 'black'; currentTurn: 'red' | 'black'; opponent: { id: string; username: string; elo: number } }) => {
      setRoomId(payload.roomId)
      setMyColor(payload.color)
      setOpponentInfo(payload.opponent)
      setMatchState('playing')
    }

    const onAlreadyInGame = () => {
      alert('You already have an active game!')
    }

    s.on('match:found', onMatchFound)
    s.on('game:move', onGameMove)
    s.on('game:timeout', onGameTimeout)
    s.on('opponent:disconnected', onOppDisconnected)
    s.on('opponent:reconnected', onOppReconnected)
    s.on('game:reconnected', onGameReconnected)
    s.on('error:already_in_game', onAlreadyInGame)

    return () => {
      s.off('match:found', onMatchFound)
      s.off('game:move', onGameMove)
      s.off('game:timeout', onGameTimeout)
      s.off('opponent:disconnected', onOppDisconnected)
      s.off('opponent:reconnected', onOppReconnected)
      s.off('game:reconnected', onGameReconnected)
      s.off('error:already_in_game', onAlreadyInGame)
      if (timerRef.current) clearInterval(timerRef.current)
      if (disconnectTimerRef.current) clearInterval(disconnectTimerRef.current)
    }
  }, [applyMove, init, myColor, state.currentTurn, state.moveHistory, user])

  
  const [aiThinking, setAiThinking] = useState(false)

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [gameStarted, setGameStarted] = useState(true)

  useEffect(() => {
    init()
  }, [init])

  

  const handlePieceClick = (pos: Position) => {
    if (aiThinking || !gameStarted) return
    selectPiece(pos)
  }

  const handleSquareClick = (pos: Position) => {
    if (aiThinking || !gameStarted) return

    // Block clicks in multiplayer if not our turn or disconnected
    const boardDisabled =
      (gameMode === 'multiplayer' && state.currentTurn !== myColor) ||
      matchState === 'searching' ||
      state.status === 'ended' ||
      opponentDisconnected
    if (gameMode === 'multiplayer' && boardDisabled) return

    const moved = tryMoveTo(pos)
    if (moved) {
      if (gameMode === 'ai') {
        setAiThinking(true)
        const depth = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6
        const personality = difficulty === 'easy' ? 'random' : difficulty === 'medium' ? 'tactical' : 'aggressive'
        setTimeout(() => { makeAIMove(depth, personality as 'random' | 'tactical' | 'aggressive'); setAiThinking(false) }, 400)
      } else if (gameMode === 'multiplayer') {
        try {
          const s = getSocket()
          const last = state.moveHistory[state.moveHistory.length - 1]
          if (s && roomId && last) s.emit('game:move', { roomId, move: last, gameState: state, color: myColor })
        } catch (e) { console.warn('emit game:move failed', e) }
      }
    }
  }

  const redCount = Array.from(state.pieces.values()).filter(p => p.color === 'red').length
  const blackCount = Array.from(state.pieces.values()).filter(p => p.color === 'black').length
  const recent = state.moveHistory.slice(-10)
  const lastMove = state.moveHistory.length > 0 ? state.moveHistory[state.moveHistory.length - 1] : undefined

  // Turn timer effect (client-side visual)
  useEffect(() => {
    if (gameMode !== 'multiplayer' || matchState !== 'playing') return
    if (state.currentTurn === myColor) {
      setTurnTimeLeft(60)
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setTurnTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state.currentTurn, gameMode, matchState, myColor])

  useEffect(() => {
    if (state.status === 'ended' && user && !gameSaved.current) {
      gameSaved.current = true
      const userWon = state.winner === 'red'
      const duration = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0
      fetch('/api/games/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userWon, redUserId: user.id, blackUserId: gameMode === 'multiplayer' ? opponentInfo?.id : undefined, moves: state.moveHistory, difficulty: gameMode === 'multiplayer' ? null : (difficulty ?? 'medium'), mode: gameMode, duration })
      }).then(r => r.json()).then(data => { if (data.eloChange) console.log('ELO changed:', data.eloChange) }).catch(() => {})
    }
  }, [state.status, user, difficulty, gameMode, opponentInfo?.id, state.moveHistory, state.winner])

  const newGame = () => { gameSaved.current = false; init(); setGameStarted(true); startTimeRef.current = Date.now() }

    const displayName =
    user
        ? (user.user_metadata?.username ??
        user.email?.split('@')[0] ??
        'Player')
        : 'Guest';
  return (
    <div style={{ minHeight: '100vh', padding: 24, background: 'var(--bg-base)' }}>
      {/* Opponent Bar */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#374151', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>A</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{gameMode === 'ai' ? 'BEKINGED AI' : opponentInfo?.username ?? 'Waiting...'}</div>
        {gameMode === 'multiplayer' && opponentInfo && (
          <div style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>ELO {opponentInfo.elo}</div>
        )}
        {gameMode === 'ai' && (
          <div style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 4, background: difficulty === 'easy' ? 'rgba(16,185,129,0.1)' : difficulty === 'medium' ? 'rgba(99,102,241,0.1)' : 'rgba(239,68,68,0.1)', color: difficulty === 'easy' ? '#10b981' : difficulty === 'medium' ? '#6366f1' : '#ef4444' }}>
            {difficulty === 'easy' ? 'Easy' : difficulty === 'medium' ? 'Medium' : 'Hard'}
          </div>
        )}
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>⚫ {blackCount} pieces</div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* GAME BOARD (center) */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative' }}>
            <GameBoard
              state={state}
              validMoves={validMoves}
              selectedPiece={state.selectedPiece}
              onPieceClick={handlePieceClick}
              onSquareClick={handleSquareClick}
              lastMove={lastMove ?? undefined}
              disabled={(
                aiThinking || !gameStarted || (gameMode === 'multiplayer' && (
                  state.currentTurn !== myColor || matchState === 'searching' || opponentDisconnected || state.status === 'ended'
                ))
              )}
            />

            {/* End-game modal (overlay) */}
            {state.status === 'ended' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,15,20,0.92)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, zIndex: 20 }}>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 40, textAlign: 'center', maxWidth: 380 }}>
                  {state.winner === 'red' ? (
                    <>
                      <div style={{ fontSize: 64 }}>🏆</div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981', marginTop: 16 }}>You Won!</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 64 }}>💀</div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: '#ef4444', marginTop: 16 }}>You Lost</div>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 18 }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{state.moveHistory.length}</div>
                      Moves
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{state.moveHistory.reduce((acc, m) => acc + (m.captures?.length || 0), 0)}</div>
                      Captures
                    </div>
                  </div>

                  {/* Analysis */}
                  {state.moveHistory.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: 20, paddingTop: 20, textAlign: 'left' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Game Analysis</div>
                      {analyzeGame(state.moveHistory, state.winner, 'red').map((ins, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                          <div style={{ fontSize: 18 }}>{ins.type === 'good' ? '✅' : ins.type === 'warning' ? '⚠️' : '💡'}</div>
                          <div style={{ fontSize: 13, color: ins.type === 'good' ? '#10b981' : ins.type === 'warning' ? '#f59e0b' : 'var(--text-muted)' }}>{ins.text}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 22 }}>
                    <button onClick={() => newGame()} style={{ background: '#6366f1', color: 'white', padding: '12px 32px', borderRadius: 10, fontSize: 15, fontWeight: 700 }}>Play Again</button>
                    <button onClick={() => { newGame(); }} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '12px 32px', borderRadius: 10, fontSize: 15 }}>Change Difficulty</button>
                  </div>
                </div>
              </div>
            )}

            {/* Match Found modal */}
            {showMatchFound && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,15,20,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, zIndex: 25 }}>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, textAlign: 'center', width: 420 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Match Found</div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>Opponent</div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: '#374151', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{(opponentInfo?.username ?? 'O')[0]?.toUpperCase()}</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{opponentInfo?.username ?? 'Opponent'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ELO: {opponentInfo?.elo ?? 1000}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>Starting in <span style={{ fontWeight: 800 }}>{matchCountdown}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <aside style={{ width: 240, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          {/* Mode selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
            <button onClick={() => { setGameMode('ai'); setMatchState('idle') }} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, background: gameMode === 'ai' ? 'var(--accent)' : 'transparent', color: gameMode === 'ai' ? 'var(--text-primary)' : 'var(--text-muted)', border: '1px solid var(--border)' }}>vs AI</button>
            <button onClick={() => { setGameMode('multiplayer'); }} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, background: gameMode === 'multiplayer' ? 'var(--accent)' : 'transparent', color: gameMode === 'multiplayer' ? 'var(--text-primary)' : 'var(--text-muted)', border: '1px solid var(--border)' }}>Online</button>
          </div>

          {opponentDisconnected && (
            <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', color: '#f59e0b' }}>
              Opponent disconnected — auto-win in {disconnectCountdown ?? 0}s
            </div>
          )}

          {/* Difficulty / New Game */}
          {gameMode === 'ai' && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <button onClick={() => setDifficulty('easy')} style={{ padding: '6px 8px', borderRadius: 6, border: `1px solid ${difficulty === 'easy' ? 'var(--success)' : 'var(--border)'}`, color: difficulty === 'easy' ? 'var(--success)' : 'var(--text-muted)' }}>Easy</button>
                <button onClick={() => setDifficulty('medium')} style={{ padding: '6px 8px', borderRadius: 6, border: `1px solid ${difficulty === 'medium' ? 'var(--accent)' : 'var(--border)'}`, color: difficulty === 'medium' ? 'var(--accent)' : 'var(--text-muted)' }}>Medium</button>
                <button onClick={() => setDifficulty('hard')} style={{ padding: '6px 8px', borderRadius: 6, border: `1px solid ${difficulty === 'hard' ? 'var(--danger)' : 'var(--border)'}`, color: difficulty === 'hard' ? 'var(--danger)' : 'var(--text-muted)' }}>Hard</button>
              </div>
            </div>
          )}

          <button onClick={() => newGame()} style={{ width: '100%', padding: 10, background: 'var(--accent)', color: 'white', borderRadius: 8, border: 'none', fontWeight: 700, marginBottom: 12 }}>New Game</button>

          {gameMode === 'multiplayer' && (
            <div style={{ marginBottom: 12 }}>
              {matchState === 'searching' ? (
                <button onClick={() => {
                  const s = getSocket()
                  s.emit('queue:leave')
                  disconnectSocket()
                  setMatchState('idle')
                }} style={{ width: '100%', padding: 10, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)' }}>Cancel Search</button>
              ) : matchState === 'playing' ? (
                <button onClick={() => {
                  const s = getSocket()
                  s.emit('queue:leave')
                  disconnectSocket()
                  setMatchState('idle')
                  setRoomId(null)
                  setOpponentInfo(null)
                  init()
                }} style={{ width: '100%', padding: 10, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)' }}>Leave Game</button>
              ) : (
                <button onClick={() => {
                    if (!user) return alert('Sign in to use multiplayer')
                    const s = connectSocket()
                    const elo = (user.user_metadata as any)?.elo ?? 1000;
                    s.emit('queue:join', {
                    userId: user.id,
                    username: user.email ?? 'guest',
                    elo,
                    });                  
                    setMatchState('searching')
                }} style={{ width: '100%', padding: 10, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}>Find Match</button>
              )}
            </div>
          )}

          {/* Game Status */}
          {state.status !== 'ended' && (
            <div style={{ marginBottom: 12 }}>
              {gameMode === 'multiplayer' ? (
                state.currentTurn === myColor ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 9999, background: '#ef4444', display: 'inline-block', boxShadow: '0 0 6px rgba(239,68,68,0.6)', animation: 'pulse 1.2s infinite' }} />
                      <div>Your turn</div>
                    </div>
                    <div style={{ height: 8, background: '#111827', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#ef4444', width: `${(turnTimeLeft/60)*100}%`, transition: 'width 250ms linear' }} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{turnTimeLeft}s</div>
                  </div>
                ) : (
                  <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Waiting for opponent...</div>
                )
              ) : (
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>AI thinking<span style={{ display: 'inline-block', marginLeft: 6 }}>…</span></div>
              )}
            </div>
          )}

          {/* Score */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>You: {redCount}</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-muted)' }}>AI: {blackCount}</div>
            </div>
          </div>

          {/* Move History */}
          <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Moves</div>
            {recent.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>No moves yet</div>
            ) : (
              recent.map((m, idx) => {
                const globalIndex = state.moveHistory.length - recent.length + idx + 1
                const bg = idx % 2 === 0 ? 'var(--bg-elevated)' : 'transparent'
                return (
                  <div key={`${m.from.row}-${m.from.col}-${idx}`} style={{ fontFamily: 'monospace', fontSize: 12, padding: '6px', background: bg }}>
                    {globalIndex}. ({m.from.row},{m.from.col})→({m.to.row},{m.to.col})
                  </div>
                )
              })
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Moves</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{state.moveHistory.length}</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Captures</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{state.moveHistory.reduce((acc, m) => acc + (m.captures?.length || 0), 0)}</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Status</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{state.status}</div>
            </div>
          </div>
        </aside>
      </div>

      {/* Player Bar */}
      <div style={{ marginTop: 12 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9999, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16 }}>{user?.email?.[0]?.toUpperCase() ?? '?'}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{displayName}</div>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>🔴 {redCount} pieces</div>
        </div>
      </div>
    </div>
  )
}
