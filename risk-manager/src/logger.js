// ════════════════════════════════════════════════════════════════════════════
//  GPAF LOGGER — Game Player Activity Format (gpaf_log_format v1.0)
// ────────────────────────────────────────────────────────────────────────────
//  The single source of truth for the event log. One JSON event per line (JSONL).
//  Each event: { ts, playerPseudoId, sessionId, gameId, eventType, payload }.
//  Core events: session_start | score_update | level_complete | session_end.
//
//  Identity:
//    • playerPseudoId — stable pseudonymous id per BROWSER (persisted, NOT a name).
//    • sessionId      — fresh per play SESSION (new each startSession()).
//
//  Every event is buffered in-memory (mirrored to localStorage so a refresh keeps
//  the downloadable log) AND pushed to Supabase (fire-and-forget). With no DB
//  configured, the sink is a no-op and the JSONL/leaderboard downloads still work.
// ════════════════════════════════════════════════════════════════════════════
import { supabase } from './supabase.js'

export const GAME_ID = 'GM-464DE8878705'
export const TEAM_ID = 'TM-699FC02031FA'   // DB metadata only — not a GPAF event field
export const supabaseEnabled = !!supabase

const PSEUDO_KEY = 'rm_player_pseudo_id'    // stable per-browser id
const BUFFER_KEY = 'rm_gpaf_buffer'         // current session's events (crash-safe)
const LOCAL_BOARD_KEY = 'rm_leaderboard_v3' // offline fallback board (shared with PostMortem)

function uuid() {
  return (globalThis.crypto?.randomUUID?.())
    || (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10))
}

// ISO-8601 with a trailing Z and no milliseconds — matches the spec template exactly.
function isoNow() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
}

// Stable pseudonymous id, created once and reused across every session in this browser.
function loadPseudoId() {
  let id = null
  try { id = localStorage.getItem(PSEUDO_KEY) } catch {}
  if (!id) {
    id = 'p-' + uuid()
    try { localStorage.setItem(PSEUDO_KEY, id) } catch {}
  }
  return id
}

export const playerPseudoId = loadPseudoId()

let sessionId = null
let events = []
let levelCounter = 0

export function getSessionId() { return sessionId }

function persistBuffer() {
  try { localStorage.setItem(BUFFER_KEY, JSON.stringify({ sessionId, events })) } catch {}
}

// Fire-and-forget insert; swallow every error so a missing/broken DB never affects gameplay.
function sinkEvent(ev) {
  if (!supabase) return
  supabase.from('gpaf_events').insert({
    ts: ev.ts,
    player_pseudo_id: ev.playerPseudoId,
    session_id: ev.sessionId,
    game_id: ev.gameId,
    team_id: TEAM_ID,
    event_type: ev.eventType,
    payload: ev.payload,
  }).then(
    ({ error }) => { if (error) console.warn('[gpaf] event sink failed:', error.message) },
    (err) => console.warn('[gpaf] event sink error:', err?.message),
  )
}

function makeEvent(eventType, payload = {}) {
  const ev = { ts: isoNow(), playerPseudoId, sessionId, gameId: GAME_ID, eventType, payload }
  events.push(ev)
  persistBuffer()
  sinkEvent(ev)
  return ev
}

// ─── PUBLIC EVENT API ───

export function startSession() {
  sessionId = 's-' + uuid()
  events = []
  levelCounter = 0
  makeEvent('session_start', {})
  return sessionId
}

// score_update — payload.score is the current competition score (number);
// `balance` carries current money (güncel bakiye). Extra keys are allowed by the spec.
export function scoreUpdate({ score = 0, balance = 0, day = 0, reason = '' } = {}) {
  if (!sessionId) return
  makeEvent('score_update', { score, balance, day, reason })
}

// level_complete — auto-incrementing payload.level (1,2,3,…) plus context (kind/label/track/pct).
export function levelComplete(extra = {}) {
  if (!sessionId) return
  levelCounter += 1
  makeEvent('level_complete', { level: levelCounter, ...extra })
}

