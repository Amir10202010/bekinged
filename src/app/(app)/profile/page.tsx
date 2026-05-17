"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type Game = {
  id: string
  winnerId: string | null
  redUserId: string | null
  blackUserId: string | null
  moves: unknown[]
  eloChange?: number | null
  createdAt: string
}

type UserProfile = {
  id: string
  email: string
  username?: string | null
  elo: number
  wins: number
  losses: number
  streak?: number | null
  city?: string | null
  createdAt?: string
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [games, setGames] = useState<Game[] | null>(null)

  useEffect(() => {
    if (!loading && user?.email) {
      fetch(`/api/users/me?email=${encodeURIComponent(user.email)}`)
        .then(r => r.json())
        .then(setProfile)
        .catch(() => null)
    }
  }, [loading, user])

  useEffect(() => {
    if (!loading && user?.id) {
      fetch(`/api/games/history?userId=${encodeURIComponent(user.id)}`)
        .then(r => r.json())
        .then(setGames)
        .catch(() => setGames([]))
    }
  }, [loading, user])

  const eloData = useMemo(() => {
    if (!games || games.length === 0) return [{ game: 1, elo: 1000 }]
    let prev = 1000
    return games.map((g, i) => {
      const change = g.eloChange ?? (g.winnerId === user?.id ? 16 : -16)
      prev = prev + change
      return { game: i + 1, elo: prev }
    })
  }, [games, user?.id])

  if (loading || !user) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
  }

  return (
    <div>
      {/* Hero карточка */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 32, display: 'flex', gap: 24, alignItems: 'center'
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 9999,
          background: '#6366f1', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'white', fontSize: 36, fontWeight: 700,
          flexShrink: 0,
        }}>
          {user.email?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
            {profile?.username ?? user.email?.split('@')[0]}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            {user.email}
          </div>
          <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
            Member since {profile?.createdAt
              ? new Date(profile.createdAt).toLocaleDateString(undefined, {
                  month: 'long', day: 'numeric', year: 'numeric'
                })
              : '—'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
            {profile?.city
              ? `📍 ${profile.city}`
              : <a href="/settings" style={{ color: '#6366f1' }}>
                  Set your city in Settings →
                </a>}
          </div>
        </div>
      </div>

      {/* Статы */}
      <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
          {[
            { label: 'Rating', value: profile?.elo ?? '...', color: '#6366f1' },
            { label: 'Wins', value: profile?.wins ?? 0, color: '#10b981' },
            { label: 'Losses', value: profile?.losses ?? 0, color: '#ef4444' },
            { label: 'Day Streak 🔥', value: profile?.streak ?? 0, color: '#f59e0b' },
          ].map(({ label, value, color }) => (
          <div key={label} style={{
            flex: 1, background: 'var(--bg-surface)',
            border: '1px solid var(--border)', borderRadius: 12,
            padding: 20, textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ELO График */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 20, marginTop: 24,
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
          ELO Progress
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={eloData}>
            <XAxis dataKey="game" stroke="#475569" tick={{ fontSize: 12 }} />
            <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: '#161b27', border: '1px solid #2a3245', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#6366f1' }}
            />
            <Line
              type="monotone" dataKey="elo"
              stroke="#6366f1" strokeWidth={2} dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* История игр */}
      <div style={{ marginTop: 24 }}>
        <div style={{
          fontSize: 18, fontWeight: 600, color: 'var(--text-primary)',
          borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16,
        }}>
          Recent Games
        </div>

        {games === null ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : games.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 48 }}>♟</div>
            <div style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 12 }}>
              No games yet
            </div>
            <div style={{ fontSize: 14, color: '#475569', marginTop: 8 }}>
              Play your first game to see history
            </div>
          </div>
        ) : (
          <div>
            {games.slice(0, 10).map(g => {
              const win = g.winnerId === user.id
              const movesCount = Array.isArray(g.moves) ? g.moves.length : 0
              const date = new Date(g.createdAt).toLocaleDateString(undefined, {
                month: 'long', day: 'numeric', year: 'numeric'
              })
              const eloChange = g.eloChange

              return (
                <div key={g.id} style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '14px 20px', marginBottom: 8,
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                    background: win ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: win ? '#10b981' : '#ef4444', minWidth: 28, textAlign: 'center',
                  }}>
                    {win ? 'W' : 'L'}
                  </div>

                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                    {g.blackUserId === 'AI' || !g.blackUserId ? 'vs BEKINGED AI' : `vs ${g.blackUserId}`}
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {movesCount} moves
                  </div>

                  {eloChange != null && (
                    <div style={{
                      fontSize: 13, fontWeight: 600,
                      color: eloChange >= 0 ? '#10b981' : '#ef4444',
                    }}>
                      {eloChange >= 0 ? `+${eloChange}` : eloChange} ELO
                    </div>
                  )}

                  <div style={{ marginLeft: 'auto', fontSize: 13, color: '#475569' }}>
                    {date}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}