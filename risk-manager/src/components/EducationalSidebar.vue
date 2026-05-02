<template>
  <div class="educational-sidebar" :style="{ backgroundColor: theme.panelBg, borderColor: theme.panelBorder }">
    <div class="pixel-title-bar px-4 py-2 text-center text-xs" :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
      {{ side === 'left' ? '📚 PLANLAMA & TANIMLAMA' : '📚 ANALİZ & STRATEJİ' }}
    </div>
    
    <div class="flex-1 overflow-y-auto pixel-scrollbar p-3 flex flex-col gap-4">
      <div v-for="(card, index) in cards" :key="index" class="edu-card" :style="{ backgroundColor: theme.hudBg, borderColor: theme.titleBarBg }">
        <div class="edu-card-title pixel-font" :style="{ color: theme.chipYellowText }">
          {{ card.icon }} {{ card.title }}
        </div>
        <div class="body-text text-sm leading-relaxed" :style="{ color: theme.riskDescText }">
          {{ card.content }}
        </div>
        <div v-if="card.highlight" class="mt-2 text-xs font-bold p-2" :style="{ backgroundColor: 'rgba(0,0,0,0.3)', color: theme.chipGreenText, borderLeft: '3px solid ' + theme.chipGreen }">
          {{ card.highlight }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  side: { type: String, required: true },
  theme: { type: Object, required: true }
})

const leftCards = [
  {
    icon: '❓',
    title: 'RİSK NEDİR?',
    content: 'Proje hedeflerini olumlu veya olumsuz etkileyebilecek belirsiz bir olay veya durumdur. Her belirsizlik kötü değildir; olumlu risklere "Fırsat", olumsuz risklere "Tehdit" denir.'
  },
  {
    icon: '📋',
    title: 'RİSK KAYDI (REGISTER)',
    content: 'Tüm tanımlanmış risklerin, potansiyel etkilerinin ve planlanan yanıt stratejilerinin tutulduğu yaşayan bir belgedir. Proje boyunca sürekli güncellenir.'
  },
  {
    icon: '⚖️',
    title: 'NİTEL RİSK ANALİZİ',
    content: 'Risklerin önceliklendirilmesidir. "Olasılık ve Etki Matrisi" (Probability/Impact Matrix) kullanılarak risklere Yüksek, Orta, Düşük gibi subjektif değerler verilir.',
    highlight: 'Hızlıdır ancak kesin matematiksel sonuç vermez.'
  },
  {
    icon: '🧠',
    title: 'TANIMLAMA TEKNİKLERİ',
    content: 'IT projelerinde riskleri bulmak için Beyin Fırtınası (Brainstorming), Delphi Tekniği (Uzman görüşü) ve SWOT Analizi (Güçlü/Zayıf Yönler) yaygın olarak kullanılır.'
  }
]

const rightCards = [
  {
    icon: '📊',
    title: 'EMV (BEKLENEN DEĞER)',
    content: 'Nicel (Quantitative) risk analizi yöntemidir. Oyundaki risk kararlarınızı istatistiksel bir temele oturtur.',
    highlight: 'EMV = Olasılık (%) x Etki ($)'
  },
  {
    icon: '🛡️',
    title: 'YANIT STRATEJİLERİ',
    content: 'PMBOK standartlarına göre olumsuz riskler için 4 temel strateji vardır: Avoid (Kaçın - Riski sıfırla), Mitigate (Azalt - Etkiyi düşür), Transfer (Aktar - Sigorta/Outsource), Accept (Kabul Et).'
  },
  {
    icon: '🐛',
    title: 'KAPSAM KAYMASI',
    content: 'Müşterinin proje süresince sürekli yeni "küçük" özellikler istemesi (Scope Creep). IT projelerinin bir numaralı başarısızlık sebebidir.',
    highlight: 'Önlem: Sıkı bir Değişiklik Kontrol Sistemi (Change Control).'
  },
  {
    icon: '⏱️',
    title: 'TEKNİK BORÇ',
    content: 'Kısa vadede hızlı teslimat için kod kalitesinden ödün verilmesidir. Uzun vadede bakım maliyeti, performans sorunları ve bug (hata) riski olarak geri döner (Technical Debt).'
  }
]

const cards = computed(() => props.side === 'left' ? leftCards : rightCards)
</script>

<style scoped>
.educational-sidebar {
  border: 4px solid;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}
.edu-card {
  border: 2px solid;
  padding: 12px;
  box-shadow: inset 2px 2px 0 rgba(0,0,0,0.5);
}
.edu-card-title {
  font-size: 10px;
  margin-bottom: 8px;
  border-bottom: 2px dashed rgba(255,255,255,0.1);
  padding-bottom: 6px;
  line-height: 1.5;
}
.pixel-font {
  font-family: 'Press Start 2P', monospace;
}
</style>
