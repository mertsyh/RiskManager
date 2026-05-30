<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900 bg-opacity-90 p-4">
    <div class="rk-panel modal-popin">

      <!-- Title bar -->
      <div class="rk-titlebar">
        <span style="font-size:22px">⚠️</span>
        <span>NEW RISK — CLASSIFY IT</span>
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

      <!-- Indicator row: probability + impact gauges -->
      <div class="rk-meters">
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
          <div class="rk-meter-foot">{{ probHigh ? 'HIGH — likely to happen' : 'LOW — unlikely' }}</div>
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
          <div class="rk-emv-val">${{ emv.toLocaleString() }}</div>
          <div class="rk-emv-sub">prob × impact</div>
        </div>
      </div>

      <!-- Prompt -->
      <div class="rk-prompt">
        <template v-if="!revealed">
          🦁 Read the graph below: where the <strong>dot</strong> lands tells you the animal. Then pick the matching animal &amp; its response.
        </template>
        <template v-else>
          <span :style="{ color: isCorrect ? '#6fe05a' : '#f0b040' }">{{ isCorrect ? '✅ Correct classification!' : '🦁 Tusler corrects you:' }}</span>
          This is a {{ trueAnimal.emoji }} <strong>{{ trueAnimal.name }}</strong> →
          best response: <strong :style="{ color: trueAnimal.color }">{{ idealLabel }}</strong>
        </template>
      </div>

      <!-- ═══ XY SCATTER PLANE (Probability × Impact) ═══ -->
      <div class="rk-graph-wrap">
        <svg class="rk-graph" viewBox="0 0 360 320" preserveAspectRatio="xMidYMid meet">
          <!-- Quadrant fills -->
          <g>
            <rect v-for="q in quads" :key="q.key"
              :x="q.x" :y="q.y" :width="q.w" :height="q.h"
              :fill="q.a.color"
              :fill-opacity="revealed && q.key === trueAnimal.key ? 0.34 : 0.12"
              :stroke="revealed && q.key === trueAnimal.key ? q.a.color
                       : (revealed && !isCorrect && q.key === guess ? '#e06060' : '#000')"
              :stroke-opacity="revealed && (q.key === trueAnimal.key || (!isCorrect && q.key === guess)) ? 0.95 : 0.35"
              :stroke-width="revealed && (q.key === trueAnimal.key || (!isCorrect && q.key === guess)) ? 2.5 : 1" />
            <!-- Quadrant labels -->
            <g v-for="q in quads" :key="q.key + '-lbl'" :style="{ opacity: revealed && q.key !== trueAnimal.key && q.key !== guess ? 0.45 : 1 }">
              <text :x="q.cx" :y="q.cy - 14" text-anchor="middle" font-size="26">{{ q.a.emoji }}</text>
              <text :x="q.cx" :y="q.cy + 10" text-anchor="middle" font-size="12" :fill="q.a.color" font-family="'Press Start 2P',monospace">{{ q.a.name }}</text>
              <text :x="q.cx" :y="q.cy + 26" text-anchor="middle" font-size="11" :fill="q.a.color" opacity="0.85">{{ RESPONSE_LABELS[q.a.idealResponse] }}</text>
            </g>
          </g>

          <!-- Axis frame -->
          <rect :x="geo.x0" :y="geo.y0" :width="geo.w" :height="geo.h" fill="none" stroke="#5a4a30" stroke-width="1.5" />

          <!-- Guide lines from the dot to each axis -->
          <line :x1="geo.dotX" :y1="geo.dotY" :x2="geo.dotX" :y2="geo.y1" stroke="#ffe066" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.8" />
          <line :x1="geo.dotX" :y1="geo.dotY" :x2="geo.x0" :y2="geo.dotY" stroke="#ffe066" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.8" />

          <!-- The risk dot -->
          <circle :cx="geo.dotX" :cy="geo.dotY" r="13" fill="#ffe066" opacity="0.25" class="rk-dot-pulse" />
          <circle :cx="geo.dotX" :cy="geo.dotY" r="7" fill="#fff" stroke="#ffb000" stroke-width="3" />

          <!-- Value read-outs near axes -->
          <text :x="geo.dotX" :y="geo.y1 + 16" text-anchor="middle" font-size="11" fill="#ffe066" font-family="'Press Start 2P',monospace">{{ risk.prob }}%</text>
          <text :x="geo.x0 - 6" :y="geo.dotY + 4" text-anchor="end" font-size="11" fill="#ffe066" font-family="'Press Start 2P',monospace">{{ impactShort }}</text>

          <!-- Axis labels -->
          <text :x="geo.x0 + geo.w / 2" y="312" text-anchor="middle" font-size="11" fill="#b0a080">PROBABILITY  (least → most)  →</text>
          <text x="14" :y="geo.y0 + geo.h / 2" text-anchor="middle" font-size="11" fill="#b0a080"
            :transform="`rotate(-90 14 ${geo.y0 + geo.h / 2})`">IMPACT  (least → most)  →</text>
        </svg>
      </div>

      <!-- ═══ ANIMAL CHOICE BUTTONS ═══ -->
      <div class="rk-choose-hint" v-if="!revealed">PICK THE ANIMAL THAT MATCHES THE DOT ↓</div>
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

      <!-- Lesson + continue -->
      <Transition name="fade">
        <div v-if="revealed" class="rk-lesson">{{ result.lesson }}</div>
      </Transition>
      <div class="rk-footer">
        <button v-if="revealed" class="rk-btn-continue" @click="$emit('close')">CONTINUE ▶</button>
        <div v-else class="rk-hint">Click an animal…</div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { classifyRisk, evaluateResponse, impactValue, TUSLER_ANIMALS, TUSLER_GRID, RESPONSE_LABELS, PROB_SPLIT, IMPACT_SPLIT } from '../tusler.js'

