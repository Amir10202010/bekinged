"use client"
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'

type UserProfile = {
  email?: string
  username?: string | null
  city?: string | null
  createdAt?: string
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [city, setCity] = useState<string>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.email) {
      fetch(`/api/users/me?email=${encodeURIComponent(user.email)}`)
        .then(r => r.json())
        .then(data => {
          setProfile(data)
          if (data?.city) setCity(data.city)
        })
        .catch(() => {})
    }
  }, [user])

  const emailDisplay = user?.email ?? '—'
  const usernameDisplay = profile?.username ?? (user?.email ? user.email.split('@')[0] : '—')
  const memberSince = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '—'

  return (
    <div>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Account</div>
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--bg-elevated)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Email</div>
            <div style={{ color: 'var(--text-primary)' }}>{emailDisplay}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--bg-elevated)' }}>
            <div style={{ color: 'var(--text-muted)' }}>Username</div>
            <div style={{ color: 'var(--text-primary)' }}>{usernameDisplay}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
            <div style={{ color: 'var(--text-muted)' }}>Member Since</div>
            <div style={{ color: 'var(--text-primary)' }}>{memberSince}</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <div style={{ color: 'var(--text-muted)' }}>City</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Your city" style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              <button onClick={async () => {
                if (!user?.email) return alert('Sign in first')
                setSaving(true)
                try {
                  await fetch('/api/users/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, city }) })
                  setSaving(false)
                  alert('Saved')
                } catch { setSaving(false); alert('Save failed') }
              }} style={{ padding: '6px 12px', borderRadius: 6, background: 'var(--accent)', color: 'white', border: 'none' }}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>

          <button onClick={() => signOut()} style={{ marginTop: 24, width: '100%', padding: 12, background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: 8 }}>Sign Out</button>
        </div>
      </div>
    </div>
  )
}
