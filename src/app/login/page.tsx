"use client"
import React, { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) router.push('/play')
  }, [loading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (error) setError(error.message)
    else router.push('/play')
  }

  return (
    <div style={{ background: '#0d0f14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 400, width: '100%', background: '#161b27', border: '1px solid #2a3245', borderRadius: 16, padding: 40 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, color: '#6366f1' }}>♟</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginTop: 24 }}>Welcome back</div>
          <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>Sign in to continue</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32 }}>
          <label style={{ fontSize: 13, color: '#94a3b8' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px 16px', background: '#0d0f14', border: '1px solid #2a3245', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none' }} />

          <label style={{ fontSize: 13, color: '#94a3b8' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px 16px', background: '#0d0f14', border: '1px solid #2a3245', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none' }} />

          {error && <div style={{ color: '#ef4444', fontSize: 13, textAlign: 'center' }}>{error}</div>}

          <button disabled={submitting} type="submit" style={{ width: '100%', padding: '14px', marginTop: 4, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>Sign In</button>

          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            Don&apos;t have an account? <a href="/signup" style={{ color: '#6366f1' }}>Sign up</a>
          </div>
        </form>
      </div>
    </div>
  )
}
