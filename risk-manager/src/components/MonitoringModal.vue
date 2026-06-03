<template>
  <!-- CYCLE STAGE 4 — Monitoring & Control. Risksiz günlerde DaySummary'nin yerine geçer:
       gün özeti + izleme listesi + tek hafif seçim (ön-müdahale ya da geç). -->
  <div class="fixed inset-0 z-[55] flex items-center justify-center bg-gray-900 bg-opacity-70 p-4">
    <div class="mn-panel modal-popin">

      <div class="mn-titlebar" :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
        <span>📡 DAY {{ summary.day }} — MONITORING &amp; CONTROL</span>
        <span class="mn-sub">{{ summary.completedPct }}% complete</span>
      </div>

      <div class="mn-body">
        <!-- Gün özeti (DaySummary ile aynı blok) -->
        <div class="mn-grid">
          <div class="mn-stat">
            <div class="mn-label">PROGRESS</div>
            <div class="mn-val" style="color:#58c840">+{{ summary.progress }}</div>
          </div>
          <div class="mn-stat">
            <div class="mn-label">DAILY COST</div>
            <div class="mn-val" style="color:#e87060">-${{ summary.cost.toLocaleString() }}</div>
          </div>
          <div class="mn-stat">
            <div class="mn-label">MORALE</div>
            <div class="mn-val" :style="{ color: summary.morale >= 60 ? '#58c848' : summary.morale >= 35 ? '#c09820' : '#e05858' }">
              {{ summary.morale }}%
            </div>
          </div>
          <div class="mn-stat">
            <div class="mn-label">BUDGET</div>
            <div class="mn-val" style="color:#5888e0">${{ (money/1000).toFixed(0) }}k</div>
          </div>
        </div>

        <div v-if="summary.milestone" class="mn-milestone">
          {{ summary.milestone.icon }} Milestone reached — {{ summary.milestone.label }}!
        </div>

        <!-- Watchlist: yükselen tehditler -->
        <div class="mn-watch">
          <div class="mn-watch-head">🛡️ THREAT WATCHLIST — control a rising risk, or keep building</div>
          <template v-if="watchlist.length">
            <div v-for="w in watchlist" :key="w.category" class="mn-watch-row">
              <span class="mn-w-ico">{{ w.icon }}</span>
              <span class="mn-w-name">
                {{ w.label }}
                <span v-if="w.known" class="mn-w-flag" title="You identified this category">👁 known</span>
              </span>
              <div class="mn-w-track"><span class="mn-w-fill" :style="{ width: w.value + '%', background: w.tone }"></span></div>
              <span class="mn-w-val" :style="{ color: w.tone }">{{ w.value }}</span>
              <button class="mn-preempt" :disabled="money < w.cost" @click="$emit('resolve', { action: 'preempt', category: w.category })">
                Pre-empt<br>-${{ w.cost.toLocaleString() }}
              </button>
            </div>
            <div class="mn-watch-hint">💡 Pre-empting permanently lowers that category's threat (and its odds of striking).</div>
          </template>
          <div v-else class="mn-watch-empty">All quiet — no rising threats on the radar today.</div>
        </div>

        <button class="mn-btn" @click="$emit('resolve', { action: 'pass' })">
          KEEP BUILDING ▶ <span class="mn-key">(Enter)</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

defineProps({
  summary: Object,
  theme: { type: Object, default: () => ({}) },
  watchlist: { type: Array, default: () => [] },
  money: { type: Number, default: 0 },
})
const emit = defineEmits(['resolve'])

function onKey(e) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emit('resolve', { action: 'pass' }) }
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.mn-panel {
  width: 500px; max-width: 94vw;
  background: #1a1008; border: 4px solid #3a2010;
  box-shadow: 6px 6px 0 #060302, inset 2px 2px 0 #2a1c0c;
  font-family: 'Share Tech Mono', monospace;
}
.mn-titlebar {
  padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;
  font-size: 12px; letter-spacing: 1px; font-family: 'Press Start 2P', monospace;
  border-bottom: 3px solid #1a0c04;
}
.mn-sub { font-size: 11px; color: #c8a060; font-family: 'Share Tech Mono', monospace; }
.mn-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.mn-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px; }
.mn-stat { background: #100a04; border: 3px solid #301808; padding: 8px 4px; text-align: center; }
.mn-label { font-size: 10px; color: #8a6438; letter-spacing: 0.5px; margin-bottom: 5px; }
.mn-val { font-size: 17px; font-family: 'Press Start 2P', monospace; }
.mn-milestone { padding: 8px 10px; background: #281f00; border: 2px solid #5a4810; color: #f0d060; font-size: 13px; text-align: center; }

.mn-watch { background: #100c06; border: 2px solid #2a2010; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.mn-watch-head { font-size: 11px; color: #c8a060; letter-spacing: 0.5px; line-height: 1.4; }
.mn-watch-row { display: flex; align-items: center; gap: 8px; }
.mn-w-ico { font-size: 16px; flex-shrink: 0; }
.mn-w-name { font-size: 13px; color: #d8c8a0; width: 92px; flex-shrink: 0; line-height: 1.2; }
.mn-w-flag { display: block; font-size: 9px; color: #7ec0ff; }
.mn-w-track { flex: 1; height: 9px; background: #080402; border: 1px solid #000; overflow: hidden; }
.mn-w-fill { display: block; height: 100%; transition: width 0.4s; }
.mn-w-val { font-size: 13px; font-weight: bold; width: 26px; text-align: right; flex-shrink: 0; }
.mn-preempt {
  flex-shrink: 0; font-size: 10px; line-height: 1.2; padding: 5px 8px; cursor: pointer;
  background: #2c4a6a; color: #b8d8f0; border: 2px solid #18324a; box-shadow: 0 2px 0 #0c1c2c;
  font-family: 'Share Tech Mono', monospace; transition: filter 0.1s, transform 0.1s;
}
.mn-preempt:hover:not(:disabled) { filter: brightness(1.25); }
.mn-preempt:active:not(:disabled) { transform: translateY(2px); box-shadow: 0 0 0; }
.mn-preempt:disabled { opacity: 0.4; cursor: default; }
.mn-watch-hint { font-size: 11px; color: #8a8060; line-height: 1.4; }
.mn-watch-empty { font-size: 13px; color: #8a9a72; text-align: center; padding: 4px; }

.mn-btn {
  margin-top: 2px; font-family: 'Press Start 2P', monospace; font-size: 13px; cursor: pointer;
  padding: 14px; letter-spacing: 2px; width: 100%;
  background: #1c5014; color: #d0f0a0; border: 4px solid #0c2c08; box-shadow: 0 5px 0 #081008;
  transition: filter 0.1s, transform 0.1s;
}
.mn-btn:hover { filter: brightness(1.15); }
.mn-btn:active { transform: translateY(5px); box-shadow: 0 0 0; }
.mn-key { font-size: 9px; color: #8aae70; }

.modal-popin { animation: popin 0.25s cubic-bezier(0.175,0.885,0.32,1.275); }
@keyframes popin { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
</style>
