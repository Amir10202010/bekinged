import Link from 'next/link'
import React from 'react'

const TOKENS = {
  bg: '#0d0f14',
  surface: '#161b27',
  border: '#2a3245',
  muted: '#94a3b8',
  accent: '#6366f1',
  success: '#10b981',
  danger: '#ef4444'
}

export default function Page() {
  return (
    <main style={{ background: TOKENS.bg, color: '#fff', minHeight: '100vh' }}>
      {/* NAVBAR */}
      <nav style={{ height: 60, background: 'rgba(13,15,20,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${TOKENS.border}`, padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ color: TOKENS.accent, fontWeight: 700, fontSize: 20 }}>♟</div>
          <div style={{ color: '#fff', fontWeight: 700 }}>BEKINGED</div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/login" style={{ color: TOKENS.muted, fontSize: 14, padding: '8px 16px', borderRadius: 8 }}>
            Sign in
          </Link>
          <Link href="/play" style={{ background: TOKENS.accent, color: '#fff', fontSize: 14, padding: '8px 20px', borderRadius: 8, textDecoration: 'none' }}>
            Play Free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: TOKENS.accent, fontSize: 12, padding: '6px 16px', borderRadius: 100, marginBottom: 24, letterSpacing: 1 }}>🏆 Now in Beta</div>

        <h1 style={{ fontSize: 'clamp(48px, 8vw, 88px)', fontWeight: 800, color: '#fff', lineHeight: 1.05, letterSpacing: '-3px', marginBottom: 24 }}>
          Checkers, but
          <br />
          <span style={{ color: TOKENS.accent }}>Competitive.</span>
        </h1>

        <p style={{ fontSize: 18, color: TOKENS.muted, maxWidth: 560, lineHeight: 1.6, marginBottom: 40 }}>
          The first checkers platform with AI coaching, ELO ranking, and daily challenges. Built for players who want to get better.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/play" style={{ background: TOKENS.accent, color: '#fff', fontSize: 16, fontWeight: 600, padding: '16px 36px', borderRadius: 12, boxShadow: '0 0 40px rgba(99,102,241,0.35)', textDecoration: 'none' }}>
            Start Playing Free →
          </Link>
          <a href="#how-it-works" style={{ background: 'transparent', color: TOKENS.muted, fontSize: 16, padding: '16px 36px', borderRadius: 12, border: `1px solid ${TOKENS.border}`, textDecoration: 'none' }}>
            See how it works
          </a>
        </div>

        <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9999, background: TOKENS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: `2px solid ${TOKENS.bg}`, marginLeft: -8 }}>A</div>
            <div style={{ width: 32, height: 32, borderRadius: 9999, background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: `2px solid ${TOKENS.bg}`, marginLeft: -8 }}>K</div>
            <div style={{ width: 32, height: 32, borderRadius: 9999, background: TOKENS.success, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: `2px solid ${TOKENS.bg}`, marginLeft: -8 }}>M</div>
          </div>
          <div style={{ color: TOKENS.muted, fontSize: 14 }}>2,847 games played · 1,200+ players</div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ marginTop: 80, padding: '40px 20px', borderTop: `1px solid ${TOKENS.border}`, borderBottom: `1px solid ${TOKENS.border}`, display: 'flex', justifyContent: 'center', gap: 80, flexWrap: 'wrap' }}>
        {[
          ['2,847', 'Games Played'],
          ['1,200+', 'Active Players'],
          ['94%', 'Return Rate'],
          ['∞', 'Free Forever']
        ].map(([num, label]) => (
          <div key={String(label)} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 800 }}>{num}</div>
            <div style={{ fontSize: 14, color: TOKENS.muted, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: '100px 20px', maxWidth: 1100, margin: '0 auto', color: '#fff' }}>
        <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: TOKENS.accent, fontSize: 12, padding: '6px 16px', borderRadius: 100, display: 'inline-block', marginBottom: 12 }}>HOW IT WORKS</div>
        <h2 style={{ fontSize: 40, fontWeight: 700, marginTop: 12 }}>From zero to ranked</h2>
        <p style={{ color: TOKENS.muted, fontSize: 16, marginTop: 8 }}>Three steps to competitive checkers</p>

        <div style={{ display: 'flex', gap: 24, marginTop: 60, flexWrap: 'wrap' }}>
          {[
            ['⚔️', 'Play Instantly', 'No downloads. No setup. Click and play against our AI or wait 30 seconds for a real opponent.'],
            ['🤖', 'Get AI Coaching', "After every game, our AI analyzes your moves and tells you exactly where you went wrong and how to improve."],
            ['🏆', 'Climb the Ranks', 'Earn ELO rating with every win. Compete on city and global leaderboards. Build your daily streak.']
          ].map(([icon, title, desc], idx) => (
            <div key={idx} style={{ flex: '1 1 280px', minWidth: 280, background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 16, padding: 32, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 64, fontWeight: 800, color: 'rgba(99,102,241,0.08)', lineHeight: 1 }}>{idx + 1}</div>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 14, color: TOKENS.muted, lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '100px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: TOKENS.accent, fontSize: 12, padding: '6px 16px', borderRadius: 100, display: 'inline-block', marginBottom: 12 }}>FEATURES</div>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 12 }}>Everything you need to dominate</h2>
        <p style={{ color: TOKENS.muted, fontSize: 16, marginTop: 8 }}>Built for serious players, accessible to everyone</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20, marginTop: 60 }}>
          {[
            ['⚡', 'Blitz Matches', '3-minute games that fit into any schedule. No long commitments, just sharp focused chess thinking.'],
            ['🧠', 'AI Post-Game Analysis', 'Claude AI reviews every game and gives you personalized insights on your play style.'],
            ['🔥', 'Daily Streak', 'Build a habit with daily puzzles and challenges. Your streak motivates you to come back.'],
            ['🌍', 'Global Leaderboard', 'See where you rank in your city, country, and worldwide. Real competition, real stakes.']
          ].map(([emoji, title, desc], i) => (
            <div key={i} style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: 16, padding: 28 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{emoji}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{title}</div>
              </div>
              <div style={{ fontSize: 14, color: TOKENS.muted, lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 48, fontWeight: 800, color: '#fff', marginBottom: 16 }}>Ready to start winning?</h2>
        <p style={{ fontSize: 16, color: TOKENS.muted, marginBottom: 40 }}>Join 1,200+ players already competing on BEKINGED</p>
        <Link href="/play" style={{ background: TOKENS.accent, color: '#fff', fontSize: 18, padding: '16px 36px', borderRadius: 12, textDecoration: 'none' }}>Play for Free →</Link>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${TOKENS.border}`, padding: '40px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, maxWidth: 1100, margin: '0 auto' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: TOKENS.accent, fontWeight: 700 }}>♟</div>
            <div style={{ color: '#fff', fontWeight: 700 }}>BEKINGED</div>
          </div>
          <div style={{ color: '#475569', fontSize: 13, marginTop: 8 }}>Built for the love of the game.</div>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          <Link href="/play" style={{ color: TOKENS.muted, fontSize: 14 }}>Play</Link>
          <Link href="/leaderboard" style={{ color: TOKENS.muted, fontSize: 14 }}>Leaderboard</Link>
          <Link href="/login" style={{ color: TOKENS.muted, fontSize: 14 }}>Sign in</Link>
        </div>
      </footer>
    </main>
  )
}
