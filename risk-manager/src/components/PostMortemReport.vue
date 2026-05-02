<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-95 p-4">
    <div class="pixel-panel p-0 overflow-hidden w-[650px] max-h-[95vh] flex flex-col shadow-2xl"
         :style="{ border: '4px solid ' + (isVictory ? '#286020' : '#802020'), backgroundColor: theme.panelBg }">
      
      <!-- Title Bar -->
      <div class="px-4 py-3 text-center text-lg"
           :style="{ backgroundColor: isVictory ? '#184010' : '#401010', color: '#fff' }">
        {{ isVictory ? '★ PROJE BAŞARIYLA TAMAMLANDI ★' : '✖ PROJE BAŞARISIZ OLDU' }}
      </div>

      <div class="p-6 overflow-y-auto pixel-scrollbar flex flex-col gap-5 text-xs" :style="{ color: theme.riskDescText }">
        
        <!-- Header Info -->
        <div class="flex items-center gap-4">
          <div class="text-6xl" :class="isVictory ? 'bounce-anim' : ''">{{ isVictory ? '🏆' : '💀' }}</div>
          <div class="flex-1">
            <h2 class="text-base font-bold mb-1" :style="{ color: isVictory ? '#a8d060' : '#f09090' }">
              SONUÇ: {{ isVictory ? 'PROJECT: NEON ZAMANINDA TESLİM EDİLDİ!' : reason }}
            </h2>
            <p>Bu ekran, PMBOK (Project Management Body of Knowledge) standartlarına göre "Kapanış Süreci"nin (Closing Process Group) bir parçası olan <strong>Alınan Dersler (Lessons Learned)</strong> raporudur.</p>
          </div>
        </div>

        <!-- Project Metrics -->
        <div class="p-3 bg-black/40 border rounded grid grid-cols-2 gap-4" :style="{ borderColor: theme.panelBorder }">
          <div>
            <div class="text-[10px] text-gray-500 mb-1">Tamamlanma Oranı</div>
            <div class="text-sm" :style="{ color: isVictory ? '#a8d060' : '#f08080' }">%{{ Math.floor((project.progress / project.totalEffort) * 100) }}</div>
          </div>
          <div>
            <div class="text-[10px] text-gray-500 mb-1">Kalan Bütçe (Cost Variance)</div>
            <div class="text-sm" :style="{ color: gs.money > 0 ? '#80c0ff' : '#f08080' }">${{ gs.money.toLocaleString() }}</div>
          </div>
          <div>
            <div class="text-[10px] text-gray-500 mb-1">Kalan Süre (Schedule Variance)</div>
            <div class="text-sm" :style="{ color: project.deadline >= 0 ? '#f0d060' : '#f08080' }">{{ project.deadline }} Gün</div>
          </div>
          <div>
            <div class="text-[10px] text-gray-500 mb-1">Takım Morali</div>
            <div class="text-sm" :style="{ color: gs.morale > 50 ? '#a8d060' : '#f08080' }">%{{ gs.morale }}</div>
          </div>
        </div>

        <!-- Risk Audit Section -->
        <div>
          <h3 class="text-sm mb-2 border-b pb-1" :style="{ color: theme.chipYellowText, borderColor: theme.panelBorder }">Risk Yönetimi Denetimi (Risk Audit)</h3>
          <ul class="list-disc pl-5 flex flex-col gap-2">
            <li>
              <strong>Bug Patlamaları:</strong> <span :style="{color: stats.bugsFixed > 0 ? '#f08080' : '#a8d060'}">{{ stats.bugsFixed }} kez</span> gerçekleşti. 
              <span class="text-[10px] text-gray-400 block mt-1">Eğer yüksekse, "Code Review" (Azaltma/Mitigate) yatırımı eksik kalmış veya ekip yorgunluktan kaliteyi düşürmüş olabilir.</span>
            </li>
            <li>
              <strong>Kritik Başarılar:</strong> <span style="color:#ffe4a0">{{ stats.critSuccesses }} kez</span> tetiklendi.
              <span class="text-[10px] text-gray-400 block mt-1">Yüksek moral ve doğru ekip sinerjisinin yarattığı pozitif risklerin (Fırsat/Exploit) sonucudur.</span>
            </li>
            <li>
              <strong>Çözülen İkilemler (Case Studies):</strong> <span style="color:#80c0ff">{{ stats.dilemmasResolved }} vaka</span> çözüldü.
              <span class="text-[10px] text-gray-400 block mt-1">PM olarak kapsam kayması veya kaynak problemleri karşısında verdiğiniz yönetsel kararların sayısı.</span>
            </li>
          </ul>
        </div>

        <!-- AI Feedback -->
        <div class="p-3 bg-[#0a141a] border border-[#1a3040] rounded flex gap-3 items-start mt-2">
          <div class="text-2xl">🤖</div>
          <div>
            <h4 class="text-xs mb-1" style="color:#80b0f0">Uzman Sistem Geri Bildirimi</h4>
            <p class="text-[10px]" style="line-height:1.5">
              {{ generateFeedback() }}
            </p>
          </div>
        </div>

        <!-- Action Button -->
        <div class="mt-4 text-center">
          <button @click="$emit('restart')" class="pixel-btn py-3 px-6 text-sm" :class="isVictory ? 'pixel-btn-green' : ''">
            ↺ YENİ PROJE (RESTART)
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: String,
  reason: String,
  project: Object,
  stats: Object,
  gs: Object,
  theme: Object
})

defineEmits(['restart'])

const isVictory = computed(() => props.status === 'victory')

function generateFeedback() {
  let feedback = ''
  if (props.stats.bugsFixed > 3) {
    feedback += 'Teknik borç ve hata oranı çok yüksek. Kalite Güvence (QA) süreçlerine daha fazla yatırım yapmalısınız (Mitigate). '
  }
  if (props.gs.money < 10000 && props.gs.money > 0) {
    feedback += 'Bütçeyi sınırda yönettiniz. Risk yanıt stratejilerinde (Transfer/Avoid) harcanan paralar contingency reserve (yedek akçe) hesabınızı zorlamış olabilir. '
  }
  if (props.gs.morale < 30) {
    feedback += 'Ekip motivasyonu çok düşük. Proje yönetiminde sadece bütçe ve zaman değil, "İnsan Kaynakları" yönetimi de kritiktir. Çalışanlarınız tükenmiş (Burnout). '
  }
  if (props.status === 'victory' && props.gs.money > 30000 && props.gs.morale > 60) {
    feedback += 'Mükemmel bir denge! Hem zaman/maliyet kısıtlarını yönettiniz, hem de ekibin moralini korudunuz. Tam bir PMP (Project Management Professional) performansı.'
  }
  if (!feedback) {
    feedback = 'Proje yönetimi sürekli bir dengeleme eylemidir (Demir Üçgen: Kapsam, Zaman, Maliyet). Bir sonraki projede EMV (Beklenen Parasal Değer) analizine daha çok dikkat edin.'
  }
  return feedback
}
</script>
