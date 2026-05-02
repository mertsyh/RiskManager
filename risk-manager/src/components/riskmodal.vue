<template>
  <div style="position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:16px">
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.8)" @click="$emit('close')"></div>
    <div class="pixel-panel modal-popin" style="width:360px;position:relative;z-index:1;overflow:hidden">
      <!-- Title bar -->
      <div class="pixel-title-bar-red flex items-center justify-between px-3 py-2">
        <span style="font-size:8px;color:#fff">⚠ FELAKET ALARMI</span>
        <button @click="$emit('close')" class="pixel-mini-close">✕</button>
      </div>

      <div style="padding:16px;display:flex;flex-direction:column;gap:12px">
        <!-- Icon + Name -->
        <div style="text-align:center">
          <div style="font-size:42px;margin-bottom:8px">{{ risk.icon || '🚨' }}</div>
          <div style="font-size:9px;color:#ffe4a0;text-shadow:2px 2px 0 #7a4a00;line-height:2">{{ risk.name }}</div>
        </div>

        <!-- Description -->
        <div class="pixel-inset" style="padding:10px;font-size:6px;color:#c8a880;line-height:2.2;text-align:center">
          {{ risk.desc }}
        </div>

        <!-- Impact boxes -->
        <div style="display:flex;gap:8px;justify-content:center">
          <div v-if="risk.cost>0" class="impact-box impact-box-red">
            <div style="font-size:24px">💸</div>
            <div style="font-size:8px;color:#f08080;margin-top:4px">-${{ risk.cost.toLocaleString() }}</div>
            <div style="font-size:5px;color:#7a4040;margin-top:2px">BÜTÇE KAYBI</div>
          </div>
          <div v-if="risk.delay>0" class="impact-box impact-box-yellow">
            <div style="font-size:24px">⏳</div>
            <div style="font-size:8px;color:#f0c040;margin-top:4px">-{{ risk.delay }} GÜN</div>
            <div style="font-size:5px;color:#7a6020;margin-top:2px">SÜRE KAYBI</div>
          </div>
          <div v-if="risk.moralDamage" class="impact-box impact-box-purple">
            <div style="font-size:24px">😰</div>
            <div style="font-size:8px;color:#c080f0;margin-top:4px">-{{ risk.moralDamage }}</div>
            <div style="font-size:5px;color:#502070;margin-top:2px">MORAL</div>
          </div>
        </div>

        <!-- Confirm button -->
        <button @click="$emit('close')" class="pixel-btn-red" style="padding:12px;font-size:8px;width:100%">
          HASARI KABUL ET ⚡
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['risk'])
defineEmits(['close'])
</script>

<style scoped>
.pixel-panel { background:#b08050;border:4px solid #5a3018;box-shadow:inset 3px 3px 0 #d4a870,inset -3px -3px 0 #7a4828,4px 4px 0 #1a0a04; }
.pixel-inset { background:#6a4828;border:3px solid #3a1808;box-shadow:inset 2px 2px 0 #2a1008; }
.pixel-title-bar-red { background:#602020;border-bottom:3px solid #3a1010; }
.pixel-btn-red { background:#803030;color:#f09090;border:3px solid #401818;box-shadow:0 4px 0 #200808;cursor:pointer;font-family:'Press Start 2P',monospace; }
.pixel-btn-red:hover { background:#904040; }
.pixel-btn-red:active { transform:translateY(4px);box-shadow:0 0 0; }

.modal-popin { animation:popin 0.35s cubic-bezier(0.175,0.885,0.32,1.275); }
@keyframes popin { 0%{transform:scale(0.5);opacity:0}100%{transform:scale(1);opacity:1} }

.pixel-mini-close {
  font-family:'Press Start 2P',monospace; font-size:7px; padding:2px 5px;
  background:#901010; color:#fff; border:2px solid #501010; cursor:pointer;
  box-shadow:0 2px 0 #200808;
}
.pixel-mini-close:hover { background:#a02020; }
.pixel-mini-close:active { transform:translateY(2px);box-shadow:0 0 0; }

.impact-box {
  flex:1; text-align:center; padding:10px 8px;
  border:3px solid; box-shadow:inset 1px 1px 0 rgba(255,255,255,0.1),2px 2px 0 #0a0404;
}
.impact-box-red    { background:#3a0808;border-color:#601010; }
.impact-box-yellow { background:#3a2a04;border-color:#605010; }
.impact-box-purple { background:#180a30;border-color:#401060; }
</style>