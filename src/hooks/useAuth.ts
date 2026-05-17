"use client"
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: Record<string, unknown>) => {
      const userFromData = (data as Record<string, unknown>)[
        'user'
      ] as User | null | undefined
      setUser(userFromData ?? null)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    // older SDK returns subscription, newer returns data.subscription
    const subscription =
      (data && ((data as Record<string, unknown>)['subscription'] || data)) as
      Record<string, unknown> | null
    return () => {
      const sub = subscription as unknown
      if (sub && typeof (sub as { unsubscribe?: () => void })['unsubscribe'] === 'function') {
        ;(sub as { unsubscribe: () => void })['unsubscribe']()
      }
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return { user, loading, signOut }
}
