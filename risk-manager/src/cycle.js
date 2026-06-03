// ═══════════════════════════════════════════════════════════════════════════
//  RISK MANAGEMENT CYCLE  (riskloop.png — PMBOK project risk loop)
// ───────────────────────────────────────────────────────────────────────────
//  Görseldeki 7 aşamalı döngüyü oyunun omurgası yapar. Aşamalar oyun anlarına
//  eşlenir; bu modül saf mantık (tusler.js / perks.js stiliyle) tutar:
//   • Planning      → kickoff: risk stratejisi/iştahı seçimi
//   • Identification → kickoff: projenin gerçek risklerini seçme (TEST)
//   • Assessment / Strategies / Response → mevcut RiskClassifyModal kartı
//   • Monitoring & Control → her gün sonu kontrol pop-up'ı
//   • Evaluation    → milestone değerlendirmesi
// ═══════════════════════════════════════════════════════════════════════════

import { riskEmv, impactValue } from './tusler.js'

// Çarkın 7 düğümü — görsel sırası korunur (Planning → … → Evaluation → Planning).
// label/blurb oyuncuya görünür → İngilizce.
export const CYCLE_STAGES = [
  { key: 'planning',       label: 'Risk Planning',        short: 'PLAN',     icon: '🗺️', blurb: 'Decide how aggressively the project will face risk and set aside a reserve.' },
  { key: 'identification', label: 'Risk Identification',  short: 'IDENTIFY', icon: '🔍', blurb: 'List the risks this project is likely to face before they strike.' },
  { key: 'assessment',     label: 'Risk Assessment',      short: 'ASSESS',   icon: '📊', blurb: 'Read each risk on the Probability × Impact matrix (EMV).' },
  { key: 'strategies',     label: 'Risk Strategies',      short: 'STRATEGY', icon: '♟️', blurb: 'Map the risk to a response: Avoid, Transfer, Mitigate or Accept.' },
  { key: 'monitoring',     label: 'Monitoring & Control', short: 'MONITOR',  icon: '📡', blurb: 'Watch the threat radar daily and pre-empt risks that are rising.' },
  { key: 'response',       label: 'Risk Response',        short: 'RESPOND',  icon: '🛡️', blurb: 'Execute the response — mitigate with budget or take the chance.' },
  { key: 'evaluation',     label: 'Risk Evaluation',      short: 'EVALUATE', icon: '📈', blurb: 'Review how your responses performed and feed the lessons back into planning.' },
]

// Aşama key → çarktaki index (App.vue cycle.stageIndex için).
export const STAGE_INDEX = Object.fromEntries(CYCLE_STAGES.map((s, i) => [s.key, i]))

// ─── PLANNING: risk iştahı ön ayarları ───
// Seçim oyunun tunable'larını çarpanlarla kaydırır → her oyuncuda farklı his (SDT özerklik).
// startMoney: başlangıç bütçesi; riskChanceMult: günlük risk çıkma olasılığı; damageMult: tetiklenen
// hasar ölçeği; progressMult: günlük ilerleme ölçeği.
export const PLANNING_STRATEGIES = [
  {
    key: 'cautious', name: 'Cautious', icon: '🛡️',
    tagline: 'Reserve-first, play it safe',
    desc: 'Set aside a big contingency reserve: less starting cash, but risks fire less and hit softer. Progress is a touch slower.',
    startMoney: 85000, riskChanceMult: 0.78, damageMult: 0.82, progressMult: 0.92,
  },
  {
    key: 'balanced', name: 'Balanced', icon: '⚖️',
    tagline: 'The textbook middle path',
    desc: 'A standard $100k budget with neutral odds and impact. A solid default while you learn the loop.',
    startMoney: 100000, riskChanceMult: 1.0, damageMult: 1.0, progressMult: 1.0,
  },
  {
    key: 'aggressive', name: 'Aggressive', icon: '🔥',
    tagline: 'Spend big, move fast',
    desc: 'Keep more cash on hand and ship faster — but risks fire more often and strike harder. High risk, high reward.',
    startMoney: 115000, riskChanceMult: 1.28, damageMult: 1.22, progressMult: 1.12,
  },
]