// session_end — payload.completed is whether the project shipped (victory).
export function endSession(completed = false) {
  if (!sessionId) return
  makeEvent('session_end', { completed: !!completed })
}

export function reset() {
  sessionId = null
  events = []
  levelCounter = 0
  try { localStorage.removeItem(BUFFER_KEY) } catch {}
}

// ─── DOWNLOADS ───

function downloadBlob(text, filename, type) {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function normalizeEventRow(row) {
  if (!row) return row
  if (row.playerPseudoId || row.sessionId || row.gameId || row.eventType) return row
  return {
    ts: row.ts,
    playerPseudoId: row.player_pseudo_id,
    sessionId: row.session_id,
    gameId: row.game_id,
    eventType: row.event_type,
    payload: row.payload || {},
  }
}

export function toJSONL(sourceEvents = null) {
  const list = Array.isArray(sourceEvents) ? sourceEvents : events
  return list.map(e => JSON.stringify(normalizeEventRow(e))).join('\n')
}

export async function fetchAllEvents() {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('gpaf_events')
      .select('*')
      .eq('game_id', GAME_ID)
      .order('ts', { ascending: true })
    if (error) {
      console.warn('[gpaf] fetchAllEvents failed:', error.message)
      return []
    }
    return Array.isArray(data) ? data.map(normalizeEventRow) : []
  } catch (err) {
    console.warn('[gpaf] fetchAllEvents error:', err?.message)
    return []
  }
}

export async function downloadAllSessions({ asJson = false } = {}) {
  const allEvents = await fetchAllEvents()
  if (!allEvents.length) {
    console.warn('[gpaf] No events available to download.')
    return false
  }
  if (asJson) {
    downloadBlob(JSON.stringify(allEvents, null, 2), `gpaf-all-sessions-${GAME_ID}.json`, 'application/json;charset=utf-8')
  } else {
    downloadBlob(allEvents.map(e => JSON.stringify(e)).join('\n'), `gpaf-all-sessions-${GAME_ID}.jsonl`, 'application/jsonl;charset=utf-8')
  }
  return true
}

// Download the current session's events as a .jsonl file.
export function download() {
  downloadBlob(toJSONL(), `gpaf-${sessionId || 'session'}.jsonl`, 'application/jsonl;charset=utf-8')
}

// ─── LEADERBOARD (shared, via Supabase; local fallback) ───

// Upsert THIS session's leaderboard row (keyed by sessionId). Called when the player saves
// their name on the post-mortem screen. No-op if the DB isn't configured.
export async function upsertLeaderboard({ name = null, score = 0, days = null, won = false, completed = false } = {}) {
  if (!supabase || !sessionId) return
  try {
    const { error } = await supabase.from('leaderboard').upsert({
      session_id: sessionId,
      player_pseudo_id: playerPseudoId,
      name,
      score,
      days,
      won: !!won,
      completed: !!completed,
      game_id: GAME_ID,
      team_id: TEAM_ID,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'session_id' })
    if (error) console.warn('[gpaf] leaderboard upsert failed:', error.message)
  } catch (e) {
    console.warn('[gpaf] leaderboard upsert error:', e?.message)
  }
}

// Global leaderboard rows (score desc). Falls back to the local board when offline.
export async function fetchLeaderboard({ limit = 100 } = {}) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('game_id', GAME_ID)
        .order('score', { ascending: false })
        .limit(limit)
      if (!error && Array.isArray(data)) return data
      if (error) console.warn('[gpaf] leaderboard fetch failed:', error.message)
    } catch (e) {
      console.warn('[gpaf] leaderboard fetch error:', e?.message)
    }
  }
  try { return JSON.parse(localStorage.getItem(LOCAL_BOARD_KEY) || '[]') } catch { return [] }
}

// Export the global leaderboard as a pretty JSON file.
export async function downloadLeaderboard() {
  const rows = await fetchLeaderboard({ limit: 1000 })
  downloadBlob(JSON.stringify(rows, null, 2), `leaderboard-${GAME_ID}.json`, 'application/json;charset=utf-8')
}
