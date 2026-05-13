<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900 bg-opacity-90 p-4">
    <div class="sc-panel">

      <div class="sc-titlebar">
        <span class="text-xl">🎯</span>
        <span>SENARYO SEÇ</span>
        <span style="font-size:7px;color:#5a4020">PMBOK Risk Senaryoları</span>
      </div>

      <div class="sc-intro">
        Her senaryo farklı bir risk yönetimi stratejisini test eder. Hedeflerin ve kısıtlamaların farklıdır.
      </div>

      <div class="sc-grid">
        <div v-for="sc in scenarios" :key="sc.id"
             class="sc-card"
             :class="{ 'sc-card-selected': selected === sc.id }"
             @click="selected = sc.id">
          <div class="sc-card-header">
            <span class="sc-icon">{{ sc.icon }}</span>
            <div>
              <div class="sc-name">{{ sc.name }}</div>
              <span class="sc-difficulty" :style="{ borderColor: sc.diffColor, color: sc.diffColor }">{{ sc.difficulty }}</span>
            </div>
          </div>
          <div class="sc-desc">{{ sc.desc }}</div>
          <div class="sc-goal">🏆 {{ sc.eduGoal }}</div>
          <div class="sc-pmbok">📘 {{ sc.pmbok }}</div>
        </div>
      </div>

      <div class="sc-footer">
        <button class="sc-btn-start" :disabled="!selected" @click="$emit('scenarioSelected', selected)">
          SENARYOYU BAŞLAT ▶
        </button>
        <button class="sc-btn-skip" @click="$emit('skip')">
          Senaryosuz Oyna (Serbest Mod)
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ theme: Object })
defineEmits(['scenarioSelected', 'skip'])

const selected = ref(null)

const scenarios = [
  {
    id: 'SC-01',
    icon: '🛡️',
    name: 'SIFIR TOLERANS',
    difficulty: 'ZOR',
    diffColor: '#f06060',
    desc: '+$10K başlangıç bütçesi. Risk üretim hızı ×2. Kaçın ve Transfer stratejileri zorlanır.',
    eduGoal: 'Hiç Kritik risk tetiklemeden 30 günü tamamla.',
    pmbok: 'Avoid stratejisinin sürdürülemez maliyetini öğren.',
  },
  {
    id: 'SC-02',
    icon: '🚀',
    name: 'HIZLI TESLİMAT',
    difficulty: 'UZMAN',
    diffColor: '#f0a040',
    desc: 'Deadline 20 güne sıkıştırıldı. Accept her gün cazip görünür, ama risklidir.',
    eduGoal: '20. günden önce 1000 ilerleme noktasına ulaş.',
    pmbok: 'Accept stratejisinin kümülatif tehlikesini gör.',
  },
  {
    id: 'SC-03',
    icon: '📊',
    name: 'EMV USTASI',
    difficulty: 'ORTA',
    diffColor: '#60d080',
    desc: 'Standart parametreler. EMV-optimal kararlara ×1.5 skor bonusu verilir.',
    eduGoal: 'Bitişte $30K+ bütçe VE moral >%70 ile zafer.',
    pmbok: 'EMV bazlı karar vermede ustalık kazan.',
  },
]
</script>

<style scoped>
.sc-panel {
  width: 820px; max-height: 90vh; overflow-y: auto;
  background: #1a1008; border: 4px solid #3a2010;
  box-shadow: 6px 6px 0 #060302, inset 2px 2px 0 #2a1c0c;
  display: flex; flex-direction: column;
}
.sc-titlebar {
  background: #2a1408; border-bottom: 3px solid #1a0c04;
  padding: 12px 16px; display: flex; align-items: center; gap: 10px;
  font-family: 'Press Start 2P', monospace; font-size: 13px; color: #ffe4a0;
}
.sc-intro {
  padding: 10px 16px; background: #0c1820; border-bottom: 2px solid #1a3040;
  font-family: 'Press Start 2P', monospace; font-size: 7px; color: #5888a8; line-height: 2;
}
.sc-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; padding: 16px;
}
.sc-card {
  background: #140e06; border: 3px solid #2a1808;
  padding: 14px; cursor: pointer; transition: border-color 0.15s, background 0.15s;
  display: flex; flex-direction: column; gap: 10px;
}
.sc-card:hover { border-color: #5a3820; background: #1c1208; }
.sc-card-selected { border-color: #60c040 !important; background: #0a1808 !important; }

.sc-card-header {
  display: flex; align-items: center; gap: 10px;
}
.sc-icon { font-size: 28px; flex-shrink: 0; }
.sc-name {
  font-family: 'Press Start 2P', monospace; font-size: 9px; color: #ffe4a0; margin-bottom: 5px;
}
.sc-difficulty {
  font-family: 'Press Start 2P', monospace; font-size: 6px;
  border: 2px solid; padding: 2px 6px; display: inline-block;
}
.sc-desc {
  font-family: 'Press Start 2P', monospace; font-size: 7px; color: #a08060; line-height: 2;
  background: #0c0a06; border: 1px solid #2a1c0c; padding: 8px;
}
.sc-goal {
  font-family: 'Press Start 2P', monospace; font-size: 6px; color: #60d080; line-height: 2;
  background: #081408; border-left: 3px solid #204820; padding: 5px 8px;
}
.sc-pmbok {
  font-family: 'Press Start 2P', monospace; font-size: 6px; color: #6090c0; line-height: 2;
  background: #080e18; border-left: 3px solid #183050; padding: 5px 8px;
}

.sc-footer {
  border-top: 3px solid #1a0c04; padding: 14px 16px;
  display: flex; flex-direction: column; gap: 10px;
}
.sc-btn-start {
  font-family: 'Press Start 2P', monospace; font-size: 13px; cursor: pointer;
  padding: 16px; letter-spacing: 3px;
  background: #2a6020; color: #a0e080; border: 4px solid #184010;
  box-shadow: 0 4px 0 #0a2008; transition: filter 0.1s, transform 0.1s;
}
.sc-btn-start:disabled { opacity: 0.4; cursor: not-allowed; }
.sc-btn-start:not(:disabled):hover { filter: brightness(1.2); }
.sc-btn-start:not(:disabled):active { transform: translateY(4px); box-shadow: 0 0 0; }

.sc-btn-skip {
  font-family: 'Press Start 2P', monospace; font-size: 8px; cursor: pointer;
  padding: 10px; background: transparent; color: #5a4020;
  border: 2px solid #2a1808; transition: color 0.15s;
}
.sc-btn-skip:hover { color: #a08040; border-color: #4a3020; }
</style>
