<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900 bg-opacity-90 p-4">
    <div class="rk-panel modal-popin">

      <!-- Title bar -->
      <div class="rk-titlebar">
        <span style="font-size:22px">{{ outcome ? (outcome.phase === 'rolling' ? '🎲' : (outcome.triggered ? '💥' : '✓')) : '⚠️' }}</span>
        <span>{{ titleText }}</span>
        <span class="rk-titlebar-sub">Tusler · Probability × Impact</span>
      </div>

      <!-- Risk facts -->
      <div class="rk-risk">
        <span class="rk-risk-icon">{{ risk.icon || '🚨' }}</span>
        <div class="rk-risk-text">
          <div class="rk-risk-name">{{ risk.name }}</div>
          <div class="rk-risk-desc">{{ risk.desc }}</div>
        </div>
        <div class="rk-sev" :style="{ color: severity.color, borderColor: severity.color }">{{ severity.label }}</div>
      </div>

      <!-- Indicator row: probability + impact gauges (classification phases only) -->
      <div v-if="!outcome" class="rk-meters">
        <!-- Probability -->
        <div class="rk-meter">
          <div class="rk-meter-top">
            <span class="rk-meter-label">🎲 PROBABILITY</span>
            <span class="rk-meter-val" :style="{ color: probHigh ? '#f0a040' : '#9ab0c0' }">{{ risk.prob }}%</span>
          </div>
          <div class="rk-meter-track">
            <div class="rk-meter-fill" :style="{ width: risk.prob + '%', background: probHigh ? '#e8902a' : '#5a86a0' }"></div>
            <div class="rk-meter-split" :style="{ left: PROB_SPLIT + '%' }" title="High / Low split"></div>
          </div>
          <div class="rk-meter-foot">
            <template v-if="risk.baseProb && risk.baseProb !== risk.prob">↓ from {{ risk.baseProb }}% (mitigations) · </template>
            {{ probHigh ? 'HIGH — likely to happen' : 'LOW — unlikely' }}
          </div>
        </div>
        <!-- Impact -->
        <div class="rk-meter">
          <div class="rk-meter-top">
            <span class="rk-meter-label">💥 IMPACT</span>
            <span class="rk-meter-val" :style="{ color: impactHigh ? '#f06850' : '#9ab0c0' }">
              <template v-if="risk.cost > 0">${{ risk.cost.toLocaleString() }}</template>
              <template v-if="risk.moralDamage">{{ risk.cost > 0 ? ' · ' : '' }}-{{ risk.moralDamage }} morale</template>
              <template v-if="!risk.cost && !risk.moralDamage">minor</template>
            </span>
          </div>
          <div class="rk-meter-track">
            <div class="rk-meter-fill" :style="{ width: impactPct + '%', background: impactHigh ? '#d0402a' : '#5a86a0' }"></div>
            <div class="rk-meter-split" :style="{ left: impactSplitPct + '%' }" title="High / Low split"></div>
          </div>
          <div class="rk-meter-foot">{{ impactHigh ? 'HIGH — could sink the project' : 'LOW — survivable' }}</div>
        </div>
        <!-- EMV -->
        <div class="rk-emv" title="Expected Monetary Value = Probability × Impact">
          <div class="rk-emv-label">EMV</div>
          <div class="rk-emv-val">${{ baseEmv.toLocaleString() }}</div>
          <div class="rk-emv-sub">prob × impact</div>
        </div>
      </div>

      <!-- Prompt -->
      <div v-if="!outcome" class="rk-prompt">
        <template v-if="!revealed">
          🦁 Check the <strong>🎲 PROBABILITY</strong> and <strong>💥 IMPACT</strong> meters above, then pick the quadrant that matches.
        </template>
        <template v-else>
          <span :style="{ color: isCorrect ? '#6fe05a' : '#f0b040' }">{{ isCorrect ? '✅ Correct classification!' : '🦁 Tusler corrects you:' }}</span>
          This is a {{ trueAnimal.emoji }} <strong>{{ trueAnimal.name }}</strong> →
          best response: <strong :style="{ color: trueAnimal.color }">{{ idealLabel }}</strong>
        </template>
      </div>

      <!-- ═══ ANIMAL CHOICE MATRIX (Probability × Impact) ═══ -->
      <div class="rk-choose-hint" v-if="!revealed && !outcome">PICK THE QUADRANT MATCHING ITS PROBABILITY × IMPACT ↓</div>
      <div v-if="!outcome" class="rk-matrix">
        <!-- Vertical IMPACT axis, arrow pointing up, sits left of the grid -->
        <div class="rk-axis rk-axis-impact">
          <span class="rk-axis-arrow">↑</span>
          <span class="rk-axis-name">IMPACT</span>
        </div>

        <div class="rk-grid">
          <button v-for="a in cells" :key="a.key"
            class="rk-cell"
            :class="{
              'rk-cell-true': revealed && a.key === trueAnimal.key,
              'rk-cell-wrong': revealed && !isCorrect && a.key === guess,
              'rk-cell-dim': revealed && a.key !== trueAnimal.key && a.key !== guess,
            }"
            :style="{ borderColor: a.color }"
            :disabled="revealed"
            @click="pick(a.key)">
            <div class="rk-cell-head" :style="{ color: a.color }">
              <span class="rk-cell-emoji">{{ a.emoji }}</span>
              <span class="rk-cell-name">{{ a.name }}</span>
            </div>
            <div class="rk-cell-bands">{{ a.probBand }} · {{ a.impactBand }}</div>
            <div class="rk-cell-reco" :style="{ color: a.color }">→ {{ a.reco }}</div>
            <div v-if="revealed && a.key === trueAnimal.key" class="rk-tag rk-tag-true">✓ CORRECT</div>
            <div v-else-if="revealed && !isCorrect && a.key === guess" class="rk-tag rk-tag-wrong">✕ YOUR PICK</div>
          </button>
        </div>

        <!-- Horizontal PROBABILITY axis, arrow pointing right, sits below the grid -->
        <div class="rk-axis rk-axis-prob">
          <span class="rk-axis-name">PROBABILITY</span>
          <span class="rk-axis-arrow">→</span>
        </div>
      </div>

      <!-- Lesson -->
      <Transition name="fade">
        <div v-if="revealed && !outcome" class="rk-lesson">{{ result.lesson }}</div>
      </Transition>

      <!-- ═══ PHASE 2: DECIDE — mitigate (pay) or take the chance (free) ═══ -->
      <Transition name="fade">
        <div v-if="revealed && !outcome" class="rk-decide">
          <div class="rk-decide-head">⚖️ DECIDE — soften it, or roll the dice?</div>
          <div class="rk-choices">
            <!-- Mitigate -->
            <button class="rk-choice rk-choice-mit" :class="{ 'rk-choice-disabled': !canAfford }"
              :disabled="!canAfford" @click="decide(true)">
              <div class="rk-choice-title">🛡️ MITIGATE</div>
              <div class="rk-choice-price">pay -${{ mitigateCost.toLocaleString() }}</div>
              <div class="rk-choice-lines">
                <div>🎲 {{ risk.prob }}% → <strong>{{ mitigated.residualProb }}%</strong></div>
                <div v-if="risk.cost">💥 ${{ risk.cost.toLocaleString() }} → <strong>${{ mitigated.residualMoney.toLocaleString() }}</strong></div>
                <div v-if="risk.moralDamage">📉 -{{ risk.moralDamage }} → <strong>-{{ mitigated.residualMorale }}</strong> mor.</div>
              </div>
              <div v-if="!canAfford" class="rk-choice-warn">✗ Can't afford</div>
            </button>
            <!-- Take the chance -->
            <button class="rk-choice rk-choice-gamble" @click="decide(false)">
              <div class="rk-choice-title">🎲 TAKE THE CHANCE</div>
              <div class="rk-choice-price">pay $0</div>
              <div class="rk-choice-lines">
                <div>🎲 full <strong>{{ risk.prob }}%</strong> roll</div>
                <div v-if="risk.cost">if it hits: <strong>-${{ risk.cost.toLocaleString() }}</strong></div>
                <div v-if="risk.moralDamage">{{ risk.cost ? '+ ' : '' }}<strong>-{{ risk.moralDamage }}</strong> morale</div>
                <div v-if="!risk.cost && !risk.moralDamage">minor impact</div>
              </div>
            </button>
          </div>
          <div class="rk-decide-hint">💡 <strong>MITIGATE</strong> softens the risk but can't erase it; <strong>TAKE THE CHANCE</strong> keeps your cash and rolls the full odds. Dodging a risk — and reading it right — earns project progress. <strong>It's your call.</strong></div>
        </div>
      </Transition>

      <!-- ═══ PHASE 3: OUTCOME REVEAL — does the risk become reality? ═══ -->
      <Transition name="fade">
        <div v-if="outcome" class="rk-reveal">
          <Transition name="fade" mode="out-in">
            <!-- rolling -->
            <div v-if="outcome.phase === 'rolling'" key="rolling" class="rk-rolling">
              <div class="rk-die">🎲</div>
              <div class="rk-rolling-text">RESOLVING…</div>
              <div class="rk-rolling-sub">
                {{ outcome.mitigated ? '🛡️ mitigated' : '🎲 took the chance' }} · rolling against {{ outcome.rollProb }}%
              </div>
            </div>
            <!-- revealed -->
            <div v-else key="revealed" class="rk-result" :class="outcome.triggered ? 'rk-result-bad' : 'rk-result-good'">
              <div class="rk-result-badge">{{ outcome.triggered ? '⚠️ RISK STRUCK!' : '✓ RISK AVOIDED!' }}</div>
              <div class="rk-result-name">{{ outcome.riskIcon }} {{ outcome.riskName }}</div>

              <div v-if="outcome.triggered" class="rk-result-lines">
                <div v-if="outcome.dmgMoney">💰 <strong>-${{ outcome.dmgMoney.toLocaleString() }}</strong></div>
                <div v-if="outcome.dmgMorale">📉 <strong>-{{ outcome.dmgMorale }}</strong> morale</div>
                <div v-if="outcome.dmgProgress">🏗️ <strong>-{{ outcome.dmgProgress }}</strong> progress (setback)</div>
                <div v-if="!outcome.dmgMoney && !outcome.dmgMorale && !outcome.dmgProgress">minor impact — no real damage</div>
                <div v-if="outcome.progressGain" class="rk-prog">🏗️ <strong>+{{ outcome.progressGain }}</strong> progress</div>
              </div>
              <div v-else class="rk-result-lines">
                <div class="rk-saved">you dodged <strong>{{ savedText }}</strong></div>
                <div v-if="outcome.progressGain" class="rk-prog">🏗️ <strong>+{{ outcome.progressGain }}</strong> progress</div>
              </div>

              <div class="rk-result-note">
                <template v-if="outcome.mitigated">🛡️ You spent ${{ outcome.execCost.toLocaleString() }} to mitigate{{ outcome.triggered ? ' — and it softened the blow.' : ' — and stayed protected.' }}</template>
                <template v-else>🎲 You spent nothing — {{ outcome.triggered ? 'and the dice went against you.' : 'and the gamble paid off!' }}</template>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>

      <!-- Footer -->
      <div class="rk-footer">
        <div v-if="!revealed && !outcome" class="rk-hint">Click an animal…</div>
        <button v-else-if="outcome && outcome.phase === 'revealed'" class="rk-btn-continue" @click="$emit('close')">CONTINUE ▶</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { classifyRisk, evaluateResponse, applyMitigation, riskEmv, effortPointsFor, mitigationCostPerPoint, autoMitigationSplit, impactValue, TUSLER_ANIMALS, TUSLER_GRID, RESPONSE_LABELS, PROB_SPLIT, IMPACT_SPLIT } from '../tusler.js'

