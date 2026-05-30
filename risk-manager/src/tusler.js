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
