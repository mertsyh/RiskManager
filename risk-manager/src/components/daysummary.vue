<template>
  <div style="position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;padding:16px"
       @click.self="$emit('close')">
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.65)" @click="$emit('close')"></div>
    <div class="pixel-panel modal-popin" style="width:480px;position:relative;z-index:1;overflow:hidden">
      <div class="pixel-title-bar px-3 py-2 text-center" style="font-size:12px;color:#ffe4a0">
        ★ GÜN {{ summary.day }} ÖZETI ★
      </div>
      <div style="padding:20px;display:flex;flex-direction:column;gap:12px">

        <!-- 4 stat boxes -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div class="pixel-stat">
            <div style="font-size:8px;color:#7a6050;margin-bottom:4px">İLERLEME</div>
            <div style="font-size:14px;color:#80d060">+{{ Math.max(0,summary.progress) }}</div>
          </div>
          <div class="pixel-stat">
            <div style="font-size:8px;color:#7a6050;margin-bottom:4px">MALİYET</div>
            <div style="font-size:14px;color:#f08080">-${{ summary.cost.toLocaleString() }}</div>
          </div>
          <div class="pixel-stat">
            <div style="font-size:8px;color:#7a6050;margin-bottom:4px">MORAL</div>
            <div :style="{fontSize:'14px',color:summary.morale>60?'#80d060':summary.morale>35?'#f0b040':'#f08080'}">
              {{ summary.morale }}%
            </div>
          </div>
          <div class="pixel-stat">
            <div style="font-size:8px;color:#7a6050;margin-bottom:4px">OLAYLAR</div>
            <div style="font-size:14px;color:#80b0f0">{{ summary.events.length }}</div>
          </div>
        </div>

        <!-- Events list -->
        <div v-if="summary.events.length" style="display:flex;flex-direction:column;gap:4px;max-height:120px;overflow-y:auto; padding: 8px; background-color: #2a1808; border-radius: 4px;">
          <div v-for="(ev,i) in summary.events" :key="i"
            :class="['ev-item', ev.type==='success'||ev.type==='event-good'?'ev-good':ev.type==='warning'||ev.type==='event-bad'?'ev-bad':'ev-info']">
            {{ ev.text }}
          </div>
        </div>

        <!-- Crit/bug banners -->
        <div v-if="summary.critSuccess" style="background:#282000;border:3px solid #706000;padding:8px;text-align:center;font-size:8px;color:#ffe040">
          ⭐ KRİTİK BAŞARI — İLERLEME 2X!
        </div>
        <div v-if="summary.bugEvent" style="background:#200808;border:3px solid #600000;padding:8px;text-align:center;font-size:8px;color:#f04040">
          🐛 BUG PATLAMASI — İLERLEME DÜŞTÜ!
        </div>
        <!-- Risk warning -->
        <div v-if="summary.triggeredRisk" style="background:#3a0808;border:3px solid #601010;padding:8px;font-size:7px;color:#f08080;line-height:1.8">
          🚨 RİSK TETİKLENDİ: <span style="color:#ffe4a0">{{ summary.triggeredRisk.name }}</span>
        </div>

        <button @click="$emit('close')" class="pixel-btn-green" style="padding:12px;font-size:10px;width:100%">
          DEVAM ET ▶
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ summary:Object })
defineEmits(['close'])
</script>

<style scoped>
.pixel-panel { background:#b08050;border:4px solid #5a3018;box-shadow:inset 3px 3px 0 #d4a870,inset -3px -3px 0 #7a4828,4px 4px 0 #1a0a04; }
.pixel-title-bar { background:#4a3018;border-bottom:3px solid #2a1008; }
.pixel-btn-green { background:#3a8030;color:#c8f090;border:3px solid #1a4018;box-shadow:0 4px 0 #0a2008;cursor:pointer;font-family:'Press Start 2P',monospace; }
.pixel-btn-green:hover { background:#4a9040; }
.pixel-btn-green:active { transform:translateY(4px);box-shadow:0 0 0; }

.modal-popin { animation:popin 0.35s cubic-bezier(0.175,0.885,0.32,1.275); }
@keyframes popin { 0%{transform:scale(0.7);opacity:0}100%{transform:scale(1);opacity:1} }

.pixel-stat { background:#6a4828;border:3px solid #3a1808;box-shadow:inset 1px 1px 0 #2a1008;padding:8px;text-align:center; }

.ev-item { font-size:5px;padding:3px 5px;border:2px solid;line-height:1.8; }
.ev-good { background:#1a3010;color:#80d060;border-color:#2a4818; }
.ev-bad  { background:#3a2808;color:#f0a040;border-color:#503810; }
.ev-info { background:#2a1808;color:#c09060;border-color:#3a2810; }
</style>