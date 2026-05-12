<template>
  <div class="ds-backdrop" @click.self="$emit('close')">
    <div class="ds-bg" @click="$emit('close')"></div>
    <div class="ds-panel modal-popin">

      <!-- Title bar -->
      <div class="ds-titlebar">
        ★ GÜN {{ summary.day }} ÖZETI ★
      </div>

      <div class="ds-body">

        <!-- 4 stat boxes -->
        <div class="ds-stats-grid">
          <div class="ds-stat">
            <div class="ds-stat-label">İLERLEME</div>
            <div class="ds-stat-value" style="color:#80d060">+{{ Math.max(0,summary.progress) }}</div>
          </div>
          <div class="ds-stat">
            <div class="ds-stat-label">MALİYET</div>
            <div class="ds-stat-value" style="color:#f08080">-${{ summary.cost.toLocaleString() }}</div>
          </div>
          <div class="ds-stat">
            <div class="ds-stat-label">MORAL</div>
            <div class="ds-stat-value"
              :style="{color:summary.morale>60?'#80d060':summary.morale>35?'#f0b040':'#f08080'}">
              {{ summary.morale }}%
            </div>
          </div>
          <div class="ds-stat">
            <div class="ds-stat-label">OLAYLAR</div>
            <div class="ds-stat-value" style="color:#80b0f0">{{ summary.events.length }}</div>
          </div>
        </div>

        <!-- Events list -->
        <div v-if="summary.events.length" class="ds-events">
          <div v-for="(ev,i) in summary.events" :key="i"
            :class="['ev-item',
              ev.type==='success'||ev.type==='event-good' ? 'ev-good' :
              ev.type==='warning'||ev.type==='event-bad'  ? 'ev-bad'  : 'ev-info']">
            {{ ev.text }}
          </div>
        </div>

        <!-- Crit/bug/risk banners -->
        <div v-if="summary.critSuccess" class="ds-banner ds-banner-crit">
          ⭐ KRİTİK BAŞARI — İLERLEME 2X!
        </div>
        <div v-if="summary.bugEvent" class="ds-banner ds-banner-bug">
          🐛 BUG PATLAMASI — İLERLEME DÜŞTÜ!
        </div>
        <div v-if="summary.triggeredRisk" class="ds-banner ds-banner-risk">
          🚨 RİSK TETİKLENDİ: <span class="ds-risk-name">{{ summary.triggeredRisk.name }}</span>
        </div>

        <button @click="$emit('close')" class="ds-continue-btn">
          DEVAM ET ▶
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ summary: Object })
defineEmits(['close'])
</script>

<style scoped>
.ds-backdrop {
  position: fixed; inset: 0; z-index: 40;
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.ds-bg {
  position: absolute; inset: 0; background: rgba(0,0,0,0.72);
}

.ds-panel {
  width: 680px;
  position: relative; z-index: 1; overflow: hidden;
  background: #7a5030;
  border: 4px solid #5a3018;
  box-shadow: inset 3px 3px 0 #9a7050, inset -3px -3px 0 #5a3018, 6px 6px 0 #1a0a04;
}

.modal-popin { animation: popin 0.35s cubic-bezier(0.175,0.885,0.32,1.275); }
@keyframes popin { 0%{transform:scale(0.7);opacity:0} 100%{transform:scale(1);opacity:1} }

.ds-titlebar {
  background: #4a3018; border-bottom: 3px solid #2a1008;
  padding: 14px 20px; text-align: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 16px; color: #ffe4a0; letter-spacing: 3px;
}

.ds-body {
  padding: 24px; display: flex; flex-direction: column; gap: 16px;
}

/* Stat grid */
.ds-stats-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px;
}
.ds-stat {
  background: #6a4828; border: 3px solid #3a1808;
  box-shadow: inset 1px 1px 0 #2a1008;
  padding: 16px 12px; text-align: center;
}
.ds-stat-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px; color: #7a6050; margin-bottom: 10px; letter-spacing: 1px;
}
.ds-stat-value {
  font-family: 'Press Start 2P', monospace; font-size: 24px; line-height: 1;
}

/* Events */
.ds-events {
  display: flex; flex-direction: column; gap: 6px;
  max-height: 180px; overflow-y: auto; padding: 12px;
  background: #2a1808; border: 3px solid #1a1004;
}
.ev-item {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px; padding: 8px 12px; border: 2px solid; line-height: 2.2;
}
.ev-good { background: #1a3010; color: #80d060; border-color: #2a4818; }
.ev-bad  { background: #3a2808; color: #f0a040; border-color: #503810; }
.ev-info { background: #221608; color: #c09060; border-color: #3a2810; }

/* Banners */
.ds-banner {
  padding: 14px 16px; text-align: center;
  font-family: 'Press Start 2P', monospace; font-size: 13px;
  border: 3px solid; line-height: 1.8;
}
.ds-banner-crit { background: #282000; border-color: #706000; color: #ffe040; }
.ds-banner-bug  { background: #200808; border-color: #600000; color: #f04040; }
.ds-banner-risk { background: #3a0808; border-color: #601010; color: #f08080; font-size: 11px; }
.ds-risk-name   { color: #ffe4a0; }

/* Button */
.ds-continue-btn {
  font-family: 'Press Start 2P', monospace; font-size: 14px;
  padding: 20px; width: 100%; cursor: pointer; letter-spacing: 3px;
  background: #3a8030; color: #c8f090;
  border: 3px solid #1a4018; box-shadow: 0 6px 0 #0a2008;
  transition: filter 0.1s, transform 0.1s, box-shadow 0.1s;
}
.ds-continue-btn:hover  { filter: brightness(1.2); }
.ds-continue-btn:active { transform: translateY(6px); box-shadow: 0 0 0; }
</style>