// ═══════════════════════════════════════════════════════════════════════════
//  COMPETITION SCORE — END-GAME MODEL & LEADERBOARD
// ───────────────────────────────────────────────────────────────────────────
//  The running gs.score accumulates in-play DECISION points during a game
//  (planning picks, per-risk classification verdicts, EMV reduced, dodges,
//  minus loan penalties). At game END we fold in completion bonuses and turn
//  that into a single COMPETITION SCORE — the one number the leaderboard ranks.
//
//  By design the total is dominated by the two chosen drivers:
//    • CLASSIFICATION ACCURACY — Tusler hit-rate (on top of per-risk awards)
//    • SPEED — finishing in fewer days
//  Budget left and final morale are deliberately MINOR contributors.
//
//  These constants are the single balance knob — tune after a playtest.
// ═══════════════════════════════════════════════════════════════════════════

export const SPEED_BONUS_BASE   = 15000  // speed reward, hyperbolically decayed by days
export const SPEED_HALFLIFE     = 20     // days at which the speed bonus ~halves
export const ACCURACY_BONUS_MAX = 5000   // full Tusler hit-rate → this much
export const ACCURACY_MIN_RISKS = 3      // dampen the accuracy bonus below this many risks (avoid 1/1=100%)
export const BUDGET_DIVISOR     = 200    // $ left / this → points (minor)
export const MORALE_MULT        = 5      // final morale × this (minor)
export const COMPLETION_BONUS   = 1000   // flat reward for shipping the project

// Tusler classification hit-rate as a 0..100 percentage.
export function tuslerAccuracy(stats) {
  return stats?.tuslerTotal ? Math.round((stats.tuslerCorrect / stats.tuslerTotal) * 100) : 0
}

// Final competition score + a transparent line-item breakdown. Runs once at game end.
// Hyperbolic speed decay → always positive, no hard zero, degrades gracefully whatever
// the real game length turns out to be. Completion-only bonuses are skipped on a loss.
export function computeEndScore({ runningScore, day, status, money, morale, stats }) {
  const won = status === 'victory'
  const acc = tuslerAccuracy(stats)
  // Don't hand out a full accuracy bonus for a tiny sample (e.g. one lucky 1/1 = 100%).
  const sampleFactor  = Math.min(1, (stats?.tuslerTotal || 0) / ACCURACY_MIN_RISKS)
  const accuracyBonus = Math.round((acc / 100) * ACCURACY_BONUS_MAX * sampleFactor)
  const speedBonus    = won ? Math.round(SPEED_BONUS_BASE / (1 + day / SPEED_HALFLIFE)) : 0
  const budgetBonus   = won ? Math.max(0, Math.floor(money / BUDGET_DIVISOR)) : 0
  const moraleBonus   = won ? Math.max(0, morale) * MORALE_MULT : 0
  const completion    = won ? COMPLETION_BONUS : 0

  const items = [
    { key: 'base',       label: 'Kararlar (oyun içi)',             value: Math.round(runningScore || 0) },
    { key: 'accuracy',   label: `Sınıflandırma isabeti (${acc}%)`, value: accuracyBonus },
    won && { key: 'speed',      label: `Hız (${day} gün)`,         value: speedBonus },
    won && { key: 'budget',     label: 'Kalan bütçe',              value: budgetBonus },
    won && { key: 'morale',     label: 'Takım morali',             value: moraleBonus },
    won && { key: 'completion', label: 'Proje teslim edildi',      value: completion },
  ].filter(Boolean)

  const total = Math.max(0, items.reduce((s, i) => s + i.value, 0))
  return { won, accuracy: acc, total, items }
}

// Leaderboard ranks by SCORE desc (speed is already folded into the score);
// days only breaks ties. DNF entries (days == null) sort last on ties.
export function sortLeaderboard(list) {
  return [...list].sort((a, b) =>
    ((b.score || 0) - (a.score || 0)) || ((a.days ?? Infinity) - (b.days ?? Infinity)))
}
