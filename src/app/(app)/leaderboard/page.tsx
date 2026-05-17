"use client"
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'

type Player = {
  id: string
  username: string | null
  email: string
  elo: number
  wins: number
  losses: number
  city?: string | null
  streak?: number | null
}

export default function LeaderboardPage() {
  const { user, loading } = useAuth()
  const [players, setPlayers] = useState<Player[] | null>(null)
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [tab, setTab] = useState<'global'|'city'>('global')

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => setPlayers(data))
      .catch(() => setPlayers([]))
  }, [])

  useEffect(() => {
    if (!loading && user?.email) {
      fetch(`/api/users/me?email=${encodeURIComponent(user.email)}`).then(r => r.json()).then(d => setProfile(d)).catch(() => setProfile(null))
    }
  }, [user, loading])

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>🏆 Leaderboard</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Top players ranked by ELO rating</div>
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            <button onClick={() => setTab('global')} style={{ padding: '8px 12px', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, background: tab === 'global' ? '#6366f1' : 'var(--bg-elevated)', color: tab === 'global' ? 'var(--text-primary)' : 'var(--text-muted)', border: '1px solid var(--border)' }}>Global</button>
            <button onClick={() => setTab('city')} style={{ padding: '8px 12px', borderTopRightRadius: 8, borderBottomRightRadius: 8, background: tab === 'city' ? '#6366f1' : 'var(--bg-elevated)', color: tab === 'city' ? 'var(--text-primary)' : 'var(--text-muted)', border: '1px solid var(--border)' }}>My City</button>
          </div>
        </div>
      </div>

      {players && players.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No players yet. Be the first!</div>
      )}

      {!players ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : (
        (() => {
          const list = tab === 'global' ? players : (players || []).filter(p => p.city && profile?.city && p.city === profile.city)
          if (tab === 'city' && (!profile || !profile.city)) {
            return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Set your city in Settings to see local rankings</div>
          }
          return (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
          <thead>
            <tr style={{ textTransform: 'uppercase', fontSize: 11, color: 'var(--text-muted)' }}>
              <th style={{ textAlign: 'left', padding: '8px 16px' }}>#</th>
              <th style={{ textAlign: 'left', padding: '8px 16px' }}>Player</th>
              <th style={{ textAlign: 'left', padding: '8px 16px' }}>ELO</th>
              <th style={{ textAlign: 'left', padding: '8px 16px' }}>W</th>
              <th style={{ textAlign: 'left', padding: '8px 16px' }}>L</th>
              <th style={{ textAlign: 'left', padding: '8px 16px' }}>Win Rate</th>
              <th style={{ textAlign: 'left', padding: '8px 16px' }}>🔥 Streak</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p, idx) => {
              const wins = p.wins ?? 0
              const losses = p.losses ?? 0
              const games = wins + losses
              const winRate = games === 0 ? '—' : `${Math.round((wins / games) * 100)}%`
              const place = idx + 1
              const placeIcon = place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : String(place)
              return (
                <tr key={p.id} style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: 14, marginBottom: 8 }}>
                  <td style={{ padding: '14px 16px', width: 40, color: 'var(--text-muted)' }}>{placeIcon}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9999, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontSize: 13 }}>{(p.username || p.email[0] || '?').toString()[0].toUpperCase()}</div>
                      <div>
                        <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{p.username ?? p.email.split('@')[0]}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#6366f1', fontWeight: 600 }}>{p.elo}</td>
                  <td style={{ padding: '14px 16px', color: '#10b981' }}>{p.wins}</td>
                  <td style={{ padding: '14px 16px', color: '#ef4444' }}>{p.losses}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{winRate}</td>
                  <td style={{ padding: '14px 16px', color: '#f59e0b' }}>{p.streak ?? 0}</td>
                </tr>
              )
            })}
          </tbody>
          </table>
        )
        })()
      )}
    </div>
  )
}
