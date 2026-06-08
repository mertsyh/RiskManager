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
            <div class="text-sm" :style="{ color: isVictory ? '#a8d060' : '#f08080' }">%{{ overallPct }}</div>
          </div>
          <div>
            <div class="text-[10px] text-gray-500 mb-1">Kalan Bütçe (Cost Variance)</div>
            <div class="text-sm" :style="{ color: gs.money > 0 ? '#80c0ff' : '#f08080' }">${{ gs.money.toLocaleString() }}</div>
          </div>
          <div>
            <div class="text-[10px] text-gray-500 mb-1">{{ isVictory ? 'Tamamlama Süresi' : 'Geçen Süre' }}</div>
            <div class="text-sm" style="color:#f0d060">{{ gs.day }} Gün</div>
          </div>
          <div>
            <div class="text-[10px] text-gray-500 mb-1">Takım Morali</div>
            <div class="text-sm" :style="{ color: gs.morale > 50 ? '#a8d060' : '#f08080' }">%{{ gs.morale }}</div>
          </div>
        </div>

        <!-- Teslimat Akışları (Kapsam / WBS) — her birinin tamamlanma oranı -->
        <div v-if="tracks && tracks.length" class="p-3 bg-black/40 border rounded flex flex-col gap-2" :style="{ borderColor: theme.panelBorder }">
          <div class="text-[10px] text-gray-500">Teslimat Akışları (Kapsam / WBS)</div>
          <div v-for="t in tracks" :key="t.key" class="flex items-center gap-2">
            <span class="text-sm">{{ t.icon }}</span>
            <span class="text-[11px] w-32" style="color:#c8a878">{{ t.label }}</span>
            <div class="flex-1 h-2 bg-black/60 border border-black overflow-hidden">
              <span class="block h-full" :style="{ width: t.pct+'%', background: t.pct>=100 ? '#48b838' : t.pct>=50 ? '#c0980a' : '#2868c8' }"></span>
            </div>
            <span class="text-[11px] w-10 text-right" :style="{ color: t.pct>=100 ? '#60d060' : '#f0c040' }">{{ t.pct }}%</span>
          </div>
        </div>

        <!-- Risk Audit Section -->
        <div>
          <h3 class="text-sm mb-2 border-b pb-1" :style="{ color: theme.chipYellowText, borderColor: theme.panelBorder }">Risk Yönetimi Denetimi (Risk Audit)</h3>

          <!-- 🦁 Tusler Sınıflandırma Karnesi -->
          <div class="mt-3 p-3 rounded border" style="border-color:#2a3a18; background:#0c140a">
            <div class="flex items-center justify-between mb-1">
              <h4 class="text-xs" style="color:#9ad07a">🦁 Tusler Sınıflandırma Karnesi</h4>
              <span class="text-base font-bold" :style="{ color: tuslerLabel.color }">{{ stats.tuslerTotal ? tuslerAccuracy + '%' : '—' }}</span>
            </div>
            <div class="text-[10px] text-gray-400" style="line-height:1.6">
              <template v-if="stats.tuslerTotal">
                <span style="color:#c0d0a0">{{ stats.tuslerCorrect }}/{{ stats.tuslerTotal }}</span> riskte hayvanın ideal yanıtını seçtin —
                <span :style="{ color: tuslerLabel.color }">{{ tuslerLabel.label }}</span>.
                <div class="mt-1" style="color:#6a8a52">Kural: 🐯 Kaplan→Önle · 🐊 Timsah→Aktar · 🐶 Yavru Köpek→Azalt · 🐱 Yavru Kedi→Kabul Et.</div>
              </template>
              <template v-else>
                Bu projede hiç risk çıkmadı (ya da sınıflandırmadın). Günleri ilerlettikçe çıkan riskleri doğru hayvana sınıflandırarak Tusler becerini geliştir.
              </template>
            </div>
          </div>
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
            <!-- Skor dökümü: hız + sınıflandırma isabeti ağırlıklı (leaderboard bu tek sayıyla sıralanır) -->
            <div v-if="breakdown && breakdown.items" class="flex flex-col gap-1 mb-2 pt-2 border-t" style="border-color:#3a2050">
              <div v-for="item in breakdown.items" :key="item.key" class="flex justify-between items-center text-[10px]">
                <span style="color:#b89ad0">{{ item.label }}</span>
                <span :style="{ color: item.value >= 0 ? '#c0f0a0' : '#f0a080' }">{{ item.value >= 0 ? '+' : '' }}{{ item.value.toLocaleString() }}</span>
              </div>
            </div>
            <div v-else class="text-[9px]" style="color:#a080c0">Kararlar, riskler ve bütçe performansınızın toplamı!</div>
            <div v-if="gs.loans > 0" class="text-[9px] mt-1" style="color:#e87060">🏦 {{ gs.loans }} kredi · −{{ gs.loanPenalty.toLocaleString() }} puan (kararlara dahil)</div>
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
          <!-- Save form: hem zafer hem kayıp (DNF) skoru kaydedebilir — sıralama tek sayıyla (skor) -->
          <div v-if="!scoreSaved" class="flex flex-col gap-3 items-center">
            <div v-if="isVictory" class="text-xs text-white" style="color:#d0a0f0">Projeyi <strong>{{ gs.day }} günde</strong> bitirdin — liderlik tablosuna kaydet!</div>
            <div v-else class="text-xs text-white" style="color:#d0a0f0"><strong>{{ gs.day }} gün</strong> dayandın (DNF) — yine de skorunu kaydet!</div>
            <div class="flex gap-2 w-full justify-center">
              <input v-model="playerName" type="text" placeholder="Adınız..." class="pixel-input px-3 py-2 text-sm bg-black border-2 text-white" style="border-color:#4a2060; outline:none; max-width:200px" maxlength="15">
              <button @click="saveScore" :disabled="!playerName.trim()" class="pixel-btn bg-[#4a2060] text-white py-2 px-4 text-sm border-2 disabled:opacity-50 disabled:cursor-not-allowed" style="border-color:#6a4080">KAYDET</button>
            </div>
            <button @click="$emit('restart')" class="pixel-btn py-2 px-6 text-xs mt-2 text-gray-400">KAYDETMEDEN ÇIK</button>
          </div>
          <!-- Otherwise (loss, or already saved): read-only board + restart -->
          <div v-else class="flex flex-col gap-3">
            <div class="text-center text-sm font-bold" style="color:#d0a0f0">🏆 LİDERLİK TABLOSU 🏆</div>
            <div class="text-center text-[10px] text-gray-500">En yüksek skor önde · eşitlikte az gün</div>
            <div class="bg-black/50 border rounded p-2" :style="{ borderColor: '#4a2060' }">
              <div class="flex justify-between items-center py-1 px-2 text-[9px] text-gray-500 border-b border-gray-700">
                <span class="flex-1">#  OYUNCU</span>
                <span class="w-24 text-right">SKOR</span>
                <span class="w-16 text-right">GÜN</span>
              </div>
              <div v-if="!leaderboard.length" class="py-3 text-center text-xs text-gray-500">Henüz kayıt yok — ilk sırayı sen al!</div>
              <div v-for="(entry, idx) in leaderboard" :key="idx" class="flex justify-between items-center py-2 px-2 border-b border-gray-800 last:border-0" :class="entry.isCurrent ? 'bg-[#2a1438] font-bold rounded' : ''">
                <span class="flex-1 text-xs text-gray-300">{{ idx + 1 }}. {{ entry.name }}</span>
                <span class="w-24 text-right text-xs text-[#d0a0f0]">{{ entry.score.toLocaleString() }}</span>
                <span class="w-16 text-right text-xs" :class="entry.days != null ? 'text-[#f0d060]' : 'text-[#e87060]'">{{ entry.days != null ? entry.days : 'DNF' }}</span>
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
import { sortLeaderboard } from '../scoring.js'

