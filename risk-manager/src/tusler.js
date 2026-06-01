// ═══════════════════════════════════════════════════════════════════════════
//  TUSLER'S RISK CLASSIFICATION
// ───────────────────────────────────────────────────────────────────────────
//  Robert Tusler places every risk on a Probability × Impact matrix and maps it
//  to one of four animals. Those four animals line up one-to-one with the four
//  PMBOK risk responses in the game — turning "which response should I pick?"
//  into the simpler question "which animal is this?".
//
//    🐱 Kitten     · Low probability  · Low impact   → ACCEPT
//    🐶 Puppy      · High probability · Low impact   → MITIGATE
//    🐯 Tiger      · High probability · High impact  → AVOID
//    🐊 Alligator  · Low probability  · High impact  → TRANSFER
// ═══════════════════════════════════════════════════════════════════════════

// Tunable thresholds. A risk at PROB_SPLIT or above counts as "high probability",
// and at IMPACT_SPLIT or above as "high impact". (Values picked against
// allRisksPool so all four animals are represented.)
export const PROB_SPLIT = 45
export const IMPACT_SPLIT = 9000

// Some risks (Conflict / HR / Burn-out) carry cost:0 but deal real damage via
// moralDamage. We fold morale into a dollar-equivalent so it counts on the
// impact axis.
export function impactValue(risk) {
  return (risk?.cost || 0) + (risk?.moralDamage || 0) * 400
}

export const RESPONSE_LABELS = {
  avoid:    'AVOID',
  mitigate: 'MITIGATE',
  transfer: 'TRANSFER',
  accept:   'ACCEPT',
}

export const TUSLER_ANIMALS = {
  tiger: {
    key: 'tiger', emoji: '🐯', name: 'Tiger', color: '#e8702a',
    probBand: 'High Probability', impactBand: 'High Impact', gridPos: 'tr',
    idealResponse: 'avoid', reco: 'AVOID / MITIGATE',
    rationale: 'The big threat in plain sight: both likely and devastating.',
    tip: 'You cannot ignore a tiger — cage it.',
    why: 'Both likely and devastating; instead of accepting it, AVOID or strongly MITIGATE.',
  },
  alligator: {
    key: 'alligator', emoji: '🐊', name: 'Alligator', color: '#4fa050',
    probBand: 'Low Probability', impactBand: 'High Impact', gridPos: 'tl',
    idealResponse: 'transfer', reco: 'TRANSFER / Reserve',
    rationale: 'Lurking under the water: rarely strikes, but sinks the project.',
    tip: 'Rare but lethal; transfer the financial risk or cover it with a reserve.',
    why: 'Do not let the low probability fool you; if it triggers it ends the project alone. TRANSFER it or protect with a contingency reserve.',
  },
  puppy: {
    key: 'puppy', emoji: '🐶', name: 'Puppy', color: '#e0a838',
    probBand: 'High Probability', impactBand: 'Low Impact', gridPos: 'br',
    idealResponse: 'mitigate', reco: 'MITIGATE',
    rationale: 'Cute, but untrained it grows into a troublesome dog.',
    tip: 'Train it while small; it shows up often but is cheap to manage.',
    why: 'Spending costly AVOID/TRANSFER on this low-impact risk is over-management; a cheap MITIGATE is enough.',
  },
  kitten: {
    key: 'kitten', emoji: '🐱', name: 'Kitten', color: '#8fa6bd',
    probBand: 'Low Probability', impactBand: 'Low Impact', gridPos: 'bl',
    idealResponse: 'accept', reco: 'ACCEPT',
    rationale: 'Rarely a problem; not worth spending time or resources on.',
    tip: 'Just watch it; spend no budget.',
    why: 'Spending money on a low×low risk wastes budget; ACCEPT was enough.',
  },
}

// 2×2 grid order (top-left → top-right → bottom-left → bottom-right).
// Y axis = Impact (up is high), X axis = Probability (right is high).
export const TUSLER_GRID = ['alligator', 'tiger', 'kitten', 'puppy']

export function classifyRisk(risk) {
  const highProb = (risk?.prob || 0) >= PROB_SPLIT
  const highImpact = impactValue(risk) >= IMPACT_SPLIT
  if (highProb && highImpact) return TUSLER_ANIMALS.tiger
  if (!highProb && highImpact) return TUSLER_ANIMALS.alligator
  if (highProb && !highImpact) return TUSLER_ANIMALS.puppy
  return TUSLER_ANIMALS.kitten
}

