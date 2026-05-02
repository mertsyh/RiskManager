<template>
  <div style="position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:16px">
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.78)" @click="$emit('close')"></div>
    <div class="pixel-panel modal-popin" style="width:420px;position:relative;z-index:1;overflow:hidden">

      <!-- Title bar -->
      <div class="pixel-title-dilemma px-4 py-2 flex items-center gap-3">
        <span style="font-size:22px">{{ dilemma.icon || '❓' }}</span>
        <div>
          <div style="font-size:6px;color:#c8a060;letter-spacing:3px;margin-bottom:2px">— OFİS İKİLEMİ —</div>
          <div style="font-size:9px;color:#ffe4a0;letter-spacing:1px">{{ dilemma.title }}</div>
        </div>
      </div>

      <div style="padding:16px;display:flex;flex-direction:column;gap:12px">
        <!-- Description -->
        <div class="pixel-inset" style="padding:10px 12px;font-size:6px;color:#c8a878;line-height:2.4">
          {{ dilemma.desc }}
        </div>

        <!-- Options -->
        <div style="display:flex;flex-direction:column;gap:8px">
          <button @click="$emit('choose','a')" class="dilemma-btn dilemma-btn-a">
            <span class="choice-label">A</span>
            <span>{{ dilemma.optA.text }}</span>
          </button>
          <button @click="$emit('choose','b')" class="dilemma-btn dilemma-btn-b">
            <span class="choice-label">B</span>
            <span>{{ dilemma.optB.text }}</span>
          </button>
        </div>

        <div style="font-size:5px;color:#4a3820;text-align:center;letter-spacing:2px">
          — KARARININ SONUÇLARIYLA YAŞA —
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['dilemma'])
defineEmits(['choose','close'])
</script>

<style scoped>
.pixel-panel { background:#7a5030;border:4px solid #5a3018;box-shadow:inset 3px 3px 0 #9a7050,inset -3px -3px 0 #5a3018,4px 4px 0 #1a0a04; }
.pixel-inset  { background:#4a2e14;border:3px solid #2a1808;box-shadow:inset 2px 2px 0 #1a0c04; }
.pixel-title-dilemma { background:#3a2010;border-bottom:3px solid #1a0c04; }

.modal-popin { animation:popin 0.4s cubic-bezier(0.175,0.885,0.32,1.275); }
@keyframes popin { 0%{transform:scale(0.6) translateY(20px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1} }

.dilemma-btn {
  font-family:'Press Start 2P',monospace; font-size:7px;
  padding:12px 14px; border:3px solid; cursor:pointer;
  display:flex; align-items:center; gap:12px;
  transition:filter 0.1s, transform 0.1s;
  text-align:left; width:100%;
}
.dilemma-btn:hover  { filter:brightness(1.25); transform:translateX(3px); }
.dilemma-btn:active { transform:translateY(3px); box-shadow:0 0 0 !important; }

.dilemma-btn-a {
  background:#0e2808; color:#80e050; border-color:#1a4810;
  box-shadow:0 4px 0 #060e04;
}
.dilemma-btn-b {
  background:#280a0a; color:#f08060; border-color:#481010;
  box-shadow:0 4px 0 #0c0404;
}

.choice-label {
  display:inline-flex; align-items:center; justify-content:center;
  width:18px; height:18px; flex-shrink:0;
  background:rgba(255,255,255,0.1); border:2px solid rgba(255,255,255,0.2);
  font-size:8px;
}
</style>