const props = defineProps({ risk: Object, theme: Object })
const emit = defineEmits(['classify', 'close'])

const guess = ref(null)
const revealed = computed(() => guess.value !== null)

// 2×2 grid order: top-left Alligator, top-right Tiger, bottom-left Kitten, bottom-right Puppy
const cells = TUSLER_GRID.map(key => TUSLER_ANIMALS[key])

const trueAnimal = computed(() => classifyRisk(props.risk))
const isCorrect = computed(() => guess.value === trueAnimal.value.key)
const idealLabel = computed(() => RESPONSE_LABELS[trueAnimal.value.idealResponse])
const emv = computed(() => Math.round((props.risk.prob / 100) * (props.risk.cost || 0)))

// ── Indicators ──
const IMPACT_AXIS_MAX = 32000
const probHigh = computed(() => (props.risk.prob || 0) >= PROB_SPLIT)
const impactVal = computed(() => impactValue(props.risk))
const impactHigh = computed(() => impactVal.value >= IMPACT_SPLIT)
const impactPct = computed(() => Math.min(100, (impactVal.value / IMPACT_AXIS_MAX) * 100))
const impactSplitPct = (IMPACT_SPLIT / IMPACT_AXIS_MAX) * 100
const impactShort = computed(() => {
  const v = impactVal.value
  return v >= 1000 ? '$' + Math.round(v / 1000) + 'K' : '$' + v
})
const severity = computed(() => {
  const lv = props.risk.level
  if (lv === 'high')   return { label: 'CRITICAL', color: '#f06850' }
  if (lv === 'medium') return { label: 'MODERATE', color: '#e0a838' }
  return { label: 'MINOR', color: '#6fb85a' }
})

// ── Graph geometry (viewBox 0 0 360 320) ──
const geo = computed(() => {
  const x0 = 46, x1 = 346, y0 = 14, y1 = 286
  const w = x1 - x0, h = y1 - y0
  const prob = props.risk.prob || 0
  const iv = impactVal.value
  const sx = x0 + (PROB_SPLIT / 100) * w
  const sy = y1 - Math.min(1, IMPACT_SPLIT / IMPACT_AXIS_MAX) * h
  const dotX = x0 + Math.min(1, prob / 100) * w
  const dotY = y1 - Math.min(1, iv / IMPACT_AXIS_MAX) * h
  return { x0, x1, y0, y1, w, h, sx, sy, dotX, dotY }
})

const quads = computed(() => {
  const g = geo.value
  return [
    { key: 'alligator', x: g.x0, y: g.y0, w: g.sx - g.x0, h: g.sy - g.y0 }, // tl
    { key: 'tiger',     x: g.sx, y: g.y0, w: g.x1 - g.sx, h: g.sy - g.y0 }, // tr
    { key: 'kitten',    x: g.x0, y: g.sy, w: g.sx - g.x0, h: g.y1 - g.sy }, // bl
    { key: 'puppy',     x: g.sx, y: g.sy, w: g.x1 - g.sx, h: g.y1 - g.sy }, // br
  ].map(q => ({ ...q, a: TUSLER_ANIMALS[q.key], cx: q.x + q.w / 2, cy: q.y + q.h / 2 }))
})

// Chosen animal's ideal response is graded against the true animal's rubric.
const result = computed(() =>
  guess.value
    ? evaluateResponse(trueAnimal.value.key, TUSLER_ANIMALS[guess.value].idealResponse)
    : null
)

function pick(key) {
  if (revealed.value) return
  guess.value = key
  emit('classify', key)
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

/* ── Graph ── */
.rk-graph-wrap { padding: 14px 18px 4px; }
.rk-graph { width: 100%; height: auto; display: block; background: #0c0a06; border: 2px solid #2a1c0c; }
.rk-dot-pulse { animation: dotPulse 1.4s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
@keyframes dotPulse { 0%,100% { opacity: 0.18; r: 11px; } 50% { opacity: 0.4; r: 16px; } }

/* ── Choice grid ── */
.rk-choose-hint { text-align: center; font-size: 13px; color: #c8a050; letter-spacing: 1px; padding: 10px 0 2px; }
.rk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px 18px 14px; }
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

/* ── Lesson + footer ── */
.rk-lesson {
  margin: 0 18px 14px; padding: 12px 14px; font-size: 14px; line-height: 1.55;
  color: #d0dcb0; background: #0c140a; border: 1px solid #1c3010; border-left: 4px solid #5fb84f;
}
.rk-footer { padding: 0 18px 18px; display: flex; justify-content: center; }
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