// Scores how well the chosen response matches the animal's ideal strategy.
// "Reward + gently teach": a hit earns points + praise, a miss carries NO
// penalty — only a teaching note explaining the correct move.
const RUBRIC = {
  tiger:     { avoid: 'ideal',    mitigate: 'ok',  transfer: 'ok',         accept: 'suboptimal' },
  alligator: { transfer: 'ideal', avoid: 'ok',     mitigate: 'ok',         accept: 'suboptimal' },
  puppy:     { mitigate: 'ideal', accept: 'ok',    avoid: 'suboptimal',    transfer: 'suboptimal' },
  kitten:    { accept: 'ideal',   mitigate: 'suboptimal', avoid: 'suboptimal', transfer: 'suboptimal' },
}
const SCORE = { ideal: 400, ok: 150, suboptimal: 0 }

export function evaluateResponse(animalKey, actionType) {
  const animal = TUSLER_ANIMALS[animalKey]
  const verdict = RUBRIC[animalKey]?.[actionType] || 'suboptimal'
  const scoreDelta = SCORE[verdict]
  const chosen = RESPONSE_LABELS[actionType] || actionType
  const ideal = RESPONSE_LABELS[animal.idealResponse]
  const tag = `${animal.emoji} ${animal.name}`
  const bands = `${animal.probBand} × ${animal.impactBand}`

  let lesson
  if (verdict === 'ideal') {
    lesson = `🦁 Tusler Hit! For a ${tag} (${bands}) the best move is ${chosen}. ${animal.tip}`
  } else if (verdict === 'ok') {
    lesson = `🦁 Tusler: ${chosen} is a defensible choice for a ${tag}, but the ideal move would be ${ideal}. ${animal.tip}`
  } else {
    lesson = `🦁 Tusler Note: for a ${tag} (${bands}) the ideal move is ${ideal}. ${animal.why}`
  }
  return { verdict, scoreDelta, lesson, animal }
}

// ═══════════════════════════════════════════════════════════════════════════
//  RESPONSE EXECUTION MINIGAME  (resource allocation)
// ───────────────────────────────────────────────────────────────────────────
//  After classifying, the player *executes* the response by spending Effort
//  Points (EP) to cut the risk's residual Probability and/or Impact. A correct
//  classification grants more EP — so reading the risk well gives you more
//  power to deal with it. EMV (Probability × Impact) is shown live so the
//  player optimises the expected cost. The unspent EP is the "Accept" move:
//  spend nothing, keep your money, but the risk stays at full strength.
//
//  Scoring rewards the DECISION (low residual EMV + correct classification),
//  not the dice roll — so an unlucky trigger never punishes good play.
// ═══════════════════════════════════════════════════════════════════════════

// How many Effort Points a classification verdict earns. Compassion model:
// even a wrong read still gets 1 EP to act with.
export const EFFORT_FOR_VERDICT = { ideal: 3, ok: 2, suboptimal: 1 }

// Per-point effects and the $ cost of spending one Effort Point.
export const PROB_CUT_PER_PT = 18      // each Probability point: −18 percentage points
export const IMPACT_CUT_PER_PT = 0.34  // each Impact point: −34% of impact (3 pts ≈ full)
export const EP_COST = 1500            // $ spent per Effort Point used (execution cost)

export function effortPointsFor(verdict) {
  return EFFORT_FOR_VERDICT[verdict] ?? 1
}

// Computes the residual risk profile after the player allocates EP.
// probPoints reduce trigger probability; impactPoints reduce all impacts
// (financial, morale and schedule alike). Returns residual values plus the
// residual EMV (expected dollar cost) used by the live readout and scoring.
export function applyMitigation(risk, probPoints = 0, impactPoints = 0) {
  const baseProb = risk?.prob || 0
  const residualProb = Math.max(0, Math.round(baseProb - probPoints * PROB_CUT_PER_PT))
  const residualImpactFactor = Math.max(0, 1 - impactPoints * IMPACT_CUT_PER_PT)
  const residualMoney  = Math.round((risk?.cost || 0) * residualImpactFactor)
  const residualMorale = Math.round((risk?.moralDamage || 0) * residualImpactFactor)
  const residualDelay  = Math.round((risk?.delay || 0) * residualImpactFactor)
  // Fold morale into a dollar-equivalent (same axis as classifyRisk) for EMV.
  const residualImpactDollar = impactValue({ cost: residualMoney, moralDamage: residualMorale })
  const residualEmv = Math.round((residualProb / 100) * residualImpactDollar)
  return { residualProb, residualImpactFactor, residualMoney, residualMorale, residualDelay, residualEmv }
}

// Base EMV of a risk before any mitigation (Probability × dollar-equiv Impact).
export function riskEmv(risk) {
  return Math.round(((risk?.prob || 0) / 100) * impactValue(risk))
}
