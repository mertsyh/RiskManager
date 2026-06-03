<template>
  <!-- CYCLE STAGE 1 — Risk Identification (the TEST). Doğru tehlikeli riskleri seçmek oyunu kolaylaştırır. -->
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900 bg-opacity-90 p-4">
    <div class="id-panel modal-popin">

      <div class="id-titlebar">
        <span style="font-size:20px">🔍</span>
        <span>RISK IDENTIFICATION</span>
        <span class="id-step">Cycle · Stage 2 / 7</span>
      </div>

      <!-- ─── PHASE 1: SELECT ─── -->
      <template v-if="!revealed">
        <div class="id-intro">
          🦁 Here is the risk register for <strong>PROJECT: NEON</strong>. Some of these are genuinely
          dangerous; others are harmless noise. <strong>Tick the ones you foresee really threatening the
          project</strong> — read each by its <strong>Probability × Impact</strong>.<br>
          Spot them now → they become <strong style="color:#7ec85a">forewarned &amp; cheaper</strong> to handle.
          Miss a real one → it can strike later as a costly <strong style="color:#e08060">surprise</strong>.
        </div>

        <div class="id-list">
          <button v-for="r in candidates" :key="r.id" class="id-row"
            :class="{ 'id-row-on': picked.has(r.id) }" @click="toggle(r.id)">
            <span class="id-check">{{ picked.has(r.id) ? '☑' : '☐' }}</span>
            <span class="id-ico">{{ r.icon }}</span>
            <span class="id-name">{{ r.name }}</span>
            <span class="id-meta">
              <span class="id-prob">🎲 {{ r.prob }}%</span>
              <span class="id-imp">{{ impactText(r) }}</span>
            </span>
          </button>
        </div>

        <div class="id-footer">
          <span class="id-count">{{ picked.size }} risk{{ picked.size === 1 ? '' : 's' }} flagged</span>
          <button class="id-btn" @click="lockIn">LOCK IN REGISTER ▶</button>
        </div>
      </template>

      <!-- ─── PHASE 2: REVEAL ─── -->
      <template v-else>
        <div class="id-grade" :style="{ borderColor: grade.color }">
          <div class="id-grade-letter" :style="{ color: grade.color }">{{ grade.grade }}</div>
          <div class="id-grade-body">
            <div class="id-grade-label" :style="{ color: grade.color }">{{ grade.label }}</div>
            <div class="id-grade-sub">
              {{ result.hits.length }}/{{ correctIds.length }} real risks foreseen
              <template v-if="result.falsePicks.length"> · {{ result.falsePicks.length }} false alarm{{ result.falsePicks.length === 1 ? '' : 's' }}</template>
            </div>
          </div>
          <div class="id-grade-score" v-if="result.scoreDelta">+{{ result.scoreDelta.toLocaleString() }} pts</div>
        </div>

        <div class="id-list">
          <div v-for="r in candidates" :key="r.id" class="id-row id-row-static" :class="rowClass(r.id)">
            <span class="id-ico">{{ r.icon }}</span>
            <span class="id-name">{{ r.name }}</span>
            <span class="id-tag" :class="tagClass(r.id)">{{ tagText(r.id) }}</span>
          </div>
        </div>

        <div class="id-note">
          <template v-if="result.misses.length">
            ⚠️ <strong style="color:#e08060">{{ result.misses.length }}</strong> real risk{{ result.misses.length === 1 ? '' : 's' }}
            slipped through — watch for {{ result.misses.length === 1 ? 'it' : 'them' }} as surprise{{ result.misses.length === 1 ? '' : 's' }}.
          </template>
          <template v-else>
            ✅ No blind spots — every real threat is on your radar. The run will be calmer.
          </template>
        </div>

        <div class="id-footer">
          <button class="id-btn" @click="finish">START THE PROJECT ▶</button>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { scoreIdentification, accuracyGrade } from '../cycle.js'

const props = defineProps({
  candidates: { type: Array, default: () => [] },
  correctIds: { type: Array, default: () => [] },
})
const emit = defineEmits(['identify'])

const picked = ref(new Set())
const revealed = ref(false)

const result = computed(() => scoreIdentification([...picked.value], props.correctIds))
const grade = computed(() => accuracyGrade(result.value.accuracy))
const correctSet = computed(() => new Set(props.correctIds))

function impactText(r) {
  const parts = []
  if (r.cost > 0) parts.push('$' + r.cost.toLocaleString())
  if (r.moralDamage) parts.push('-' + r.moralDamage + ' mor.')
  return parts.length ? '💥 ' + parts.join(' · ') : '💥 minor'
}

function toggle(id) {
  const next = new Set(picked.value)
  next.has(id) ? next.delete(id) : next.add(id)
  picked.value = next
}

function lockIn() { revealed.value = true }

