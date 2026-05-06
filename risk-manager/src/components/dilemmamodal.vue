<template>
  <div style="position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:16px">
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.78)" @click="$emit('close')"></div>
    <div class="pixel-panel modal-popin" style="width:540px;position:relative;z-index:1;overflow:hidden">

      <!-- Title bar -->
      <div class="pixel-title-dilemma px-4 py-2 flex items-center gap-3">
        <span style="font-size:22px">{{ dilemma.icon || '❓' }}</span>
        <div>
          <div style="font-size:8px;color:#c8a060;letter-spacing:3px;margin-bottom:3px">— OFİS İKİLEMİ —</div>
          <div style="font-size:11px;color:#ffe4a0;letter-spacing:1px">{{ dilemma.title }}</div>
        </div>
      </div>

      <!-- PMBOK Eğitim Banner -->
      <div v-if="dilemma.pmbokTag" class="pmbok-banner">
        <span class="pmbok-tag">📘 PMBOK</span>
        <span class="pmbok-text">{{ dilemma.pmbokTag }}</span>
      </div>

      <div style="padding:16px;display:flex;flex-direction:column;gap:12px">
        <!-- Description -->
        <div class="pixel-inset" style="padding:12px 14px;font-size:8px;color:#c8a878;line-height:2.4">
          {{ dilemma.desc }}
        </div>

        <!-- PM Context (eğitim notu) -->
        <div v-if="dilemma.pmContext" class="pm-context-box">
          <div class="pm-context-label">📋 PM NOTU</div>
          <div class="pm-context-text">{{ dilemma.pmContext }}</div>
        </div>

        <!-- Options -->
        <div style="display:flex;flex-direction:column;gap:8px">
          <button @click="$emit('choose','a')" class="dilemma-btn dilemma-btn-a">
            <span class="choice-label">A</span>
            <div class="choice-content">
              <span>{{ dilemma.optA.text }}</span>
              <span v-if="dilemma.optA.pmLabel" class="choice-pm-label">{{ dilemma.optA.pmLabel }}</span>
            </div>
          </button>
          <button @click="$emit('choose','b')" class="dilemma-btn dilemma-btn-b">
            <span class="choice-label">B</span>
            <div class="choice-content">
              <span>{{ dilemma.optB.text }}</span>
              <span v-if="dilemma.optB.pmLabel" class="choice-pm-label choice-pm-label-b">{{ dilemma.optB.pmLabel }}</span>
            </div>
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

.pmbok-banner {
  background: rgba(30, 50, 100, 0.6);
  border-bottom: 2px solid #2a4080;
  padding: 6px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Press Start 2P', monospace;
}
.pmbok-tag {
  font-size: 7px;
  padding: 3px 7px;
  background: #2a4090;
  color: #80b0ff;
  border: 1px solid #4060c0;
  white-space: nowrap;
  flex-shrink: 0;
}
.pmbok-text {
  font-size: 8px;
  color: #9ab8f0;
  line-height: 1.9;
}

.pm-context-box {
  background: rgba(0, 40, 80, 0.5);
  border: 2px solid #1a3060;
  border-left: 4px solid #4080c0;
  padding: 8px 10px;
}
.pm-context-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  color: #6090d0;
  margin-bottom: 4px;
  letter-spacing: 2px;
}
.pm-context-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: #8ab0d8;
  line-height: 2.2;
}

.modal-popin { animation:popin 0.4s cubic-bezier(0.175,0.885,0.32,1.275); }
@keyframes popin { 0%{transform:scale(0.6) translateY(20px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1} }

.dilemma-btn {
  font-family:'Press Start 2P',monospace; font-size:9px;
  padding:14px 16px; border:3px solid; cursor:pointer;
  display:flex; align-items:flex-start; gap:12px;
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

.choice-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.choice-pm-label {
  font-size: 7px;
  color: #60c0a0;
  letter-spacing: 1px;
  opacity: 0.85;
}
.choice-pm-label-b {
  color: #c06060;
}

.choice-label {
  display:inline-flex; align-items:center; justify-content:center;
  width:18px; height:18px; flex-shrink:0;
  background:rgba(255,255,255,0.1); border:2px solid rgba(255,255,255,0.2);
  font-size:8px;
}
</style>