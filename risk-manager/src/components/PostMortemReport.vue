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

        <!-- Risk Management Score & Competition Score -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 border rounded" :style="{ borderColor: theme.panelBorder, background: '#0a0c18' }">
            <h3 class="text-sm mb-3" :style="{ color: '#80a0f0' }">🎯 RM Puanı</h3>
            <div class="flex items-center gap-4 mb-3">
              <div class="text-3xl font-bold" :style="{ color: riskScoreLabel.color }">{{ riskManagementScore }}</div>
              <div>
                <div class="text-xs mb-1" :style="{ color: riskScoreLabel.color }">{{ riskScoreLabel.label }}</div>
              </div>
            </div>
          </div>
          <div class="p-3 border rounded" :style="{ borderColor: '#4a2060', background: '#1a0c20' }">
            <h3 class="text-sm mb-3" :style="{ color: '#d0a0f0' }">🏆 YARIŞMA SKORU</h3>
            <div class="flex items-center gap-4 mb-3">
              <div class="text-4xl font-bold text-white" style="text-shadow: 2px 2px 0 #d0a0f0">{{ gs.score.toLocaleString() }}</div>
            </div>
            <div class="text-[9px]" style="color:#a080c0">Kararlar, riskler ve bütçe performansınızın toplamı!</div>
          </div>
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

        <!-- Action Button & Leaderboard -->
        <div class="mt-4 border-t pt-4" :style="{ borderColor: theme.panelBorder }">
          <div v-if="!scoreSaved" class="flex flex-col gap-3 items-center">
            <div class="text-xs text-white" style="color:#d0a0f0">Skorunu liderlik tablosuna kaydet!</div>
            <div class="flex gap-2 w-full justify-center">
              <input v-model="playerName" type="text" placeholder="Adınız..." class="pixel-input px-3 py-2 text-sm bg-black border-2 text-white" style="border-color:#4a2060; outline:none; max-width:200px" maxlength="15">
              <button @click="saveScore" :disabled="!playerName.trim()" class="pixel-btn bg-[#4a2060] text-white py-2 px-4 text-sm border-2 disabled:opacity-50 disabled:cursor-not-allowed" style="border-color:#6a4080">KAYDET</button>
            </div>
            <button @click="$emit('restart')" class="pixel-btn py-2 px-6 text-xs mt-2 text-gray-400">KAYDETMEDEN ÇIK</button>
          </div>
          <div v-else class="flex flex-col gap-3">
            <div class="text-center text-sm font-bold" style="color:#d0a0f0">🏆 LİDERLİK TABLOSU 🏆</div>
            <div class="bg-black/50 border rounded p-2" :style="{ borderColor: '#4a2060' }">
              <div v-for="(entry, idx) in leaderboard" :key="idx" class="flex justify-between items-center py-2 px-2 border-b border-gray-800 last:border-0" :class="entry.isCurrent ? 'bg-[#2a1438] font-bold rounded' : ''">
                <span class="text-xs text-gray-300">{{ idx + 1 }}. {{ entry.name }}</span>
                <span class="text-xs text-[#d0a0f0]">{{ entry.score.toLocaleString() }}</span>
              </div>
            </div>
            <div class="text-center mt-2">
              <button @click="$emit('restart')" class="pixel-btn py-3 px-6 text-sm" :class="isVictory ? 'pixel-btn-green' : ''">
                ↺ YENİ PROJE (RESTART)
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'

const playerName = ref('')
const scoreSaved = ref(false)
const leaderboard = ref([])

function saveScore() {
  if (!playerName.value.trim()) return
  const currentScores = JSON.parse(localStorage.getItem('rm_leaderboard') || '[]')
  currentScores.push({ name: playerName.value.trim().toUpperCase(), score: props.gs.score, date: new Date().toISOString() })
  currentScores.sort((a, b) => b.score - a.score)
  // Keep top 5
  const topScores = currentScores.slice(0, 5)
  localStorage.setItem('rm_leaderboard', JSON.stringify(topScores))
  
  // Update view
  leaderboard.value = topScores.map(x => ({ ...x, isCurrent: x.name === playerName.value.trim().toUpperCase() && x.score === props.gs.score }))
  scoreSaved.value = true
}

onMounted(() => {
  leaderboard.value = JSON.parse(localStorage.getItem('rm_leaderboard') || '[]')
})

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

const riskManagementScore = computed(() => {
  let score = 50 // baseline
  score += (props.stats.risksProactivelyHandled || 0) * 10
  score += (props.stats.critSuccesses || 0) * 8
  score -= (props.stats.bugsFixed || 0) * 12
  // Contingency reserve remaining = good planning
  const reserveRatio = (props.gs.contingencyReserve || 0) / 15000
  score += Math.floor(reserveRatio * 15)
  if (props.gs.morale > 60) score += 10
  if (props.status === 'victory') score += 20
  return Math.max(0, Math.min(100, score))
})

const riskScoreLabel = computed(() => {
  const s = riskManagementScore.value
  if (s >= 85) return { label: 'PMP SEVİYESİ', color: '#60e060', desc: 'Mükemmel risk yönetimi!' }
  if (s >= 65) return { label: 'DENEYIMLI PM', color: '#a0d060', desc: 'Güçlü bir yönetim performansı.' }
  if (s >= 45) return { label: 'GELİŞEN PM', color: '#f0c040', desc: 'Proaktif adımlar atabilirdiniz.' }
  return { label: 'ÇAYLAK PM', color: '#f08060', desc: 'Risk yönetimi becerileri geliştirmeli.' }
})

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
