<template>
  <div style="display:flex;flex-direction:column;gap:6px">
    <div style="font-size:5px;color:#8a7050;padding:2px 4px;border-bottom:2px solid #3a2010;margin-bottom:2px">
      ⚙ TEKNOLOJİ YATIRIMLARI
    </div>
    <div v-for="upg in upgrades" :key="upg.id" :class="['upgrade-card', upg.bought?'upgrade-bought':'upgrade-idle']">
      <div style="padding:8px;display:flex;align-items:start;gap:6px">
        <div :class="['upgrade-icon', upg.bought?'upgrade-icon-bought':'']">{{ upg.icon }}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;align-items:start">
            <div style="font-size:10px;color:#ffe4a0;line-height:1.6">{{ upg.name }}</div>
            <div v-if="!upg.bought">
              <button @click="$emit('buy',upg.id)" :disabled="money<upg.cost"
                :class="['upgrade-buy-btn', money>=upg.cost?'upgrade-buy-btn-active':'upgrade-buy-btn-disabled']">
                ${{ upg.cost.toLocaleString() }}
              </button>
            </div>
            <div v-else style="font-size:8px;color:#a060f0;padding:4px 6px;background:#1a0a30;border:2px solid #401060">✓AKTİF</div>
          </div>
          <div class="body-text" style="color:#e8d8c8;margin-top:6px;line-height:1.5">{{ upg.desc }}</div>
        </div>
      </div>
      <div v-if="upg.bought" class="upgrade-bought-bar"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({ upgrades:Array, money:Number })
defineEmits(['buy'])
</script>

<style scoped>
.upgrade-card { border:3px solid;position:relative;overflow:hidden;transition:all 0.15s;box-shadow:2px 2px 0 #1a0a04; }
.upgrade-idle   { background:#7a5030;border-color:#3a1808; }
.upgrade-bought { background:#201030;border-color:#601090; }
.upgrade-bought-bar { position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#a060f0,transparent); }

.upgrade-icon {
  width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;
  background:#3a2010;border:2px solid #2a1008;box-shadow:inset 1px 1px 0 #4a3020;flex-shrink:0;
}
.upgrade-icon-bought { background:#180a28;border-color:#502080; }

.upgrade-buy-btn {
  font-family:'Press Start 2P',monospace;font-size:8px;padding:6px 8px;border:2px solid;cursor:pointer;
  box-shadow:0 2px 0;
}
.upgrade-buy-btn-active    { background:#2a5020;color:#80d060;border-color:#1a3010;box-shadow:0 2px 0 #0a1808; }
.upgrade-buy-btn-active:hover { background:#3a6030; }
.upgrade-buy-btn-active:active { transform:translateY(2px);box-shadow:0 0 0; }
.upgrade-buy-btn-disabled  { background:#1a1810;color:#3a3028;border-color:#0a0808;cursor:not-allowed;box-shadow:none; }
</style>