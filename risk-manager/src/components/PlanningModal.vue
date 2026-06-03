<template>
  <!-- CYCLE STAGE 0 — Risk Planning. Risk iştahı seçimi → oyunun tunable'larını kaydırır. -->
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900 bg-opacity-90 p-4">
    <div class="pl-panel modal-popin">

      <div class="pl-titlebar">
        <span style="font-size:20px">🗺️</span>
        <span>RISK PLANNING</span>
        <span class="pl-step">Cycle · Stage 1 / 7</span>
      </div>

      <div class="pl-intro">
        🦁 Every project starts by deciding <strong>how it will face risk</strong>. Pick a risk appetite for
        <strong>PROJECT: NEON</strong> — it sets your starting budget and how often (and how hard) risks strike.
      </div>

      <div class="pl-cards">
        <button v-for="s in strategies" :key="s.key" class="pl-card"
          :class="{ 'pl-card-sel': selected === s.key }"
          @click="selected = s.key">
          <div class="pl-card-head">
            <span class="pl-card-ico">{{ s.icon }}</span>
            <span class="pl-card-name">{{ s.name }}</span>
          </div>
          <div class="pl-card-tag">{{ s.tagline }}</div>
          <div class="pl-card-desc">{{ s.desc }}</div>
          <div class="pl-card-stats">
            <span class="pl-stat">💰 ${{ s.startMoney.toLocaleString() }}</span>
            <span class="pl-stat" :style="{ color: rateColor(s.riskChanceMult) }">🎲 {{ ratePct(s.riskChanceMult) }} risk</span>
            <span class="pl-stat" :style="{ color: rateColor(s.damageMult) }">💥 {{ ratePct(s.damageMult) }} hit</span>
            <span class="pl-stat" :style="{ color: rateColor(s.progressMult, true) }">🏗️ {{ ratePct(s.progressMult) }} build</span>
          </div>
          <div v-if="selected === s.key" class="pl-card-check">✓ SELECTED</div>
        </button>
      </div>

      <div class="pl-footer">
        <button class="pl-btn" :disabled="!selected" @click="confirm">CONFIRM PLAN ▶</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PLANNING_STRATEGIES } from '../cycle.js'

const emit = defineEmits(['choose'])
const strategies = PLANNING_STRATEGIES
const selected = ref('balanced')

function ratePct(mult) {
  const pct = Math.round((mult - 1) * 100)
  return pct === 0 ? 'std' : (pct > 0 ? '+' + pct + '%' : pct + '%')
}
// Çoğu çarpan için artış kötü (kırmızı); progress için artış iyi (yeşil) — invert ile.
function rateColor(mult, invert = false) {
  const up = invert ? mult >= 1 : mult <= 1
  if (mult === 1) return '#b0a080'
  return up ? '#7ec85a' : '#e08060'
}

function confirm() {
  if (selected.value) emit('choose', selected.value)
}
</script>

<style scoped>
.pl-panel {
  width: 720px; max-width: 96vw; max-height: 94vh; overflow-y: auto;
  background: #1a1008; border: 4px solid #3a2010;
  box-shadow: 6px 6px 0 #060302, inset 2px 2px 0 #2a1c0c;
  font-family: 'Share Tech Mono', monospace;
}
.pl-titlebar {
  background: #2a1408; border-bottom: 3px solid #1a0c04;
  padding: 14px 18px; display: flex; align-items: center; gap: 12px;
  font-size: 15px; color: #ffe4a0; letter-spacing: 1px; font-family: 'Press Start 2P', monospace;
}
.pl-step { font-size: 11px; color: #8a6c40; margin-left: auto; font-family: 'Share Tech Mono', monospace; }
.pl-intro { padding: 14px 18px; font-size: 14px; line-height: 1.55; color: #c8b890; border-bottom: 2px solid #2a1808; }
.pl-intro strong { color: #ffe4a0; }

.pl-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 14px 18px; }
@media (max-width: 640px) { .pl-cards { grid-template-columns: 1fr; } }
.pl-card {
  position: relative; padding: 14px 12px; border: 3px solid #3a2814; background: rgba(255,255,255,0.03);
  cursor: pointer; text-align: left; display: flex; flex-direction: column; gap: 8px;
  font-family: 'Share Tech Mono', monospace; transition: filter 0.1s, transform 0.1s, border-color 0.2s, background 0.2s;
}
.pl-card:hover { filter: brightness(1.2); transform: translateY(-2px); }
.pl-card-sel { border-color: #ffd24a; background: rgba(255,210,74,0.08); box-shadow: 0 0 14px rgba(255,210,74,0.35); }
.pl-card-head { display: flex; align-items: center; gap: 8px; }
.pl-card-ico { font-size: 26px; }
.pl-card-name { font-size: 13px; color: #ffe4a0; font-family: 'Press Start 2P', monospace; }
.pl-card-tag { font-size: 12px; color: #c89850; font-style: italic; }
.pl-card-desc { font-size: 13px; color: #b8a888; line-height: 1.5; flex: 1; }
.pl-card-stats { display: flex; flex-wrap: wrap; gap: 5px 10px; margin-top: 4px; }
.pl-stat { font-size: 12px; color: #c0b090; }
.pl-card-check {
  position: absolute; top: 8px; right: 8px; font-size: 10px; padding: 3px 6px;
  background: #ffd24a; color: #1a0c04; letter-spacing: 1px; font-family: 'Press Start 2P', monospace;
}

.pl-footer { padding: 6px 18px 18px; }
.pl-btn {
  width: 100%; font-family: 'Press Start 2P', monospace; font-size: 15px; cursor: pointer;
  padding: 16px; letter-spacing: 2px;
  background: #2a6020; color: #a0e080; border: 4px solid #184010; box-shadow: 0 5px 0 #0a2008;
  transition: filter 0.1s, transform 0.1s;
}
.pl-btn:hover:not(:disabled) { filter: brightness(1.2); }
.pl-btn:active:not(:disabled) { transform: translateY(5px); box-shadow: 0 0 0; }
.pl-btn:disabled { opacity: 0.5; cursor: default; }

.modal-popin { animation: popin 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }
@keyframes popin { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
</style>