const playerName = ref('')
const scoreSaved = ref(false)
const leaderboard = ref([])

// v3: skor-öncelikli sıralama + kayıplar (DNF) da kaydedilir → eski gün-öncelikli v2'yle karışmasın.
const LEADERBOARD_KEY = 'rm_leaderboard_v3'

function saveScore() {
  if (!playerName.value.trim()) return
  const name = playerName.value.trim().toUpperCase()
  const won = isVictory.value
  const days = won ? props.gs.day : null   // DNF kayıtlarının gün sıralaması yok
  const score = props.gs.score
  const board = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]')
  board.push({ name, days, score, won, date: new Date().toISOString() })
  const top = sortLeaderboard(board).slice(0, 10)   // keep top 10
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(top))

  // Update view, flag this run (matched once)
  let flagged = false
  leaderboard.value = top.map(x => {
    const isCurrent = !flagged && x.name === name && x.days === days && x.score === score
    if (isCurrent) flagged = true
    return { ...x, isCurrent }
  })
  scoreSaved.value = true
}

onMounted(() => {
  leaderboard.value = sortLeaderboard(JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]'))
})

const props = defineProps({
  status: String,
  reason: String,
  tracks: Array,
  overallPct: Number,
  stats: Object,
  gs: Object,
  breakdown: Object,   // { won, accuracy, total, items:[{key,label,value}] } — yarışma skoru dökümü
  theme: Object
})

