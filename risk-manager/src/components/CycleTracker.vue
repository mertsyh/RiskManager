<template>
  <!-- Risk Management Cycle — HUD altı ince şerit. Aktif aşama parlar. -->
  <div class="cyc-bar" :style="{ background: theme?.titleBarBg || '#2a1408' }" @click="$emit('open')"
       title="Risk Management Cycle — click for the guide">
    <span class="cyc-tag">🔄 RISK CYCLE<template v-if="cycleNumber > 1"> · LOOP {{ cycleNumber }}</template></span>
    <div class="cyc-stages">
      <template v-for="(s, i) in stages" :key="s.key">
        <span class="cyc-arrow" v-if="i > 0">›</span>
        <span class="cyc-stage" :class="{ 'cyc-active': i === stageIndex, 'cyc-done': i < stageIndex }"
              :title="s.blurb">
          <span class="cyc-ico">{{ s.icon }}</span>
          <span class="cyc-name">{{ s.short }}</span>
        </span>
      </template>
    </div>
    <span class="cyc-hint">{{ activeLabel }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CYCLE_STAGES } from '../cycle.js'

const props = defineProps({
  stageIndex: { type: Number, default: 4 },
  cycleNumber: { type: Number, default: 1 },
  theme: { type: Object, default: () => ({}) },
})
defineEmits(['open'])

const stages = CYCLE_STAGES
const activeLabel = computed(() => stages[props.stageIndex]?.label || '')
</script>

<style scoped>
.cyc-bar {
  display: flex; align-items: center; gap: 10px;
  height: 30px; padding: 0 12px; cursor: pointer;
  border-bottom: 3px solid #1a0c04;
  font-family: 'Share Tech Mono', monospace; overflow: hidden; white-space: nowrap;
}
.cyc-tag {
  font-family: 'Press Start 2P', monospace; font-size: 9px; color: #ffe4a0;
  letter-spacing: 1px; flex-shrink: 0;
}
.cyc-stages { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; overflow: hidden; }
.cyc-arrow { color: #5a3c1c; font-size: 13px; flex-shrink: 0; }
.cyc-stage {
  display: flex; align-items: center; gap: 4px;
  padding: 2px 7px; border: 1px solid #3a2410; background: #160c04;
  color: #8a6c40; flex-shrink: 0; transition: all 0.25s;
}
.cyc-ico { font-size: 12px; line-height: 1; filter: grayscale(0.6); }
.cyc-name { font-size: 10px; letter-spacing: 0.5px; }
.cyc-done { color: #b08850; border-color: #4a3018; }
.cyc-done .cyc-ico { filter: grayscale(0.2); }
.cyc-active {
  color: #1a0c04; background: #ffd24a; border-color: #ffe4a0;
  box-shadow: 0 0 10px rgba(255,210,74,0.6);
  animation: cycPulse 1.6s ease-in-out infinite;
}
.cyc-active .cyc-ico { filter: none; }
.cyc-active .cyc-name { font-family: 'Press Start 2P', monospace; font-size: 8px; }
@keyframes cycPulse { 0%,100% { box-shadow: 0 0 8px rgba(255,210,74,0.45); } 50% { box-shadow: 0 0 16px rgba(255,210,74,0.9); } }
.cyc-hint {
  font-size: 11px; color: #c8a060; letter-spacing: 0.5px; flex-shrink: 0;
  max-width: 180px; overflow: hidden; text-overflow: ellipsis;
}
@media (max-width: 1100px) { .cyc-hint, .cyc-tag { display: none; } }
</style>
