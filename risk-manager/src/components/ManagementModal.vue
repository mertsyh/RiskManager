<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900 bg-opacity-90 p-4">
    <div class="pixel-panel p-0 overflow-hidden w-[760px] max-h-[92vh] flex flex-col border-4 shadow-lg"
         :style="{ borderColor: theme.titleText, backgroundColor: theme.panelBg }">

      <!-- Header -->
      <div class="px-5 py-4 flex justify-between items-center"
           :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🏢</span>
          <span class="mm-title">TEAM &amp; TECHNOLOGY — RISK MITIGATION</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm" :style="{ color: theme.chipGreenText }">💰 ${{ money.toLocaleString() }}</span>
          <button @click="$emit('close')" class="hover:text-red-400 text-2xl">✖</button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b-2" :style="{ borderColor: theme.titleBarBg }">
        <button v-for="t in tabs" :key="t.id" @click="activeTab = t.id"
                class="flex-1 py-3 text-sm transition-colors"
                :style="activeTab === t.id ? { backgroundColor: theme.tabActiveBg, color: theme.tabActiveText } : { color: theme.riskDescText }">
          {{ t.name }}
        </button>
      </div>

      <!-- Intro -->
      <div class="px-5 py-3 text-xs" style="line-height:1.5" :style="{ color: theme.riskDescText, background:'rgba(0,0,0,0.2)' }">
        💡 Hiring a specialist or buying an upgrade <strong>permanently lowers a risk category's probability</strong>
        (PMBOK proactive Mitigate). Enough mitigation can shift a 🐯 Tiger down to a 🐶 Puppy.
      </div>

      <!-- Risk-radar focus banner -->
      <div v-if="focusCategory" class="mm-banner">
        <template v-if="hasFocusMatch">🎯 Options that reduce <strong>{{ cat(focusCategory).icon }} {{ cat(focusCategory).label }}</strong> risk are highlighted &amp; listed first.</template>
        <template v-else>🎯 No specialist or upgrade directly lowers <strong>{{ cat(focusCategory).icon }} {{ cat(focusCategory).label }}</strong> risk — manage it through morale &amp; correct classification.</template>
      </div>

      <!-- Content -->
      <div class="p-5 overflow-y-auto pixel-scrollbar flex-1 text-sm" :style="{ color: theme.riskDescText }">

        <!-- TEAM TAB -->
        <div v-if="activeTab === 'team'" class="flex flex-col gap-3">
          <div v-for="e in sortedEmployees" :key="e.id"
               class="mm-row" :class="{ 'mm-row-on': e.hired, 'mm-row-focus': empMatch(e) }">
            <div class="text-3xl flex-shrink-0">{{ e.icon }}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="mm-name">{{ e.name }}</span>
                <span class="text-xs" style="color:#b08850">{{ e.role }}</span>
              </div>
              <div class="flex items-center gap-3 flex-wrap mt-1 text-xs">
                <span style="color:#70d050">⚡ +{{ e.productivity }} prod/day</span>
                <span v-if="e.reduction" :style="{ color: cat(e.category).color }">
                  {{ cat(e.category).icon }} {{ cat(e.category).label }} −{{ e.reduction }}%
                </span>
                <span style="color:#e87060">💸 ${{ e.dailyCost.toLocaleString() }}/day</span>
              </div>
            </div>
            <div class="flex-shrink-0">
              <span v-if="e.hired" class="mm-badge-on">✓ ACTIVE</span>
              <button v-else class="mm-btn-buy" @click="$emit('hire', e.id)">HIRE</button>
            </div>
          </div>
        </div>

        <!-- UPGRADES TAB -->
        <div v-else class="flex flex-col gap-3">
          <div v-for="u in sortedUpgrades" :key="u.id"
               class="mm-row" :class="{ 'mm-row-on': u.purchased, 'mm-row-focus': upgMatch(u) }">
            <div class="text-3xl flex-shrink-0">{{ u.icon }}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="mm-name">{{ u.name }}</span>
                <span class="text-xs px-2 py-0.5 rounded" :style="{ color: cat(u.category).color, background: cat(u.category).color + '22' }">
                  {{ cat(u.category).icon }} {{ u.reduction ? '−' + u.reduction + '% ' : '' }}{{ cat(u.category).label }}
                </span>
              </div>
              <div class="text-xs mt-1" style="color:#a89060">{{ u.desc }}</div>
            </div>
            <div class="flex-shrink-0 text-right">
              <span v-if="u.purchased" class="mm-badge-on">✓ OWNED</span>
              <button v-else class="mm-btn-buy" :disabled="money < u.cost" @click="$emit('buyUpgrade', u.id)">
                ${{ u.cost.toLocaleString() }}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ theme: Object, money: Number, employees: Array, upgrades: Array, focusCategory: String })