defineEmits(['restart'])

const isVictory = computed(() => props.status === 'victory')

// 🦁 Tusler sınıflandırma doğruluğu
const tuslerAccuracy = computed(() =>
  props.stats.tuslerTotal ? Math.round((props.stats.tuslerCorrect / props.stats.tuslerTotal) * 100) : 0
)
const tuslerLabel = computed(() => {
  if (!props.stats.tuslerTotal) return { label: 'Veri yok', color: '#888' }
  const a = tuslerAccuracy.value
  if (a >= 80) return { label: 'Tusler Ustası', color: '#60e060' }
  if (a >= 55) return { label: 'Gelişen Sınıflandırıcı', color: '#a0d060' }
  if (a >= 30) return { label: 'Acemi Bakıcı', color: '#f0c040' }
  return { label: 'Hayvanları karıştırıyorsun', color: '#f08060' }
})

const riskManagementScore = computed(() => {
  let score = 40 // baseline
  // Skorun çoğu Tusler sınıflandırma isabetinden gelir
  score += Math.round(tuslerAccuracy.value * 0.5) // 0..50
  if (props.gs.morale > 60) score += 5
  if (props.status === 'victory') score += 15
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
  if (props.stats.tuslerTotal) {
    const a = tuslerAccuracy.value
    if (a >= 80) feedback += 'Riskleri olasılık × etki düzleminde isabetle sınıflandırdın — gerçek bir Tusler ustası. '
    else if (a >= 50) feedback += 'Sınıflandırman fena değil; özellikle yüksek etkili riskleri (🐊 Timsah / 🐯 Kaplan) ayırt etmeye odaklan. '
    else feedback += 'Hayvanları karıştırdın: önce etkinin yüksek mi düşük mü olduğuna, sonra olasılığa bak. '
  }
  if (props.gs.money < 10000 && props.gs.money > 0) {
    feedback += 'Bütçeyi sınırda yönettin; yanlış sınıflandırmaların artakalan hasarı bütçeni eritti. '
  }
  if (props.gs.morale < 30) {
    feedback += 'Ekip morali çok düştü — moral hasarı veren riskleri (Çatışma / Burn-out) doğru yönetmek kritik. '
  }
  if (props.status === 'victory' && props.gs.money > 30000 && props.gs.morale > 60) {
    feedback += 'Mükemmel denge! Zaman, maliyet ve morali birlikte korudun — tam bir PMP performansı.'
  }
  if (!feedback) {
    feedback = 'Proje yönetimi sürekli bir dengeleme eylemidir. Her riski doğru hayvana sınıflandırmak, doğru PMBOK yanıtını seçmeni sağlar.'
  }
  return feedback
}
</script>
