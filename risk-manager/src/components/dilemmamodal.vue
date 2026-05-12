<template>
  <div class="dl-backdrop">
    <div class="dl-bg" @click="$emit('close')"></div>
    <div class="dl-panel modal-popin">

      <!-- Title bar -->
      <div class="dl-titlebar">
        <span class="dl-icon">{{ dilemma.icon || '❓' }}</span>
        <div>
          <div class="dl-subtitle">— OFİS İKİLEMİ —</div>
          <div class="dl-title">{{ dilemma.title }}</div>
        </div>
      </div>

      <!-- PMBOK banner -->
      <div v-if="dilemma.pmbokTag" class="dl-pmbok-banner">
        <span class="dl-pmbok-tag">📘 PMBOK</span>
        <span class="dl-pmbok-text">{{ dilemma.pmbokTag }}</span>
      </div>

      <div class="dl-body">

        <!-- Description -->
        <div class="dl-desc">{{ dilemma.desc }}</div>

        <!-- PM Context -->
        <div v-if="dilemma.pmContext" class="dl-context">
          <div class="dl-context-label">📋 PM NOTU</div>
          <div class="dl-context-text">{{ dilemma.pmContext }}</div>
        </div>

        <!-- Options -->
        <div class="dl-options">
          <button @click="$emit('choose','a')" class="dl-btn dl-btn-a">
            <span class="dl-choice-key">A</span>
            <div class="dl-choice-body">
              <span class="dl-choice-text">{{ dilemma.optA.text }}</span>
              <span v-if="dilemma.optA.pmLabel" class="dl-choice-pm dl-choice-pm-a">{{ dilemma.optA.pmLabel }}</span>
            </div>
          </button>
          <button @click="$emit('choose','b')" class="dl-btn dl-btn-b">
            <span class="dl-choice-key">B</span>
            <div class="dl-choice-body">
              <span class="dl-choice-text">{{ dilemma.optB.text }}</span>
              <span v-if="dilemma.optB.pmLabel" class="dl-choice-pm dl-choice-pm-b">{{ dilemma.optB.pmLabel }}</span>
            </div>
          </button>
        </div>

        <div class="dl-footer-text">— KARARININ SONUÇLARIYLA YAŞA —</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['dilemma'])
defineEmits(['choose', 'close'])
</script>

<style scoped>
.dl-backdrop {
  position: fixed; inset: 0; z-index: 50;
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.dl-bg {
  position: absolute; inset: 0; background: rgba(0,0,0,0.80);
}
.dl-panel {
  width: 660px;
  position: relative; z-index: 1; overflow: hidden;
  background: #7a5030;
  border: 4px solid #5a3018;
  box-shadow: inset 3px 3px 0 #9a7050, inset -3px -3px 0 #5a3018, 6px 6px 0 #1a0a04;
}

.modal-popin { animation: popin 0.4s cubic-bezier(0.175,0.885,0.32,1.275); }
@keyframes popin { 0%{transform:scale(0.6) translateY(20px);opacity:0} 100%{transform:scale(1) translateY(0);opacity:1} }

/* Title bar */
.dl-titlebar {
  background: #3a2010; border-bottom: 3px solid #1a0c04;
  padding: 14px 20px; display: flex; align-items: center; gap: 16px;
}
.dl-icon    { font-size: 32px; flex-shrink: 0; }
.dl-subtitle {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px; color: #c8a060; letter-spacing: 3px; margin-bottom: 6px;
}
.dl-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 13px; color: #ffe4a0; letter-spacing: 1px; line-height: 1.7;
}

/* PMBOK banner */
.dl-pmbok-banner {
  background: rgba(20,40,90,0.7); border-bottom: 2px solid #2a4080;
  padding: 10px 20px; display: flex; align-items: center; gap: 12px;
}
.dl-pmbok-tag {
  font-family: 'Press Start 2P', monospace; font-size: 8px;
  padding: 4px 10px; background: #2a4090; color: #80b0ff;
  border: 2px solid #4060c0; white-space: nowrap; flex-shrink: 0;
}
.dl-pmbok-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px; color: #9ab8f0; line-height: 2.0;
}

/* Body */
.dl-body {
  padding: 20px 22px; display: flex; flex-direction: column; gap: 14px;
}

.dl-desc {
  background: #4a2e14; border: 3px solid #2a1808;
  box-shadow: inset 2px 2px 0 #1a0c04;
  padding: 16px 18px;
  font-family: 'Press Start 2P', monospace; font-size: 10px; color: #c8a878; line-height: 2.6;
}

/* PM context */
.dl-context {
  background: rgba(0,30,70,0.55); border: 2px solid #1a3060; border-left: 5px solid #4080c0;
  padding: 12px 14px;
}
.dl-context-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px; color: #6090d0; margin-bottom: 7px; letter-spacing: 2px;
}
.dl-context-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px; color: #8ab0d8; line-height: 2.4;
}

/* Options */
.dl-options { display: flex; flex-direction: column; gap: 10px; }

.dl-btn {
  font-family: 'Press Start 2P', monospace;
  padding: 16px 18px; border: 3px solid; cursor: pointer;
  display: flex; align-items: flex-start; gap: 16px;
  transition: filter 0.1s, transform 0.1s;
  text-align: left; width: 100%;
}
.dl-btn:hover  { filter: brightness(1.25); transform: translateX(4px); }
.dl-btn:active { transform: translateY(3px); box-shadow: 0 0 0 !important; }

.dl-btn-a { background: #0e2808; color: #80e050; border-color: #1a4810; box-shadow: 0 5px 0 #060e04; }
.dl-btn-b { background: #280a0a; color: #f08060; border-color: #481010; box-shadow: 0 5px 0 #0c0404; }

.dl-choice-key {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; flex-shrink: 0;
  background: rgba(255,255,255,0.12); border: 2px solid rgba(255,255,255,0.25);
  font-size: 12px;
}
.dl-choice-body { display: flex; flex-direction: column; gap: 6px; }
.dl-choice-text { font-size: 10px; line-height: 2.0; }
.dl-choice-pm   { font-size: 8px; opacity: 0.85; letter-spacing: 1px; line-height: 1.8; }
.dl-choice-pm-a { color: #60c0a0; }
.dl-choice-pm-b { color: #c06060; }

.dl-footer-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px; color: #4a3820; text-align: center; letter-spacing: 2px;
}
</style>