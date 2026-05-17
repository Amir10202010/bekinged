import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseClient = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function createClient() {
  return supabaseClient
}

export const supabase = supabaseClient