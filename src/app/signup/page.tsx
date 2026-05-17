"use client"
import React, { useState } from 'react'
import { createClient } from '../../lib/supabase/client'

export default function SignupPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) return setError("Passwords don't match")
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) return setError(error.message)

    // Create user in Prisma via API
    try {
      await fetch('/api/users/create', { method: 'POST', body: JSON.stringify({ email, supabaseId: data.user?.id }) })
    } catch {
      // ignore for now
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div style={{ background: '#0d0f14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>✅</div>
          <div style={{ fontSize: 48, marginTop: 12 }}>Check your email!</div>
          <div style={{ fontSize: 20, color: '#fff', marginTop: 8 }}>We sent a confirmation to {email}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#0d0f14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 400, width: '100%', background: '#161b27', border: '1px solid #2a3245', borderRadius: 16, padding: 40 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, color: '#6366f1' }}>♟</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginTop: 24 }}>Create account</div>
          <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>Start your journey</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32 }}>
          <label style={{ fontSize: 13, color: '#94a3b8' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px 16px', background: '#0d0f14', border: '1px solid #2a3245', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none' }} />

          <label style={{ fontSize: 13, color: '#94a3b8' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px 16px', background: '#0d0f14', border: '1px solid #2a3245', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none' }} />

          <label style={{ fontSize: 13, color: '#94a3b8' }}>Confirm Password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={{ width: '100%', padding: '12px 16px', background: '#0d0f14', border: '1px solid #2a3245', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none' }} />

          {error && <div style={{ color: '#ef4444', fontSize: 13, textAlign: 'center' }}>{error}</div>}

          <button disabled={loading} type="submit" style={{ width: '100%', padding: '14px', marginTop: 4, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>Create account</button>

          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            Already have an account? <a href="/login" style={{ color: '#6366f1' }}>Sign in</a>
          </div>
        </form>
      </div>
    </div>
  )
}