defineEmits(['hire', 'buyUpgrade', 'close'])

const tabs = [
  { id: 'team',     name: '🧑‍💻 HIRE TEAM' },
  { id: 'upgrades', name: '⚙️ UPGRADE SHOP' },
]
const activeTab = ref('team')

// ── Risk-radar odağı: bir kategoriden açıldıysa eşleşenleri vurgula + öne al ──
const empMatch = (e) => props.focusCategory && e.category === props.focusCategory
const upgMatch = (u) => props.focusCategory && (u.category === props.focusCategory || u.category === 'all')
const sortedEmployees = computed(() =>
  [...(props.employees || [])].sort((a, b) => (empMatch(b) ? 1 : 0) - (empMatch(a) ? 1 : 0)))
const sortedUpgrades = computed(() =>
  [...(props.upgrades || [])].sort((a, b) => (upgMatch(b) ? 1 : 0) - (upgMatch(a) ? 1 : 0)))
const hasFocusMatch = computed(() =>
  (props.employees || []).some(empMatch) || (props.upgrades || []).some(upgMatch))

const CATS = {
  server:   { icon: '🔥', label: 'Server',     color: '#e8702a' },
  api:      { icon: '🔌', label: 'Integration', color: '#5890e0' },
  security: { icon: '🔒', label: 'Security',    color: '#d05060' },
  scope:    { icon: '📈', label: 'Scope',       color: '#4fa050' },
  bug:      { icon: '🐛', label: 'Bug',         color: '#e0a838' },
  conflict: { icon: '⚡', label: 'Team',        color: '#b080e0' },
  all:      { icon: '🌐', label: 'All risks',   color: '#60d0c0' },
  morale:   { icon: '☕', label: 'Morale',      color: '#f0d060' },
}
function cat(key) { return CATS[key] || { icon: '•', label: key, color: '#999' } }
</script>

<style scoped>
.mm-title { font-size: 13px; letter-spacing: 2px; font-family: 'Press Start 2P', monospace; }
.mm-row {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 14px; background: rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.08);
}
.mm-row-on { background: rgba(40,90,40,0.18); border-color: rgba(96,200,96,0.4); }
.mm-name { font-size: 14px; color: #ffe4a0; font-family: 'Press Start 2P', monospace; }
.mm-badge-on { font-size: 12px; color: #80e060; border: 2px solid #2a6020; padding: 6px 10px; white-space: nowrap; }
.mm-btn-buy {
  font-family: 'Press Start 2P', monospace; font-size: 12px; cursor: pointer; white-space: nowrap;
  padding: 10px 14px; background: #186010; color: #80e050; border: 3px solid #0c3008; box-shadow: 0 3px 0 #061804;
  transition: filter 0.1s, transform 0.1s;
}
.mm-btn-buy:not(:disabled):hover { filter: brightness(1.2); }
.mm-btn-buy:not(:disabled):active { transform: translateY(3px); box-shadow: 0 0 0; }
.mm-btn-buy:disabled { opacity: 0.35; cursor: not-allowed; background: #3a3018; color: #8a7850; border-color: #1a1408; }
.mm-banner { padding: 8px 18px; font-size: 13px; line-height: 1.5; color: #ffe0a0; background: #2a2008; border-bottom: 2px solid #5a4810; }
.mm-banner strong { color: #ffd060; }
.mm-row-focus { box-shadow: 0 0 0 2px #f0c040, 0 0 10px rgba(240,192,64,0.4); border-color: #f0c040 !important; }
</style>
