import Link from 'next/link'

export default function LandingPage() {
  return (
    <main style={{ background: '#0d0f14', minHeight: '100vh' }} className="flex flex-col items-center justify-center text-center p-10">
      <div className="mb-2 text-white" style={{ fontSize: 64 }}>♟</div>
      <h1 className="text-white font-extrabold" style={{ fontSize: 48, letterSpacing: -2 }}>BEKINGED</h1>
      <p className="mt-2" style={{ color: '#94a3b8', fontSize: 18 }}>The competitive checkers platform with AI coaching</p>
      <p className="mt-1" style={{ color: '#6366f1', fontSize: 14, letterSpacing: 3, textTransform: 'uppercase' }}>Play. Learn. Dominate.</p>

      <Link href="/play" className="mt-10 inline-block" aria-label="Play now">
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontSize: 18, fontWeight: 600, padding: '16px 48px', borderRadius: 12, boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}
             className="transform hover:scale-105 transition-transform duration-200">
          Play Now
        </div>
      </Link>

      <div className="mt-6 text-sm" style={{ color: '#475569' }}>2,847 games played today · 12,453 players</div>

      <div className="mt-12 flex flex-col md:flex-row gap-8">
        <div style={{ background: '#161b27', border: '1px solid #1e2535', borderRadius: 12, padding: 20, width: 160 }}>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>🤖 AI Coach</div>
          <div style={{ color: '#cbd5e1', fontSize: 13 }}>Post-game analysis</div>
        </div>
        <div style={{ background: '#161b27', border: '1px solid #1e2535', borderRadius: 12, padding: 20, width: 160 }}>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>🏆 ELO Rating</div>
          <div style={{ color: '#cbd5e1', fontSize: 13 }}>Competitive ranking</div>
        </div>
        <div style={{ background: '#161b27', border: '1px solid #1e2535', borderRadius: 12, padding: 20, width: 160 }}>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>🔥 Daily Streak</div>
          <div style={{ color: '#cbd5e1', fontSize: 13 }}>Build your habit</div>
        </div>
      </div>
    </main>
  )
}
