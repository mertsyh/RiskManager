<template>
  <div class="fixed inset-0 z-[55] flex items-center justify-center bg-gray-900 bg-opacity-70 p-4" @click.self="$emit('close')">
    <div class="ds-panel modal-popin" :style="{ borderColor: theme.titleText }">

      <div class="ds-titlebar" :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
        <span>📅 DAY {{ summary.day }} — SPRINT SUMMARY</span>
        <span class="ds-sub">{{ summary.completedPct }}% complete</span>
      </div>

      <div class="ds-body">
        <div class="ds-grid">
          <div class="ds-stat">
            <div class="ds-label">PROGRESS</div>
            <div class="ds-val" style="color:#58c840">+{{ summary.progress }}</div>
          </div>
          <div class="ds-stat">
            <div class="ds-label">DAILY COST</div>
            <div class="ds-val" style="color:#e87060">-${{ summary.cost.toLocaleString() }}</div>
          </div>
          <div class="ds-stat">
            <div class="ds-label">MORALE</div>
            <div class="ds-val" :style="{ color: summary.morale >= 60 ? '#58c848' : summary.morale >= 35 ? '#c09820' : '#e05858' }">
              {{ summary.morale }}%
            </div>
          </div>
          <div class="ds-stat">
            <div class="ds-label">DAY</div>
            <div class="ds-val" style="color:#5888e0">{{ summary.day }}</div>
          </div>
        </div>

        <div v-if="summary.milestone" class="ds-milestone">
          {{ summary.milestone.icon }} Milestone reached — {{ summary.milestone.label }}!
        </div>
        <div class="ds-note">🟢 No new risks today — the team kept building. Keep an eye on the budget.</div>

        <button class="ds-btn" @click="$emit('close')">CONTINUE ▶ <span class="ds-key">(Enter)</span></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

defineProps({ summary: Object, theme: Object })
const emit = defineEmits(['close'])

function onKey(e) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emit('close') }
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.ds-panel {
  width: 440px; max-width: 94vw;
  background: #1a1008; border: 4px solid #3a2010;
  box-shadow: 6px 6px 0 #060302, inset 2px 2px 0 #2a1c0c;
  font-family: 'Share Tech Mono', monospace;
}
.ds-titlebar {
  padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;
  font-size: 12px; letter-spacing: 1px; font-family: 'Press Start 2P', monospace;
  border-bottom: 3px solid #1a0c04;
}
.ds-sub { font-size: 11px; color: #c8a060; font-family: 'Share Tech Mono', monospace; }
.ds-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.ds-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ds-stat { background: #100a04; border: 3px solid #301808; padding: 10px; text-align: center; }
.ds-label { font-size: 11px; color: #8a6438; letter-spacing: 1px; margin-bottom: 6px; }
.ds-val { font-size: 22px; font-family: 'Press Start 2P', monospace; }
.ds-milestone { padding: 8px 10px; background: #281f00; border: 2px solid #5a4810; color: #f0d060; font-size: 13px; text-align: center; }
.ds-note { font-size: 12px; color: #8a9a72; text-align: center; line-height: 1.4; }
.ds-btn {
  margin-top: 4px; font-family: 'Press Start 2P', monospace; font-size: 13px; cursor: pointer;
  padding: 14px; letter-spacing: 2px; width: 100%;
  background: #1c5014; color: #d0f0a0; border: 4px solid #0c2c08; box-shadow: 0 5px 0 #081008;
  transition: filter 0.1s, transform 0.1s;
}
.ds-btn:hover { filter: brightness(1.15); }
.ds-btn:active { transform: translateY(5px); box-shadow: 0 0 0; }
.ds-key { font-size: 9px; color: #8aae70; }
.modal-popin { animation: popin 0.25s cubic-bezier(0.175,0.885,0.32,1.275); }
@keyframes popin { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
</style>