const props = defineProps({
  risk: Object,
  theme: Object,
  money: { type: Number, default: 0 },
  outcome: { type: Object, default: null },   // null = classify/decide phases; set = reveal phase
})
const emit = defineEmits(['resolve', 'close'])

const guess = ref(null)
const revealed = computed(() => guess.value !== null)

// 2×2 grid order: top-left Alligator, top-right Tiger, bottom-left Kitten, bottom-right Puppy
const cells = TUSLER_GRID.map(key => TUSLER_ANIMALS[key])

const trueAnimal = computed(() => classifyRisk(props.risk))
const isCorrect = computed(() => guess.value === trueAnimal.value.key)
const idealLabel = computed(() => RESPONSE_LABELS[trueAnimal.value.idealResponse])
const baseEmv = computed(() => riskEmv(props.risk))

const titleText = computed(() => {
  if (props.outcome) return props.outcome.phase === 'rolling' ? 'RESOLVING…' : (props.outcome.triggered ? 'RISK STRUCK' : 'RISK AVOIDED')
  return revealed.value ? 'MITIGATE OR TAKE THE CHANCE?' : 'NEW RISK — CLASSIFY IT'
})

// ── Indicators ──
const IMPACT_AXIS_MAX = 32000
const probHigh = computed(() => (props.risk.prob || 0) >= PROB_SPLIT)
const impactVal = computed(() => impactValue(props.risk))
const impactHigh = computed(() => impactVal.value >= IMPACT_SPLIT)
const impactPct = computed(() => Math.min(100, (impactVal.value / IMPACT_AXIS_MAX) * 100))
const impactSplitPct = (IMPACT_SPLIT / IMPACT_AXIS_MAX) * 100
const severity = computed(() => {
  const lv = props.risk.level
  if (lv === 'high')   return { label: 'CRITICAL', color: '#f06850' }
  if (lv === 'medium') return { label: 'MODERATE', color: '#e0a838' }
  return { label: 'MINOR', color: '#6fb85a' }
})

