"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import ThemeToggle from '../../components/layout/ThemeToggle'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && !user) router.push('/login')
    if (!loading && user && pathname === '/') router.replace('/home')
  }, [loading, user, router, pathname])

  const searchParams = useSearchParams()
  const difficultyParam = searchParams?.get('difficulty')

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [profileElo, setProfileElo] = useState<number | null>(1000)

  useEffect(() => {
    if (user?.email) {
      fetch(`/api/users/me?email=${encodeURIComponent(user.email)}`).then(r => r.json()).then(data => { if (data?.elo) setProfileElo(data.elo) }).catch(() => {})
    }
  }, [user])

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) setSidebarOpen(false)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    )
  }

  const navItems = [
    { href: '/home', label: '🏠 Home' },
    { href: '/play', label: '⚔️ Play' },
    { href: '/leaderboard', label: '🏆 Leaderboard' },
    { href: '/puzzles', label: '🧩 Puzzles' },
    { href: '/profile', label: '👤 Profile' },
    { href: '/settings', label: '⚙️ Settings' }
  ]

  const getTitle = () => {
    if (pathname?.startsWith('/play')) return '⚔️ Play vs AI'
    if (pathname?.startsWith('/leaderboard')) return '🏆 Leaderboard'
    if (pathname?.startsWith('/profile')) return '👤 Your Profile'
    if (pathname?.startsWith('/settings')) return '⚙️ Settings'
    return ''
  }

  const sidebarBase = { width: 220, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '16px 12px' } as React.CSSProperties
  const sidebarMobileStyle: React.CSSProperties = isMobile ? { position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s ease', ...sidebarBase } : sidebarBase

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* SIDEBAR */}
      <aside style={sidebarMobileStyle}>
        <div style={{ padding: '8px 12px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ color: 'var(--accent)' }}>♟</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>BEKINGED</div>
          </Link>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => { if (isMobile) setSidebarOpen(false) }} style={{ padding: '10px 14px', borderRadius: 8, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', background: active ? 'var(--accent)' : 'transparent', color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: 9999, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>{user?.email?.[0]?.toUpperCase() ?? '?'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email ?? 'guest'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--accent)', background: 'rgba(99,102,241,0.08)', padding: '2px 8px', borderRadius: 4 }}>⚡ {String(profileElo ?? 1000)} ELO</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* TOPBAR */}
        <div style={{ height: 52, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(s => !s)} style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', display: isMobile ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{sidebarOpen ? '✕' : '☰'}</button>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{getTitle()}</div>
            {difficultyParam && (
              <div style={{ marginLeft: 12, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-muted)' }}>
                {difficultyParam === 'easy' ? (
                  <span style={{ color: 'var(--success)', borderColor: 'var(--success)' }}>Easy</span>
                ) : difficultyParam === 'medium' ? (
                  <span style={{ color: 'var(--accent)' }}>Medium</span>
                ) : (
                  <span style={{ color: 'var(--danger)' }}>Hard</span>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeToggle />
            <div style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--success)' }} />
            <div style={{ fontSize: 13, color: 'var(--success)', marginLeft: 6 }}>Online</div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--bg-base)' }}>
          {children}
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
      )}
    </div>
  )
}
