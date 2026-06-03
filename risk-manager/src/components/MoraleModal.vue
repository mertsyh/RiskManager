<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900 bg-opacity-90 p-4" @click.self="$emit('close')">
    <div class="pixel-panel p-0 overflow-hidden w-[640px] max-h-[92vh] flex flex-col border-4 shadow-lg"
         :style="{ borderColor: theme.titleText, backgroundColor: theme.panelBg }">

      <!-- Header -->
      <div class="px-5 py-4 flex justify-between items-center"
           :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
        <div class="flex items-center gap-3 min-w-0">
          <span class="text-2xl">{{ employee.icon }}</span>
          <div class="flex flex-col min-w-0">
            <span class="mm-title truncate">{{ employee.name }}</span>
            <span class="text-xs" style="color:#b08850">{{ employee.role }}</span>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm" :style="{ color: theme.chipGreenText }">💰 ${{ money.toLocaleString() }}</span>
          <button @click="$emit('close')" class="hover:text-red-400 text-2xl">✖</button>
        </div>
      </div>

      <!-- Current morale -->
      <div class="px-5 py-4" style="background:rgba(0,0,0,0.25)">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs" style="color:#b08850;letter-spacing:1px">{{ moodIcon }} MORALE</span>
          <span class="mm-pct" :style="{ color: moraleColor }">{{ employee.morale }}%</span>
        </div>
        <div class="mm-bar-track">
          <div class="mm-bar-fill" :class="{ 'mm-bar-low': employee.morale < 30 }"
               :style="{ width: employee.morale + '%', background: moraleColor }"></div>
        </div>
        <div class="text-xs mt-3" style="line-height:1.5;color:#a89060">
          💡 You can't just hand <strong style="color:#ffd060">{{ employee.name }}</strong> cash — spend the budget on
          things <strong style="color:#ffd060">they</strong> care about. Happier people ship faster and shrug off risks.
        </div>
      </div>

      <!-- Perk list -->
      <div class="p-5 overflow-y-auto pixel-scrollbar flex-1 flex flex-col gap-4" :style="{ color: theme.riskDescText }">

        <div v-for="group in groups" :key="group.key">
          <div class="mm-group-head">{{ group.label }}</div>
          <div class="flex flex-col gap-3 mt-2">
            <div v-for="p in group.items" :key="p.id"
                 class="mm-row" :class="{ 'mm-row-on': isOwned(p) }">
              <div class="text-3xl flex-shrink-0">{{ p.icon }}</div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="mm-name">{{ p.name }}</span>
                  <span class="mm-tag mm-tag-morale">+{{ p.morale }} morale</span>
                  <span v-if="p.passive" class="mm-tag mm-tag-passive">+{{ p.passive }}/day</span>
                </div>
                <div class="text-xs mt-1" style="color:#a89060">{{ p.desc }}</div>
              </div>
              <div class="flex-shrink-0 text-right">
                <span v-if="isOwned(p)" class="mm-badge-on">✓ OWNED</span>
                <button v-else class="mm-btn-buy" :disabled="buyDisabled(p)" @click="$emit('buy', p.id)">
                  ${{ p.cost.toLocaleString() }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="employee.morale >= 100" class="text-xs text-center" style="color:#80e060">
          🎉 {{ employee.name }} is on top of the world — activities are maxed out.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  theme: Object,
  money: { type: Number, default: 0 },
  employee: { type: Object, required: true },
  perks: { type: Array, default: () => [] },
})
defineEmits(['buy', 'close'])

const isOwned = (p) => p.type === 'item' && (props.employee.ownedPerks || []).includes(p.id)

// Buy is blocked when: not enough cash, a one-time item is already owned,
// or it's a repeatable activity but morale is already full (the boost would be wasted).
const buyDisabled = (p) =>
  props.money < p.cost ||
  isOwned(p) ||
  (p.type === 'activity' && props.employee.morale >= 100)

const groups = computed(() => {
  const list = props.perks || []
  return [
    { key:'activity', label:'🎉 ACTIVITIES — repeatable boosts', items: list.filter(p => p.type === 'activity') },
    { key:'item',     label:'🎁 PERKS — one-time, +morale every day', items: list.filter(p => p.type === 'item') },
  ].filter(g => g.items.length)
})

const moraleColor = computed(() => {
  const m = props.employee.morale
  return m > 60 ? '#40e040' : m > 25 ? '#e0b030' : '#e03030'
})
const moodIcon = computed(() => {
  const m = props.employee.morale
  return m > 70 ? '🔥' : m > 50 ? '😊' : m > 30 ? '😐' : '😰'
})
</script>

<style scoped>
.mm-title { font-size: 14px; letter-spacing: 1px; font-family: 'Press Start 2P', monospace; }
.mm-pct { font-size: 16px; font-family: 'Press Start 2P', monospace; }
.mm-bar-track { height: 18px; background: #100804; border: 3px solid #080402; overflow: hidden; }
.mm-bar-fill { height: 100%; transition: width 0.5s steps(10); }
.mm-bar-low { animation: barLow 0.8s step-end infinite; }
@keyframes barLow { 0%,100%{opacity:1} 50%{opacity:0.45} }

.mm-group-head { font-size: 11px; letter-spacing: 1px; color: #ffd060; font-family: 'Press Start 2P', monospace; }
.mm-row {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 14px; background: rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.08);
}
.mm-row-on { background: rgba(40,90,40,0.18); border-color: rgba(96,200,96,0.4); }
.mm-name { font-size: 13px; color: #ffe4a0; font-family: 'Press Start 2P', monospace; }
.mm-tag { font-size: 11px; padding: 2px 7px; border-radius: 3px; white-space: nowrap; }
.mm-tag-morale { color: #80e060; background: rgba(96,200,96,0.18); }
.mm-tag-passive { color: #f0c060; background: rgba(240,192,64,0.18); }
.mm-badge-on { font-size: 12px; color: #80e060; border: 2px solid #2a6020; padding: 6px 10px; white-space: nowrap; }
.mm-btn-buy {
  font-family: 'Press Start 2P', monospace; font-size: 12px; cursor: pointer; white-space: nowrap;
  padding: 10px 14px; background: #186010; color: #80e050; border: 3px solid #0c3008; box-shadow: 0 3px 0 #061804;
  transition: filter 0.1s, transform 0.1s;
}
.mm-btn-buy:not(:disabled):hover { filter: brightness(1.2); }
.mm-btn-buy:not(:disabled):active { transform: translateY(3px); box-shadow: 0 0 0; }
.mm-btn-buy:disabled { opacity: 0.35; cursor: not-allowed; background: #3a3018; color: #8a7850; border-color: #1a1408; }
</style>