// Chosen animal's ideal response is graded against the true animal's rubric.
const result = computed(() =>
  guess.value
    ? evaluateResponse(trueAnimal.value.key, TUSLER_ANIMALS[guess.value].idealResponse)
    : null
)

// ── Phase 2: binary decision (mitigate with money, or take the chance) ──
// A correct read earns more effort → a stronger (and pricier) mitigation package.
const ep = computed(() => (result.value ? effortPointsFor(result.value.verdict) : 0))
const split = computed(() => autoMitigationSplit(ep.value))
const mitigated = computed(() => applyMitigation(props.risk, split.value.probPoints, split.value.impactPoints))
const costPerPoint = computed(() => mitigationCostPerPoint(props.risk))
const mitigateCost = computed(() => (split.value.probPoints + split.value.impactPoints) * costPerPoint.value)
const canAfford = computed(() => props.money >= mitigateCost.value)

// ── Phase 3: outcome reveal (what the gamble dodged) ──
const savedText = computed(() => {
  const o = props.outcome
  if (!o) return ''
  const parts = []
  if (o.dmgMoney)    parts.push(`$${o.dmgMoney.toLocaleString()}`)
  if (o.dmgMorale)   parts.push(`${o.dmgMorale} morale`)
  if (o.dmgProgress) parts.push(`${o.dmgProgress} progress`)
  return parts.length ? parts.join(' + ') : 'a minor setback'
})

