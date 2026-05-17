"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../hooks/useAuth'

type UserProfile = { elo?: number; wins?: number; streak?: number; username?: string }

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (user?.email) {
      fetch(`/api/users/me?email=${encodeURIComponent(user.email)}`).then(r => r.json()).then(d => setProfile(d)).catch(() => setProfile(null))
    }
  }, [user])

  const username = profile?.username ?? (user?.email ? user.email.split('@')[0] : 'Player')

  const hours = new Date().getHours()
  const greeting = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{greeting}, {username}! 👋</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>Ready for your daily challenge?</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <div onClick={() => router.push('/play')} style={{ flex: 1, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, padding: 24, cursor: 'pointer', color: 'white', transition: 'transform 0.2s' }}>
          <div style={{ fontSize: 32 }}>⚔️</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>Play Now</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>Start a new game</div>
        </div>

        <div onClick={() => router.push('/puzzles')} style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, cursor: 'pointer' }}>
          <div style={{ fontSize: 32 }}>🧩</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 12, color: 'var(--text-primary)' }}>Daily Puzzle</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Solve today&apos;s challenge</div>
        </div>

        <div onClick={() => router.push('/leaderboard')} style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, cursor: 'pointer' }}>
          <div style={{ fontSize: 32 }}>🏆</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 12, color: 'var(--text-primary)' }}>Leaderboard</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>See your ranking</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <div style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>ELO</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#6366f1' }}>{profile?.elo ?? '...'}</div>
        </div>
        <div style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Wins</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>{profile?.wins ?? 0}</div>
        </div>
        <div style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Streak</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{profile?.streak ?? 0} 🔥</div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Tips & News</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>TIP</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginTop: 8 }}>Control the center</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Pieces in the center control more squares and are harder for your opponent to attack.</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>STRATEGY</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginTop: 8 }}>Force your opponent&apos;s moves</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Try to create situations where all of your opponent&apos;s moves lead to a disadvantage.</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>UPDATE</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginTop: 8 }}>Multiplayer mode coming soon</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Challenge real players from around the world. Join the waitlist to be notified first.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