export function planningStrategy(key) {
  return PLANNING_STRATEGIES.find(s => s.key === key) || PLANNING_STRATEGIES[1]
}

// ─── KNOWN / SURPRISE etkileri ───
// Identification'da DOĞRU seçilen riskler "known" (öngörülmüş) olur: radar'da görünür, mitigasyonu
// daha ucuz. Gerçek ama KAÇIRILAN riskler "surprise" olur: daha sert vurur. → iyi tanımlama = kolay oyun.
export const KNOWN_MITIGATE_DISCOUNT = 0.75   // known risk mitigasyonu %25 daha ucuz
export const SURPRISE_IMPACT_MULT = 1.3       // kaçırılan risk %30 daha sert vurur

// ─── IDENTIFICATION TEST ───
// Havuzdan bir aday kümesi üretir. "Doğru" cevap = gerçekten tehlikeli (yüksek EMV = yüksek olasılık ×
// yüksek etki, yani Tiger/Alligator bölgesi) riskler — bunlar projenin CANLI risk havuzu olur. Decoy'lar
// düşük EMV'li dikkat dağıtıcılardır (oyunda tetiklenmez). Çeşitlilik için doğru küme her oyunda biraz
// değişir ama her zaman havuzun en tehlikelilerinden seçilir → adil ve öğrenilebilir bir test.
function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function sample(arr, n) {
  return shuffle(arr).slice(0, Math.max(0, n))
}

export function buildIdentificationRegister(pool, { candidateCount = 9, correctCount = 4, topBand = 9 } = {}) {
  const ranked = pool.slice().sort((a, b) => riskEmv(b) - riskEmv(a))
  // Doğru küme: en tehlikeli `topBand` risk arasından rastgele `correctCount` → her oyunda farklı.
  const correct = sample(ranked.slice(0, Math.min(topBand, ranked.length)), correctCount)
  const correctIds = new Set(correct.map(r => r.id))
  // Decoy'lar: doğru kümede olmayan, görece daha az tehlikeli risklerden.
  const rest = ranked.filter(r => !correctIds.has(r.id))
  const decoys = sample(rest, Math.max(0, candidateCount - correct.length))
  const candidates = shuffle([...correct, ...decoys])
  return { candidates, correctIds: [...correctIds] }
}

// Test sonucu: isabet / kaçırma / yanlış-seçim + doğruluk + skor deltası.
// Kaçırmanın doğrudan skor cezası yok — bedeli oyun içinde "surprise" olarak ödenir.
export const ID_HIT_POINTS = 200
export const ID_FALSE_POINTS = 50

export function scoreIdentification(pickedIds, correctIds) {
  const picked = new Set(pickedIds)
  const correct = new Set(correctIds)
  const hits = [...correct].filter(id => picked.has(id))
  const misses = [...correct].filter(id => !picked.has(id))
  const falsePicks = [...picked].filter(id => !correct.has(id))
  const accuracy = correct.size ? hits.length / correct.size : 0
  const scoreDelta = Math.max(0, hits.length * ID_HIT_POINTS - falsePicks.length * ID_FALSE_POINTS)
  return { hits, misses, falsePicks, accuracy, scoreDelta }
}

// Doğruluk → harf notu (TEST hissi için).
export function accuracyGrade(accuracy) {
  if (accuracy >= 1)    return { grade: 'A+', label: 'Flawless foresight', color: '#6fe05a' }
  if (accuracy >= 0.75) return { grade: 'B',  label: 'Solid identification', color: '#9ad07a' }
  if (accuracy >= 0.5)  return { grade: 'C',  label: 'Some blind spots',    color: '#e0b030' }
  if (accuracy > 0)     return { grade: 'D',  label: 'Mostly surprised',     color: '#e08040' }
  return { grade: 'F', label: 'Flying blind', color: '#e05858' }
}