function pick(key) {
  if (revealed.value || props.outcome) return
  guess.value = key
}

function decide(mitigate) {
  if (props.outcome) return
  if (mitigate && !canAfford.value) return
  emit('resolve', mitigate
    ? { guessKey: guess.value, action: 'mitigate', probPoints: split.value.probPoints, impactPoints: split.value.impactPoints }
    : { guessKey: guess.value, action: 'gamble', probPoints: 0, impactPoints: 0 })
}
</script>

<style scoped>
.rk-panel {
  width: 700px; max-width: 96vw; max-height: 94vh; overflow-y: auto;
  background: #1a1008; border: 4px solid #3a2010;
  box-shadow: 6px 6px 0 #060302, inset 2px 2px 0 #2a1c0c;
  display: flex; flex-direction: column;
  font-family: 'Share Tech Mono', monospace;
}
.rk-panel::-webkit-scrollbar { width: 10px; }
.rk-panel::-webkit-scrollbar-track { background: #120a04; }
.rk-panel::-webkit-scrollbar-thumb { background: #4a3018; border: 2px solid #2a1808; }

.rk-titlebar {
  background: #2a1408; border-bottom: 3px solid #1a0c04;
  padding: 14px 18px; display: flex; align-items: center; gap: 12px;
  font-size: 15px; color: #ffe4a0; letter-spacing: 1px;
  font-family: 'Press Start 2P', monospace;
}
.rk-titlebar-sub { font-size: 11px; color: #8a6c40; margin-left: auto; font-family: 'Share Tech Mono', monospace; }

/* ── Risk facts ── */
.rk-risk { padding: 16px 18px; border-bottom: 2px solid #2a1808; display: flex; gap: 14px; align-items: center; }
.rk-risk-icon { font-size: 40px; flex-shrink: 0; }
.rk-risk-text { flex: 1; }
.rk-risk-name { font-size: 19px; color: #ffe4a0; line-height: 1.3; margin-bottom: 4px; font-family: 'Press Start 2P', monospace; }
.rk-risk-desc { font-size: 15px; color: #c0a888; line-height: 1.4; }
.rk-sev { font-size: 13px; padding: 6px 10px; border: 2px solid; align-self: flex-start; white-space: nowrap; letter-spacing: 1px; }

/* ── Meters ── */
.rk-meters { display: flex; gap: 12px; padding: 16px 18px; border-bottom: 2px solid #2a1808; align-items: stretch; }
.rk-meter { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.rk-meter-top { display: flex; justify-content: space-between; align-items: baseline; }
.rk-meter-label { font-size: 13px; color: #b0a080; letter-spacing: 1px; }
.rk-meter-val { font-size: 16px; font-weight: bold; }
.rk-meter-track { position: relative; height: 16px; background: #0c0804; border: 2px solid #000; overflow: hidden; }
.rk-meter-fill { height: 100%; transition: width 0.4s; }
.rk-meter-split { position: absolute; top: -2px; bottom: -2px; width: 2px; background: #ffe066; opacity: 0.7; }
.rk-meter-foot { font-size: 12px; color: #8a7a5a; }
.rk-emv { width: 110px; flex-shrink: 0; background: #0a1c12; border: 2px solid #1c4030; padding: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; }
.rk-emv-label { font-size: 12px; color: #70e0a0; letter-spacing: 2px; }
.rk-emv-val { font-size: 18px; color: #70e0a0; font-weight: bold; }
.rk-emv-sub { font-size: 10px; color: #4a7a5a; }

/* ── Prompt ── */
.rk-prompt {
  padding: 12px 18px; font-size: 14px; line-height: 1.5; color: #9ad07a;
  background: #10140a; border-bottom: 2px solid #2a3a18;
}
.rk-prompt strong { color: #ffe4a0; }

/* ── Choice matrix (Probability × Impact axes wrap the grid) ── */
.rk-choose-hint { text-align: center; font-size: 13px; color: #c8a050; letter-spacing: 1px; padding: 10px 0 2px; }
.rk-matrix {
  display: grid;
  grid-template-columns: auto 1fr;   /* impact axis | grid */
  grid-template-rows: auto auto;     /* grid row | prob axis */
  gap: 8px; padding: 8px 18px 14px;
}
.rk-grid { grid-column: 2; grid-row: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

.rk-axis { display: flex; align-items: center; justify-content: center; gap: 8px; }
.rk-axis-name { color: #ffe066; letter-spacing: 2px; font-size: 12px; font-family: 'Press Start 2P', monospace; white-space: nowrap; }
.rk-axis-arrow { color: #ffe066; font-size: 20px; line-height: 1; }

/* IMPACT — vertical, left of grid, arrow points up */
.rk-axis-impact {
  grid-column: 1; grid-row: 1;
  flex-direction: column; padding: 4px 10px 4px 4px; border-right: 2px solid #ffe066;
}
.rk-axis-impact .rk-axis-name { writing-mode: vertical-rl; transform: rotate(180deg); }

/* PROBABILITY — horizontal, under grid, arrow points right */
.rk-axis-prob {
  grid-column: 2; grid-row: 2;
  flex-direction: row; padding: 8px 4px 2px; border-top: 2px solid #ffe066;
}
.rk-cell {
  position: relative; min-height: 92px; padding: 12px; border: 3px solid;
  background: rgba(255,255,255,0.03); cursor: pointer;
  display: flex; flex-direction: column; gap: 6px; text-align: left;
  font-family: 'Share Tech Mono', monospace; transition: filter 0.1s, transform 0.1s, opacity 0.2s;
}
.rk-cell:not(:disabled):hover { filter: brightness(1.35); transform: translateY(-2px); }
.rk-cell:not(:disabled):active { transform: translateY(1px); }
.rk-cell:disabled { cursor: default; }
.rk-cell-true  { box-shadow: 0 0 0 2px #60e060, 0 0 16px rgba(96,224,96,0.5); background: rgba(50,160,60,0.14); }
.rk-cell-wrong { box-shadow: 0 0 0 2px #e06060, 0 0 14px rgba(224,96,96,0.4); background: rgba(160,40,40,0.14); }
.rk-cell-dim   { opacity: 0.4; }
.rk-cell-head { display: flex; align-items: center; gap: 8px; }
.rk-cell-emoji { font-size: 26px; }
.rk-cell-name { font-size: 13px; font-family: 'Press Start 2P', monospace; }
.rk-cell-bands { font-size: 12px; color: #8a7a5a; line-height: 1.4; }
.rk-cell-reco { font-size: 13px; margin-top: auto; letter-spacing: 1px; }
.rk-tag { font-size: 11px; padding: 3px 6px; align-self: flex-start; letter-spacing: 1px; }
.rk-tag-true  { color: #082; background: #6fe05a; }
.rk-tag-wrong { color: #fff; background: #c03030; }

/* ── Lesson ── */
.rk-lesson {
  margin: 0 18px 8px; padding: 12px 14px; font-size: 14px; line-height: 1.55;
  color: #d0dcb0; background: #0c140a; border: 1px solid #1c3010; border-left: 4px solid #5fb84f;
}

/* ── Phase 2: decide (mitigate vs take the chance) ── */
.rk-decide { margin: 6px 18px 4px; padding: 12px 14px; background: #0a0f16; border: 2px solid #1c2c40; }
.rk-decide-head {
  font-size: 12px; color: #8fb0d0; letter-spacing: 1px; margin-bottom: 12px;
  font-family: 'Press Start 2P', monospace; line-height: 1.5; text-align: center;
}
.rk-choices { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
@media (max-width: 560px) { .rk-choices { grid-template-columns: 1fr; } }
.rk-choice {
  position: relative; padding: 14px 12px; border: 3px solid; cursor: pointer;
  display: flex; flex-direction: column; gap: 8px; text-align: left;
  font-family: 'Share Tech Mono', monospace; transition: filter 0.1s, transform 0.1s;
}
.rk-choice:not(:disabled):hover { filter: brightness(1.25); transform: translateY(-2px); }
.rk-choice:not(:disabled):active { transform: translateY(1px); }
.rk-choice-mit { background: rgba(40,120,200,0.10); border-color: #2c6aa0; }
.rk-choice-gamble { background: rgba(200,140,40,0.10); border-color: #b07820; }
.rk-choice-disabled { opacity: 0.45; cursor: default; }
.rk-choice-title { font-size: 12px; font-family: 'Press Start 2P', monospace; line-height: 1.4; min-height: 2.2em; }
.rk-choice-mit .rk-choice-title { color: #7ec0ff; }
.rk-choice-gamble .rk-choice-title { color: #f0b860; }
.rk-choice-price { font-size: 15px; font-weight: bold; color: #ffe4a0; }
.rk-choice-gamble .rk-choice-price { color: #9ad07a; }
.rk-choice-lines { font-size: 13px; color: #b8c4d0; line-height: 1.6; }
.rk-choice-lines strong { color: #fff; }
.rk-choice-warn { font-size: 11px; color: #f08060; margin-top: 2px; line-height: 1.4; }
.rk-decide-hint { font-size: 12px; color: #7a8a72; line-height: 1.5; margin-top: 10px; text-align: center; }
.rk-decide-hint strong { color: #c0d0a0; }

/* ── Phase 3: outcome reveal ── */
.rk-reveal { margin: 10px 18px 6px; padding: 16px 14px; min-height: 156px; display: flex; align-items: center; justify-content: center; }
.rk-rolling { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.rk-die { font-size: 64px; animation: rkroll 0.55s linear infinite; }
@keyframes rkroll { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.25); } 100% { transform: rotate(360deg) scale(1); } }
.rk-rolling-text { font-size: 18px; color: #ffe4a0; font-family: 'Press Start 2P', monospace; letter-spacing: 2px; }
.rk-rolling-sub { font-size: 13px; color: #9a8a6a; }

.rk-result { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 16px; border: 3px solid; }
.rk-result-bad  { background: rgba(160,40,40,0.16); border-color: #c03838; }
.rk-result-good { background: rgba(40,150,60,0.16); border-color: #3fa850; }
.rk-result-badge {
  font-size: 20px; font-family: 'Press Start 2P', monospace; letter-spacing: 1px;
  animation: rkpop 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
}
.rk-result-bad  .rk-result-badge { color: #ff7a5a; text-shadow: 0 0 16px rgba(240,80,60,0.6); }
.rk-result-good .rk-result-badge { color: #7ce05a; text-shadow: 0 0 16px rgba(96,224,96,0.5); }
@keyframes rkpop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
.rk-result-name { font-size: 15px; color: #e8d8b0; }
.rk-result-lines { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; font-size: 17px; color: #e0dcd0; }
.rk-result-lines strong { font-family: 'Press Start 2P', monospace; font-size: 14px; }
.rk-result-bad .rk-result-lines strong { color: #ff8a6a; }
.rk-saved strong { color: #7ce05a; }
.rk-prog strong { color: #ffd86a; }
.rk-result-note { font-size: 13px; color: #b0b8a0; text-align: center; line-height: 1.5; margin-top: 4px; }

/* ── Footer ── */
.rk-footer { padding: 12px 18px 18px; display: flex; justify-content: center; }
.rk-hint { font-size: 14px; color: #8a6c40; padding: 8px; }
.rk-btn-continue {
  font-family: 'Press Start 2P', monospace; font-size: 15px; cursor: pointer;
  padding: 16px 28px; letter-spacing: 2px; width: 100%;
  background: #2a6020; color: #a0e080; border: 4px solid #184010; box-shadow: 0 5px 0 #0a2008;
  transition: filter 0.1s, transform 0.1s;
}
.rk-btn-continue:hover { filter: brightness(1.2); }
.rk-btn-continue:active { transform: translateY(5px); box-shadow: 0 0 0; }

.modal-popin { animation: popin 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }
@keyframes popin { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
