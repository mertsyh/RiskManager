// ─── SUPABASE CLIENT ───
// Shared leaderboard + GPAF event store. Reads config from Vite env (.env, gitignored).
// FAIL-SOFT: if the env vars are missing (e.g. local dev without a DB), `supabase` is null
// and the logger keeps working fully offline — buffered JSONL + downloads never break.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null
export const supabaseEnabled = !!supabase

if (!supabaseEnabled) {
  console.info('[gpaf] Supabase not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) — running offline-only.')
}
