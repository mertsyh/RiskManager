<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900 bg-opacity-90 p-4">
    <div class="pixel-panel p-0 overflow-hidden w-[660px] flex flex-col border-4 shadow-lg"
         :style="{ borderColor: theme.titleText, backgroundColor: theme.panelBg }">
      
      <!-- Header -->
      <div class="px-4 py-3 flex items-center justify-center gap-3 border-b-4"
           :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText, borderColor: theme.panelBorder }">
        <span class="text-2xl">📋</span>
        <span class="text-sm tracking-[3px] font-bold">RİSK YÖNETİM PLANI OLUŞTUR</span>
      </div>

      <!-- Body -->
      <div class="p-6 flex flex-col gap-6" :style="{ color: theme.riskDescText }">

        <div class="text-[10px] text-center" style="line-height:2; color: #a0a0a0">
          Proje Yönetim Planı'nın (PMBOK) en kritik adımı Risk Yönetimi Planlamasıdır.
          Stratejini seç ve projeye başla.
        </div>

        <!-- Soru 1: Risk İştahı -->
        <div class="flex flex-col gap-3">
          <div class="text-xs" :style="{ color: theme.chipYellowText }">1. Kurumun Risk İştahı (Risk Appetite) Nedir?</div>
          <div class="grid grid-cols-3 gap-3">
            <button v-for="opt in appetiteOpts" :key="opt.id"
                    @click="selections.appetite = opt.id"
                    class="p-3 border-2 transition-all flex flex-col gap-2 items-center text-center"
                    :style="selections.appetite === opt.id ? 
                      { borderColor: theme.chipGreenText, backgroundColor: 'rgba(50,200,80,0.1)' } : 
                      { borderColor: theme.panelBorder, backgroundColor: 'rgba(0,0,0,0.3)' }">
              <span class="text-xl">{{ opt.icon }}</span>
              <span class="text-[9px] font-bold" :style="{ color: opt.color }">{{ opt.label }}</span>
              <span class="text-[8px] opacity-80" style="line-height:1.5">{{ opt.desc }}</span>
            </button>
          </div>
        </div>

        <!-- Soru 2: Contingency Reserve -->
        <div class="flex flex-col gap-3">
          <div class="flex justify-between items-end">
            <div class="text-xs" :style="{ color: theme.chipYellowText }">2. Contingency Reserve (Yedek Akçe)</div>
            <div class="text-[10px] bg-black/40 px-2 py-1 rounded border" :style="{ borderColor: theme.panelBorder }">
              Ana Bütçeden Ayrılacak: <strong :style="{ color: theme.chipBlueText }">${{ selections.reserve.toLocaleString() }}</strong>
            </div>
          </div>
          <div class="text-[8px] opacity-70 mb-1">Bilinen riskler için ayrılan fondur. Yüksek reserve = düşük operasyonel bütçe ama yüksek güvenlik.</div>
          <input type="range" min="5000" max="25000" step="5000" v-model.number="selections.reserve" 
                 class="w-full accent-[#80b0e0] h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer">
          <div class="flex justify-between text-[8px] text-gray-500 font-bold px-1">
            <span>$5K</span><span>$10K</span><span>$15K</span><span>$20K</span><span>$25K</span>
          </div>
        </div>

        <!-- Soru 3: Odak Alanı -->
        <div class="flex flex-col gap-3">
          <div class="text-xs" :style="{ color: theme.chipYellowText }">3. Risk Odak Alanı (Risk Focus)</div>
          <div class="text-[8px] opacity-70 mb-1">Hangi alana özel bir Mitigation (Azaltma) eforu harcayacaksın? Bu alandaki risklerin olasılığı düşer.</div>
          <div class="grid grid-cols-3 gap-3">
            <button v-for="opt in focusOpts" :key="opt.id"
                    @click="selections.focus = opt.id"
                    class="p-2 border-2 transition-all flex items-center justify-center gap-2"
                    :style="selections.focus === opt.id ? 
                      { borderColor: theme.chipGreenText, backgroundColor: 'rgba(50,200,80,0.1)' } : 
                      { borderColor: theme.panelBorder, backgroundColor: 'rgba(0,0,0,0.3)' }">
              <span class="text-lg">{{ opt.icon }}</span>
              <span class="text-[9px]">{{ opt.label }}</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Footer / Start -->
      <div class="p-4 flex flex-col gap-3 border-t-4 bg-black/30" :style="{ borderColor: theme.panelBorder }">
        <div class="text-[8px] text-center" style="color: #60a080">
          * Kararların Project Baseline (Temel Çizgi) olarak kaydedilecek.
        </div>
        <button @click="startProject" 
                class="w-full py-4 text-sm font-bold tracking-[3px] border-4 transition-all"
                :style="{ backgroundColor: '#2a6020', color: '#a0e080', borderColor: '#184010', boxShadow: '0 4px 0 #0a2008' }"
                onmouseover="this.style.filter='brightness(1.2)'"
                onmouseout="this.style.filter='brightness(1)'"
                onmousedown="this.style.transform='translateY(4px)'; this.style.boxShadow='0 0 0'"
                onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 0 #0a2008'">
          PROJEYE BAŞLA ▶
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({ theme: Object })
const emit = defineEmits(['planComplete'])

const appetiteOpts = [
  { id: 'low', label: 'DÜŞÜK', icon: '🛡️', color: '#80e080', desc: 'Güvenli başlangıç. Risk olasılıkları -%10, Bütçe $80K' },
  { id: 'medium', label: 'ORTA', icon: '⚖️', color: '#f0d060', desc: 'Dengeli yaklaşım. Normal riskler, Bütçe $100K' },
  { id: 'high', label: 'YÜKSEK', icon: '🔥', color: '#f06060', desc: 'Agresif büyüme. Risk olasılıkları +%10, Bütçe $120K' }
]

const focusOpts = [
  { id: 'technical', label: 'TEKNİK RİSKLER', icon: '💻' },
  { id: 'human', label: 'İNSAN RİSKLERİ', icon: '👥' },
  { id: 'scope', label: 'KAPSAM RİSKLERİ', icon: '📈' },
]

const selections = reactive({
  appetite: 'medium',
  reserve: 15000,
  focus: 'technical'
})

function startProject() {
  emit('planComplete', { ...selections })
}
</script>

<style scoped>
.pixel-panel {
  font-family: 'Press Start 2P', monospace;
}
button {
  font-family: 'Press Start 2P', monospace;
  cursor: pointer;
}
</style>