function rowClass(id) {
  const isCorrect = correctSet.value.has(id)
  const isPicked = picked.value.has(id)
  if (isCorrect && isPicked) return 'id-hit'
  if (isCorrect && !isPicked) return 'id-miss'
  if (!isCorrect && isPicked) return 'id-false'
  return 'id-ignore'
}
function tagClass(id) { return rowClass(id) + '-tag' }
function tagText(id) {
  const isCorrect = correctSet.value.has(id)
  const isPicked = picked.value.has(id)
  if (isCorrect && isPicked) return '✓ FORESEEN'
  if (isCorrect && !isPicked) return '⚠ MISSED'
  if (!isCorrect && isPicked) return '✗ FALSE ALARM'
  return '— harmless'
}

function finish() {
  emit('identify', { pickedIds: [...picked.value] })
}
</script>

<style scoped>
.id-panel {
  width: 640px; max-width: 96vw; max-height: 94vh; overflow-y: auto;
  background: #1a1008; border: 4px solid #3a2010;
  box-shadow: 6px 6px 0 #060302, inset 2px 2px 0 #2a1c0c;
  font-family: 'Share Tech Mono', monospace;
}
.id-titlebar {
  background: #2a1408; border-bottom: 3px solid #1a0c04;
  padding: 14px 18px; display: flex; align-items: center; gap: 12px;
  font-size: 15px; color: #ffe4a0; letter-spacing: 1px; font-family: 'Press Start 2P', monospace;
}
.id-step { font-size: 11px; color: #8a6c40; margin-left: auto; font-family: 'Share Tech Mono', monospace; }
.id-intro { padding: 14px 18px; font-size: 13px; line-height: 1.6; color: #c8b890; border-bottom: 2px solid #2a1808; }
.id-intro strong { color: #ffe4a0; }

.id-list { padding: 10px 18px; display: flex; flex-direction: column; gap: 6px; }
.id-row {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 9px 10px; border: 2px solid #321f0c; background: #120c04; cursor: pointer; text-align: left;
  font-family: 'Share Tech Mono', monospace; transition: filter 0.1s, border-color 0.15s, background 0.15s;
}
.id-row:hover { filter: brightness(1.25); border-color: #5a3c1c; }
.id-row-on { border-color: #5aa0e0; background: rgba(60,120,200,0.12); }
.id-row-static { cursor: default; }
.id-check { font-size: 16px; color: #7ec0ff; flex-shrink: 0; }
.id-ico { font-size: 18px; flex-shrink: 0; }
.id-name { font-size: 14px; color: #e8d8b0; flex: 1; }
.id-meta { display: flex; gap: 10px; flex-shrink: 0; }
.id-prob { font-size: 12px; color: #c8a060; }
.id-imp { font-size: 12px; color: #d09070; }

.id-tag { font-size: 11px; padding: 3px 7px; letter-spacing: 0.5px; flex-shrink: 0; font-family: 'Press Start 2P', monospace; }
.id-hit       { border-color: #3fa850; background: rgba(40,150,60,0.14); }
.id-hit-tag   { color: #082; background: #6fe05a; }
.id-miss      { border-color: #c03838; background: rgba(160,40,40,0.16); }
.id-miss-tag  { color: #fff; background: #c03838; }
.id-false     { border-color: #b07820; background: rgba(200,140,40,0.12); }
.id-false-tag { color: #3a2400; background: #e0a838; }
.id-ignore    { opacity: 0.5; }
.id-ignore-tag { color: #8a7a5a; background: transparent; border: 1px solid #3a2c18; }

/* ── Reveal grade ── */
.id-grade {
  margin: 14px 18px 6px; padding: 14px; display: flex; align-items: center; gap: 16px;
  border: 3px solid; background: rgba(255,255,255,0.03);
}
.id-grade-letter { font-size: 40px; font-family: 'Press Start 2P', monospace; line-height: 1; }
.id-grade-body { flex: 1; }
.id-grade-label { font-size: 15px; font-family: 'Press Start 2P', monospace; line-height: 1.4; }
.id-grade-sub { font-size: 13px; color: #b8a888; margin-top: 6px; }
.id-grade-score { font-size: 16px; color: #ffd86a; font-family: 'Press Start 2P', monospace; }

.id-note { margin: 4px 18px 0; padding: 10px 12px; font-size: 13px; line-height: 1.5; color: #c8c0a0; background: #100c06; border: 1px solid #2a2010; }
.id-note strong { font-family: 'Press Start 2P', monospace; font-size: 12px; }

.id-footer { padding: 12px 18px 18px; display: flex; align-items: center; gap: 12px; }
.id-count { font-size: 13px; color: #c8a060; }
.id-btn {
  margin-left: auto; font-family: 'Press Start 2P', monospace; font-size: 14px; cursor: pointer;
  padding: 14px 20px; letter-spacing: 1px;
  background: #2a6020; color: #a0e080; border: 4px solid #184010; box-shadow: 0 5px 0 #0a2008;
  transition: filter 0.1s, transform 0.1s;
}
.id-btn:hover { filter: brightness(1.2); }
.id-btn:active { transform: translateY(5px); box-shadow: 0 0 0; }

.modal-popin { animation: popin 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }
@keyframes popin { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
</style>
