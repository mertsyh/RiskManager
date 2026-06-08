<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900 bg-opacity-90 p-4">
    <div class="pixel-panel p-0 overflow-hidden w-[760px] max-h-[92vh] flex flex-col border-4 shadow-lg"
         :style="{ borderColor: theme.titleText, backgroundColor: theme.panelBg }">

      <!-- Header -->
      <div class="px-5 py-4 flex justify-between items-center"
           :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
        <div class="flex items-center gap-3">
          <span class="text-2xl">📋</span>
          <span class="rc-title">RISK CENTER — MONITOR &amp; CONTROL</span>
        </div>
        <button @click="$emit('close')" class="hover:text-red-400 text-2xl">✖</button>
      </div>

      <div class="p-5 overflow-y-auto pixel-scrollbar flex-1 flex flex-col gap-4 text-sm" :style="{ color: theme.riskDescText }">

        <!-- Top row: Tusler scoreboard + active mitigations -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Tusler scoreboard -->
          <div class="rc-card">
            <h3 class="rc-h">🦁 Tusler Scoreboard</h3>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="text-3xl font-bold" :style="{ color: accuracyColor }">{{ stats.tuslerTotal ? accuracy + '%' : '—' }}</span>
              <span class="text-xs" style="color:#a89060">{{ stats.tuslerCorrect }}/{{ stats.tuslerTotal }} ideal</span>
            </div>
            <div class="text-xs mt-2" style="color:#8a7a5a; line-height:1.5">
              🐯 Tiger→Avoid · 🐊 Alligator→Transfer · 🐶 Puppy→Mitigate · 🐱 Kitten→Accept
            </div>
          </div>

          <!-- Active mitigations -->
          <div class="rc-card">
            <h3 class="rc-h">🛡️ Active Mitigations</h3>
            <div v-if="activeReductions.length" class="flex flex-col gap-1 mt-2">
              <div v-for="r in activeReductions" :key="r.type" class="flex justify-between text-xs">
                <span :style="{ color: cat(r.type).color }">{{ cat(r.type).icon }} {{ cat(r.type).label }}</span>
                <span style="color:#80e060">−{{ r.pct }}%</span>
              </div>
            </div>
            <div v-else class="text-xs mt-2" style="color:#8a7a5a">
              No mitigations yet. Hire specialists or buy upgrades in 🏢 MANAGE to lower risk probabilities.
            </div>
          </div>
        </div>

        <!-- Risk register (kickoff planning) -->
        <div class="rc-card">
          <h3 class="rc-h">📋 Risk Register (Plan)</h3>
          <div v-if="registerCats.length" class="flex flex-wrap gap-2 mt-2">
            <span v-for="c in registerCats" :key="c.key" class="rc-tag" :style="{ borderColor: c.color }">
              {{ c.icon }} {{ c.label }}
            </span>
          </div>
          <div v-else class="text-xs mt-2" style="color:#8a7a5a">
            No categories were flagged at kickoff. Threats still appear — you just read each one fresh.
          </div>
        </div>

        <!-- Event log -->
        <div class="rc-card flex-1">
          <h3 class="rc-h">🗒️ Event Log (Risk Register updates)</h3>
          <div v-if="eventLog.length" class="flex flex-col gap-1 mt-2 rc-log pixel-scrollbar">
            <div v-for="e in eventLog" :key="e.id" class="rc-log-row" :style="{ borderColor: logColor(e.type) }">
              <span class="rc-day">D{{ e.day }}</span>
              <span class="flex-1" :style="{ color: logColor(e.type) }">{{ e.msg }}</span>
            </div>
          </div>
          <div v-else class="text-xs mt-2" style="color:#8a7a5a">No events recorded yet. Advance the days.</div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ theme: Object, eventLog: Array, reductionByType: Object, stats: Object, plannedCategories: Array })
defineEmits(['close'])

const accuracy = computed(() =>
  props.stats.tuslerTotal ? Math.round((props.stats.tuslerCorrect / props.stats.tuslerTotal) * 100) : 0
)
const accuracyColor = computed(() => {
  if (!props.stats.tuslerTotal) return '#888'
  const a = accuracy.value
  return a >= 80 ? '#60e060' : a >= 55 ? '#a0d060' : a >= 30 ? '#f0c040' : '#f08060'
})

const CATS = {
  server:   { icon: '🔥', label: 'Server',      color: '#e8702a' },
  api:      { icon: '🔌', label: 'Integration', color: '#5890e0' },
  security: { icon: '🔒', label: 'Security',     color: '#d05060' },
  scope:    { icon: '📈', label: 'Scope',        color: '#4fa050' },
  bug:      { icon: '🐛', label: 'Bug',          color: '#e0a838' },
  conflict: { icon: '⚡', label: 'Team',         color: '#b080e0' },
}
function cat(key) { return CATS[key] || { icon: '•', label: key, color: '#999' } }

const registerCats = computed(() =>
  (props.plannedCategories || []).filter(k => CATS[k]).map(k => ({ key: k, ...CATS[k] }))
)

const activeReductions = computed(() =>
  Object.entries(props.reductionByType || {})
    .filter(([t, frac]) => CATS[t] && frac > 0)
    .map(([type, frac]) => ({ type, pct: Math.round(frac * 100) }))
    .sort((a, b) => b.pct - a.pct)
)

function logColor(type) {
  return ({
    success:   '#80e060',
    warning:   '#f0a040',
    milestone: '#f0d060',
    pmbok:     '#9ad0f0',
  })[type] || '#c0a878'
}
</script>

<style scoped>
.rc-title { font-size: 13px; letter-spacing: 2px; font-family: 'Press Start 2P', monospace; }
.rc-card { background: rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.08); padding: 12px 14px; }
.rc-h { font-size: 13px; color: #ffe4a0; font-family: 'Press Start 2P', monospace; letter-spacing: 1px; }
.rc-log { max-height: 320px; overflow-y: auto; }
.rc-log-row { display: flex; gap: 10px; align-items: baseline; padding: 5px 8px; background: rgba(0,0,0,0.25); border-left: 3px solid; font-size: 13px; line-height: 1.4; }
.rc-day { font-size: 11px; color: #8a7a5a; flex-shrink: 0; width: 28px; }
.rc-tag { font-size: 13px; color: #e8d4a8; background: rgba(0,0,0,0.3); border: 2px solid; padding: 4px 9px; }
</style>
