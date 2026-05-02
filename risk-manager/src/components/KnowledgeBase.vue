<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900 bg-opacity-90 p-4">
    <div class="pixel-panel p-0 overflow-hidden w-[600px] max-h-[90vh] flex flex-col border-4 shadow-lg"
         :style="{ borderColor: theme.titleText, backgroundColor: theme.panelBg }">
      
      <!-- Header -->
      <div class="px-4 py-3 flex justify-between items-center"
           :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
        <div class="flex items-center gap-2">
          <span class="text-xl">📚</span>
          <span class="text-sm tracking-widest">RİSK YÖNETİMİ BİLGİ BANKASI (PMBOK®)</span>
        </div>
        <button @click="$emit('close')" class="hover:text-red-400 text-lg">✖</button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b-2" :style="{ borderColor: theme.titleBarBg }">
        <button v-for="tab in tabs" :key="tab.id"
                @click="activeTab = tab.id"
                class="flex-1 py-2 text-xs transition-colors"
                :style="activeTab === tab.id ? { backgroundColor: theme.tabActiveBg, color: theme.tabActiveText } : { color: theme.riskDescText }">
          {{ tab.name }}
        </button>
      </div>

      <!-- Content Area -->
      <div class="p-4 overflow-y-auto pixel-scrollbar flex-1 text-xs"
           style="line-height: 1.6;"
           :style="{ color: theme.riskDescText }">
        
        <!-- TEMELLER TAB -->
        <div v-if="activeTab === 'basics'" class="flex flex-col gap-4">
          <div class="p-3 bg-black/30 rounded border border-white/10">
            <h3 class="text-sm mb-2" :style="{ color: theme.chipYellowText }">Proje Risk Yönetimi Nedir?</h3>
            <p>Risk, gerçekleşmesi durumunda projenin hedeflerinden en az biri üzerinde (zaman, maliyet, kapsam veya kalite) olumlu veya olumsuz etki yaratacak belirsiz bir olay veya durumdur.</p>
          </div>
          <div class="p-3 bg-black/30 rounded border border-white/10">
            <h3 class="text-sm mb-2" :style="{ color: theme.chipYellowText }">Risk Yönetimi Süreçleri</h3>
            <ul class="list-disc pl-5 flex flex-col gap-2">
              <li><strong :style="{ color: theme.chipGreenText }">Tanımlama (Identify):</strong> Hangi risklerin projeyi etkileyebileceğini belirleme.</li>
              <li><strong :style="{ color: theme.chipGreenText }">Analiz (Analyze):</strong> Risklerin olasılıklarını ve potansiyel etkilerini hesaplama. (EMV yöntemi vb.)</li>
              <li><strong :style="{ color: theme.chipGreenText }">Planlama (Plan Responses):</strong> Tehditleri azaltmak veya fırsatları artırmak için stratejiler geliştirme.</li>
              <li><strong :style="{ color: theme.chipGreenText }">İzleme (Monitor):</strong> Proje boyunca belirlenen riskleri takip etme ve yeni riskleri tespit etme.</li>
            </ul>
          </div>
        </div>

        <!-- STRATEJİLER TAB -->
        <div v-if="activeTab === 'strategies'" class="flex flex-col gap-4">
          <p class="mb-2">Tehditlere karşı kullanılan 4 temel proje yönetimi (PMI) stratejisi şunlardır:</p>
          
          <div class="flex gap-3 items-start p-3 bg-black/30 rounded border border-white/10">
            <div class="text-2xl">🛑</div>
            <div>
              <h4 class="text-sm" :style="{ color: theme.chipRedText || '#ff6b6b' }">Kaçınma (Avoid)</h4>
              <p class="text-[10px] mt-1">Riski tamamen ortadan kaldırmak için proje planını değiştirmektir. <strong>Örnek:</strong> Çok hatalı olan bir yazılım modülünü projeden tamamen çıkarmak.</p>
            </div>
          </div>

          <div class="flex gap-3 items-start p-3 bg-black/30 rounded border border-white/10">
            <div class="text-2xl">🛡️</div>
            <div>
              <h4 class="text-sm" :style="{ color: theme.chipYellowText }">Azaltma (Mitigate)</h4>
              <p class="text-[10px] mt-1">Riskin olasılığını veya etkisini kabul edilebilir bir seviyeye düşürmektir. <strong>Örnek:</strong> Hata çıkma riskine karşı fazladan test uzmanı (QA) işe almak.</p>
            </div>
          </div>

          <div class="flex gap-3 items-start p-3 bg-black/30 rounded border border-white/10">
            <div class="text-2xl">📄</div>
            <div>
              <h4 class="text-sm" :style="{ color: theme.chipBlueText || '#4dabf7' }">Aktarma (Transfer)</h4>
              <p class="text-[10px] mt-1">Riskin etkisini ve yönetim sorumluluğunu üçüncü bir tarafa devretmektir. <strong>Örnek:</strong> Sunucu çökme riskine karşı sigorta yaptırmak veya sunucu yönetimini bir bulut şirketine ihale etmek.</p>
            </div>
          </div>

          <div class="flex gap-3 items-start p-3 bg-black/30 rounded border border-white/10">
            <div class="text-2xl">✅</div>
            <div>
              <h4 class="text-sm" :style="{ color: theme.chipGreenText }">Kabullenme (Accept)</h4>
              <p class="text-[10px] mt-1">Risk için proaktif bir eylemde bulunmamak ve eğer gerçekleşirse sonuçlarıyla başa çıkmaya karar vermektir (Yedek akçe/Contingency reserve ayırmak). <strong>Örnek:</strong> Düşük etkili bir riski bilerek göz ardı etmek.</p>
            </div>
          </div>
        </div>

        <!-- METRİKLER TAB -->
        <div v-if="activeTab === 'metrics'" class="flex flex-col gap-4">
          <div class="p-3 bg-black/30 rounded border border-white/10">
            <h3 class="text-sm mb-2" :style="{ color: theme.chipYellowText }">EMV (Expected Monetary Value - Beklenen Parasal Değer)</h3>
            <p class="mb-2">Bir riskin ortalama maliyetini hesaplamak için kullanılan istatistiksel bir yöntemdir.</p>
            <div class="p-2 bg-black/50 text-center border border-white/20 mb-2 font-bold" :style="{ color: theme.chipGreenText }">
              EMV = Risk Olasılığı (%) × Riskin Etkisi ($)
            </div>
            <p class="text-[10px]">
              <strong>Neden Önemli?</strong> Olasılığı %10, maliyeti 100.000$ olan bir riskin (EMV = 10.000$), Olasılığı %80, maliyeti 5.000$ olan bir riskten (EMV = 4.000$) matematiksel olarak daha tehlikeli olduğunu gösterir. Kararlarınızı EMV değerlerine göre verin!
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  theme: Object
})
const emit = defineEmits(['close'])

const tabs = [
  { id: 'basics', name: 'TEMELLER' },
  { id: 'strategies', name: 'STRATEJİLER' },
  { id: 'metrics', name: 'METRİKLER' }
]
const activeTab = ref('basics')
</script>

<style scoped>
/* Scoped styles if necessary */
</style>
