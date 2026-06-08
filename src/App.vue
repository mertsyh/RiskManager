<template>
  <!-- BG Grass -->
  <div class="fixed inset-0 -z-10 overflow-hidden" :style="{background:theme.bgGrass}">
    <canvas ref="bgCanvas" class="absolute inset-0 w-full h-full"></canvas>
  </div>

  <!-- ══ DANGER VIGNETTE (always present, opacity driven by danger) ══ -->
  <div class="vignette-overlay" :style="vignetteStyle"></div>

  <!-- ══ GLITCH OVERLAY ══ -->
  <div v-if="fx.glitch" class="glitch-overlay"></div>

  <!-- ══ CLASSIFY HIT FLASH ══ -->
  <Transition name="fade">
    <div v-if="fx.criticalSuccess" class="crit-flash">
      <div class="crit-text">✓ RISK CONTAINED!</div>
    </div>
  </Transition>

  <!-- ══ PARTICLE CANVAS ══ -->
  <canvas ref="particleCanvas" class="particle-canvas" style="position:fixed;inset:0;z-index:30;pointer-events:none"></canvas>

  <div v-if="adminMode" class="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
    <div class="w-full max-w-xl rounded-xl border-4 border-slate-700 bg-slate-900/95 p-8 shadow-2xl">
      <div class="text-center mb-6">
        <div class="text-3xl font-bold tracking-widest">GPAF ADMIN</div>
        <div class="mt-2 text-sm text-slate-400">/admin yolundan güvenliksiz erişim ile toplu log indirme</div>
      </div>
      <div class="grid gap-4">
        <div class="rounded-lg border border-slate-700 bg-slate-800 p-4 text-sm text-slate-200">
          Bu sayfa, uzaktan oynayan herkesin Supabase’e yazdığı GPAF oturum loglarını tek bir dosyada toplar.
          İndirme düğmesine bastığınızda `gpaf-all-sessions-${GAME_ID}.jsonl` dosyası oluşturulur.
        </div>
        <button @click="downloadAllLogs" class="pixel-btn-green py-4 text-lg tracking-widest">⬇ Download all session logs</button>
        <div class="rounded-lg border border-slate-700 bg-slate-800 p-4 text-sm text-slate-300">
          <div><strong>Status:</strong> {{ adminStatus || 'Ready' }}</div>
          <div v-if="adminError" class="text-red-300">Error: {{ adminError }}</div>
          <div v-else class="text-slate-400">Not: Supabase etkin değilse veya veri yoksa dosya indirilemez.</div>
        </div>
      </div>
    </div>
  </div>

<div v-else class="h-screen flex flex-col overflow-hidden" style="font-family:'Press Start 2P',monospace;image-rendering:pixelated" :style="{filter: mainFilter}" :class="{shakeanim: fx.shake}">

    <!-- ══════════ MENU ══════════ -->
    <Transition name="fade">
      <div v-if="gs.status==='menu'" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80">
        <div class="relative z-10 flex flex-col gap-4 pixel-panel p-0 overflow-hidden w-[480px] border-4 border-gray-800 shadow-lg">
          <div class="pixel-title-bar px-4 py-2 flex justify-between text-xs" :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
            <span>★ ISPANAK VENTURES ★</span><span>v4.0</span>
          </div>
          <div class="px-6 pb-6 flex flex-col gap-6 pt-4">
            <div class="text-center" style="line-height:2.5">
              <div style="font-family:'Press Start 2P',monospace;font-size:32px;color:#fff;text-shadow:4px 4px 0 #000;letter-spacing:4px">RISK</div>
              <div style="font-family:'Press Start 2P',monospace;font-size:32px;color:#fff;text-shadow:4px 4px 0 #000;letter-spacing:2px">MANAGER</div>
              <div style="font-family:'Press Start 2P',monospace;font-size:10px;color:#a3b18a;margin-top:4px;letter-spacing:3px">TUSLER PROTOCOL // 2026</div>
            </div>
            <div class="pixel-inset p-4 text-center text-sm" :style="{ backgroundColor: theme.panelBg, color: theme.riskDescText }">
Ship PROJECT: NEON — a cloud payments &amp; analytics platform. There's no deadline, but every day counts: finish in as few days as you can to top the leaderboard.<br>As risks appear, classify each one to the right animal by its probability × impact!
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="pixel-inset p-3 text-center" :style="{ backgroundColor: theme.panelBg, color: '#e8702a' }"><div class="text-2xl">🐯</div>TIGER → AVOID</div>
              <div class="pixel-inset p-3 text-center" :style="{ backgroundColor: theme.panelBg, color: '#4fa050' }"><div class="text-2xl">🐊</div>ALLIGATOR → TRANSFER</div>
              <div class="pixel-inset p-3 text-center" :style="{ backgroundColor: theme.panelBg, color: '#e0a838' }"><div class="text-2xl">🐶</div>PUPPY → MITIGATE</div>
              <div class="pixel-inset p-3 text-center" :style="{ backgroundColor: theme.panelBg, color: '#8fa6bd' }"><div class="text-2xl">🐱</div>KITTEN → ACCEPT</div>
            </div>
            <button @click="startGame()" class="pixel-btn-green py-4 text-lg tracking-widest">▶  START GAME</button>
          </div>
          <div class="pixel-title-bar px-4 py-2 text-center text-xs" :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
            ISPANAK VENTURES © 2026
          </div>
        </div>
      </div>
    </Transition>



    <!-- ══════════ POST MORTEM (GAME OVER / VICTORY) ══════════ -->
    <Transition name="fade">
      <PostMortemReport v-if="gs.status==='gameover' || gs.status==='victory'"
        :status="gs.status"
        :reason="gameOverReason"
        :tracks="tracks"
        :overallPct="completedPct"
        :stats="stats"
        :gs="gs"
        :breakdown="scoreBreakdown"
        :theme="theme"
        @restart="resetGame" />
    </Transition>

    <!-- ══════════ PLAYING ══════════ -->
    <template v-if="gs.status !== 'menu'">

      <!-- HUD BAR -->
      <header class="pixel-hud-bar flex items-center justify-between px-4 shrink-0" style="height:72px"
        :style="{background:theme.hudBg}">
        <div style="display:flex;align-items:center;gap:10px;color:#ffe4a0">
          <span style="font-size:30px">🏢</span>
          <div style="display:flex;flex-direction:column;line-height:1.3">
            <span style="font-size:14px;font-family:'Press Start 2P',monospace;color:#ffe4a0">RM 2026</span>
            <span style="font-size:11px;color:#b08850">PROJECT: NEON</span>
          </div>
        </div>

        <div style="display:flex;gap:10px;align-items:stretch">
          <!-- Score -->
          <div class="hud-stat" style="background:#2a1438;border-color:#4a2060" title="Competition score">
            <div class="hud-stat-label" style="color:#b88ad0">🏆 SCORE</div>
            <div class="hud-stat-value" style="color:#e0b8ff">{{ gs.score.toLocaleString() }}</div>
          </div>
          <!-- Money -->
          <div class="hud-stat" :class="fx.moneyFlash?'hud-stat-flash':''"
            :style="{background:theme.chipGreen,borderColor:theme.chipGreen}" title="Remaining budget">
            <div class="hud-stat-label" :style="{color:theme.chipGreenText}">💰 MONEY</div>
            <div class="hud-stat-value" :style="{color:theme.chipGreenText}">${{ gs.money.toLocaleString() }}</div>
          </div>
          <!-- Morale -->
          <div class="hud-stat" :style="{background:theme.chipYellow,borderColor:theme.chipYellow}" title="Team morale">
            <div class="hud-stat-label" :style="{color:theme.chipYellowText}">{{ moraleIcon }} MORALE</div>
            <div style="display:flex;align-items:center;gap:7px">
              <div class="pixel-bar-track" style="width:66px;height:13px">
                <div :class="['pixel-bar-fill', gs.morale<30?'bar-pulse-danger':gs.morale>70?'bar-pulse-good':'']"
                     :style="{width:gs.morale+'%',background:gs.morale>60?theme.energyFull:gs.morale>30?theme.energyMid:theme.energyLow}"></div>
              </div>
              <span class="hud-stat-value" :style="{color:theme.chipYellowText}">{{ gs.morale }}%</span>
            </div>
          </div>
          <!-- Day (no deadline — fewer days to finish = higher on the leaderboard) -->
          <div class="hud-stat" :style="{background:theme.chipBlue,borderColor:theme.chipBlue}" title="Days elapsed — finish in as few as you can">
            <div class="hud-stat-label" :style="{color:theme.chipBlueText}">📅 DAY</div>
            <div class="hud-stat-value" :style="{color:theme.chipBlueText}">{{ gs.day }}</div>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:8px">
          <button @click="openManage()" class="pixel-btn" style="font-size:11px;padding:8px 10px">🏢 MANAGE</button>
          <button @click="showRiskCenter = true" class="pixel-btn" style="font-size:11px;padding:8px 10px">📋 LOG</button>
          <button @click="logger.download()" class="pixel-btn" style="font-size:11px;padding:8px 10px" title="GPAF oyun kaydını JSONL indir">⬇ LOG</button>

          <button @click="showKnowledgeBase = true" class="pixel-btn" style="font-size:11px;padding:8px 10px">📖 GUIDE</button>
          <button @click="toggleTheme" class="pixel-btn" style="font-size:11px;padding:8px 10px">🎨</button>
          <ThemePanel :theme="theme" @update="(k,v)=>theme[k]=v" />
        </div>
      </header>

      <!-- MAIN (SINGLE COLUMN) -->
      <main class="flex-1 min-h-0 overflow-hidden w-full px-2 pt-2"
            style="display:flex;flex-direction:column;gap:6px">

        <!-- DASHBOARD (office view) -->
        <div class="w-full flex-1 overflow-hidden" style="display:flex;flex-direction:column;gap:6px">
          <ProjectDashboard
            :tracks="tracks" :overallPct="completedPct" :morale="gs.morale" :day="gs.day"
            :milestones="milestones" :dailyProgress="lastDailyProgress"
            :dailyCost="lastDailyCost" :processing="isProcessing"
            :employees="employees" :theme="theme" :reductionByType="reductionByType"
            :threatByType="threatByType" :plannedCategories="plannedCategories"
            @nextDay="handleNextDay" @openManage="openManage"
            @employeeClick="id => moraleEmployeeId = id" />
        </div>
      </main>

      <!-- TICKER -->
      <footer class="pixel-ticker shrink-0 flex items-center overflow-hidden" style="height:22px">
        <div style="font-size:6px;color:#f0b040;padding:0 8px;white-space:nowrap;border-right:3px solid #3a1808">📢</div>
        <div style="overflow:hidden;flex:1">
          <div class="ticker-scroll" style="font-size:6px;color:#6a5838;white-space:nowrap">
            {{ tickerText }}
          </div>
        </div>
      </footer>
    </template>

    <!-- ═══ MODALS ═══ -->
    <Transition name="fade">
      <RiskClassifyModal v-if="triggeredRisk" :risk="triggeredRisk" :theme="theme"
        :money="gs.money" :outcome="riskOutcome"
        @resolve="handleResolve" @close="closeClassify" />
    </Transition>
    <Transition name="fade">
      <DaySummaryModal v-if="daySummary && !triggeredRisk" :summary="daySummary" :theme="theme"
        @close="daySummary=null" />
    </Transition>
    <Transition name="fade">
      <ManagementModal v-if="showManagement" :theme="theme" :money="gs.money"
        :employees="employees" :upgrades="upgrades" :focusCategory="manageFocus"
        :score="gs.score" :loans="gs.loans" :loanPenalty="gs.loanPenalty"
        :loanAmount="LOAN_AMOUNT" :loanCost="loanCost"
        @hire="hireEmployee" @buyUpgrade="buyUpgrade" @takeLoan="takeLoan" @close="showManagement=false" />
    </Transition>
    <Transition name="fade">
      <RiskCenterModal v-if="showRiskCenter" :theme="theme" :eventLog="eventLog"
        :reductionByType="reductionByType" :stats="stats" :plannedCategories="plannedCategories"
        @close="showRiskCenter=false" />
    </Transition>
    <Transition name="fade">
      <KnowledgeBase v-if="showKnowledgeBase" :theme="theme" @close="showKnowledgeBase=false" />
    </Transition>
    <Transition name="fade">
      <MoraleModal v-if="moraleEmployee" :theme="theme" :money="gs.money"
        :employee="moraleEmployee" :perks="moralePerks"
        @buy="buyPerk" @close="moraleEmployeeId=null" />
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import ProjectDashboard from './components/projectdashboard.vue'
import ThemePanel from './components/ThemePanel.vue'
import KnowledgeBase from './components/KnowledgeBase.vue'
import PostMortemReport from './components/PostMortemReport.vue'
import RiskClassifyModal from './components/RiskClassifyModal.vue'
import ManagementModal from './components/ManagementModal.vue'
import RiskCenterModal from './components/RiskCenterModal.vue'
import RiskPlanningModal from './components/RiskPlanningModal.vue'
import DaySummaryModal from './components/DaySummaryModal.vue'
import MoraleModal from './components/MoraleModal.vue'
import { PERKS_BY_EMP, passiveMoraleFor } from './perks.js'
import { newTheme } from './design.js'
import { classifyRisk, evaluateResponse, applyMitigation, riskEmv, effortPointsFor, mitigationCostPerPoint, avoidProgressBonus, CLASSIFY_PROGRESS_BONUS, TUSLER_ANIMALS } from './tusler.js'
import { computeEndScore } from './scoring.js'
import * as logger from './logger.js'

const adminMode = window.location.pathname === '/admin'
const GAME_ID = logger.GAME_ID
const adminStatus = ref('')
const adminError = ref('')
const supabaseEnabled = logger.supabaseEnabled

async function downloadAllLogs() {
  adminStatus.value = 'Fetching logs...'
  adminError.value = ''
  try {
    if (!supabaseEnabled) {
      adminError.value = 'Supabase is not configured. Admin download requires Supabase access.'
      adminStatus.value = 'Supabase unavailable.'
      return
    }
    const ok = await logger.downloadAllSessions()
    if (!ok) {
      adminError.value = 'No events were found on Supabase. Verify the gpaf_events table and access policy.'
      adminStatus.value = 'No logs found.'
      return
    }
    adminStatus.value = 'Download started.'
  } catch (err) {
    adminError.value = err?.message || String(err)
    adminStatus.value = 'Download failed.'
    console.warn('[gpaf] downloadAllLogs failed:', err)
  }
}

const originalTheme = {
  bgGrass:'#2d5a1b', hudBg:'#4a3018', chipGreen:'#2a6020', chipGreenText:'#a0e080',
  chipYellow:'#605020', chipYellowText:'#f0d060', chipBlue:'#203060', chipBlueText:'#80b0f0',
  chipBrown:'#4a3018', chipRed:'#602020', panelBg:'#2a1808', panelBorder:'#1a0c04',
  titleBarBg:'#2a1408', titleText:'#ffe4a0', tabActiveBg:'#3a2010', tabActiveText:'#ffe4a0',
  empHiredBg:'#2a1e40', empHiredBorder:'#8060c0', empIdleBg:'#4a2e14', empIdleBorder:'#6a3c18',
  empName:'#ffe4a0', empRoleHired:'#b080e0', empSalary:'#e87060', empProd:'#70d050',
  energyFull:'#48c038', energyMid:'#c0980a', energyLow:'#d03828',
  riskHighBg:'#280c0c', riskHighBorder:'#602020', riskHighAccent:'#e86050',
  riskMedBg:'#241808', riskMedBorder:'#604018', riskMedAccent:'#d8a830',
  riskLowBg:'#0a1e0a', riskLowBorder:'#206020', riskLowAccent:'#58d058',
  riskDescBg:'#0c0a06', riskDescText:'#c0a878',
  progressBg:'#100804', progressLow:'#2868c8', progressMid:'#c0980a', progressHigh:'#48b838',
  milestoneActive:'#a08820', milestoneText:'#f0d060',
  btnDayBg:'#1c5014', btnDayText:'#d0f0a0', btnHireBg:'#186010', btnHireText:'#80e050',
}

// ─── THEME ───
const theme = reactive(originalTheme)
const isNewTheme = ref(false)

function toggleTheme() {
  isNewTheme.value = !isNewTheme.value
  Object.assign(theme, isNewTheme.value ? newTheme : originalTheme)
}

// ─── TUNING ───
// (Mini-oyun ayarları — token sayısı, % kesim, kesim tavanı, mitigasyon $ maliyeti — src/tusler.js'te toplandı.)
const DAILY_COST = 1200          // sabit günlük ofis gideri (çalışan maaşları AYRICA eklenir)
const RISK_CHANCE = 0.4          // 3. günden sonra her gün risk çıkma olasılığı
const REDUCTION_CAP = 0.6        // bir risk tipindeki toplam olasılık azaltma tavanı (%60)
// Takvim baskısı artık ilerleme baskısı: bir risk tetiklenip gecikme verirse, o gecikme
// günü başına bu kadar PROGRESS geri alınır (totalEffort 3000; ~bir çekirdek ekip günü).
const DELAY_PROGRESS_PER_DAY = 45
// ── ZAMANLA SCOPE DEĞİŞİMİ (scope creep): müşteri/PO ara ara gereksinimleri yeniden şekillendirir →
// bir teslimat track'i biraz GERİYE gider (mevcut ilerlemeden düşülür). Tek noktadan dengelenir.
const SCOPE_CHANGE_MIN_DAY = 5     // bu günden önce scope değişmez (risklerden biraz sonra başlar)
const SCOPE_CHANGE_CHANCE  = 0.18  // uygun her gün tetiklenme olasılığı (~%15–20)
const SCOPE_CHANGE_MAX     = 3     // oyun başına azami scope değişimi (oyun oynanamaz olmasın)
const SCOPE_CHANGE_MIN_PCT = 0.06  // hafif: track target'ının %6'sı …
const SCOPE_CHANGE_MAX_PCT = 0.10  // … ile %10'u arası ilerleme geri alınır
// Acil kredi: anında nakit, peşin (geri ödemesiz) ama YÜKSEK skor bedeliyle. Para senindir.
const LOAN_AMOUNT = 25000        // her kredinin verdiği nakit
const LOAN_POINT_RATE = 0.08     // skor bedeli = tutar × oran → $25K ≈ 2,000 puan
// Zafer bonusu artık tek noktada: src/scoring.js → computeEndScore (hız + isabet ağırlıklı).
// Risk planlama (oyun başı): NEON'a gerçekten ait olan her riski doğru işaretlemek puan kazandırır.
// "Sadece doğruyu ödüllendir" modeli — yanlış (alakasız) ya da eksik seçim cezalandırılmaz.
const PLANNING_POINTS_PER_RISK = 100 // doğru tanımlanan gerçek risk başına puan (skor PO ekranında hesaplanır)

// ─── REFS & STATE ───
const triggeredRisk = ref(null)
const riskOutcome = ref(null)   // Faz 3: risk gerçeğe dönüştü mü? — sonuç açıklaması (rolling → revealed)
let resolveTimer = null
const isProcessing = ref(false), lastDailyProgress = ref(0), lastDailyCost = ref(0)
const gameOverReason = ref(''), bgCanvas = ref(null), particleCanvas = ref(null)
const showKnowledgeBase = ref(false)
const showManagement = ref(false)
const manageFocus = ref(null)        // radar çubuğundan açılınca odaklanılan risk kategorisi
const showRiskCenter = ref(false)
const daySummary = ref(null)
const scoreBreakdown = ref(null)   // oyun sonu yarışma skorunun kalem dökümü (post-mortem'de gösterilir)
const eventLog = ref([])
const usedRiskIds = ref([])
const scopeChanges = ref(0)     // bu oyunda kaç kez scope değişti (SCOPE_CHANGE_MAX ile sınırlı)
// Oyun başı risk planlamasında işaretlenen kategoriler (risk register). Radar'da işaretlenir + Risk Center'da listelenir.
const plannedCategories = ref([])
const stats = reactive({ critSuccesses: 0, bugsFixed: 0, dilemmasResolved: 0, risksProactivelyHandled: 0, tuslerCorrect: 0, tuslerTotal: 0 })

const fx = reactive({ shake:false, moneyFlash:false, glitch:false, criticalSuccess:false, bugEvent:false })
const gs = reactive({ status:'menu', money:100000, day:1, morale:75, score:0, loans:0, loanPenalty:0 })

// ─── PROJECT SCOPE (Work Breakdown Structure — 3 deliverable tracks) ───
// İlerleme artık tek bir çubuk değil; proje KAPSAMI üç teslimat akışına bölündü. Oyun ancak
// ÜÇÜ DE kendi hedefine (track.target) ulaşınca kazanılır. Her risk tipi kendi akışını besler/
// geri atar, her çalışanın günlük üretimi `category`'sine göre ilgili akışa akar (kategorisiz
// stajyer eşit böler). HEDEFLER akış başına UZMAN İNŞA KAPASİTESİYLE orantılı seçildi (tam kadro
// kapasiteleri ~Infra 46 / Security 14 / Product 56) — böylece her akış yatırım yapılınca BENZER
// sürede biter; aksi halde düşük üretimli güvenlik/scope uzmanları o akışı darboğaza çevirirdi.
// Toplam 3000 (eski tek-çubuk temposu korunur). Dengeyi tek noktadan ayarla: bu `target`lar.
const TRACKS = [
  { key:'infra',    label:'INFRASTRUCTURE',        icon:'🏗️', target:2050, cats:['server','api'] },
  { key:'security', label:'SECURITY & COMPLIANCE', icon:'🔒', target:950,  cats:['security','scope'] },
  { key:'product',  label:'PRODUCT',               icon:'💳', target:2300, cats:['bug','conflict'] },
]
const TRACK_KEYS = TRACKS.map(t => t.key)
const TRACK_TARGET = Object.fromEntries(TRACKS.map(t => [t.key, t.target]))
const TOTAL_TARGET = TRACKS.reduce((s, t) => s + t.target, 0)
const CATEGORY_TRACK = { server:'infra', api:'infra', security:'security', scope:'security', bug:'product', conflict:'product' }
// null = stajyer / genel iş → günlük üretimi üç akışa eşit dağıtılır; risk hasarı 'product'a yazılır.
const trackForCategory = (cat) => CATEGORY_TRACK[cat] || null
// ─── UZMANLIK (her çalışan bir teslimat akışında uzman) ───
// Uzman kendi akışında EXPERT_BONUS, diğer iki akışa EXPERT_TRICKLE oranında katkı verir.
// Bonus throughput'u ~1.8×'e çıkardığı için yukarıdaki `target`lar buna göre yeniden ölçeklendi.
const EXPERT_BONUS   = 1.5   // uzman, kendi teslimat akışında %50 daha verimli
const EXPERT_TRICKLE = 0.15  // uzmanlık dışı iki akışa küçük katkı

const project = reactive({ infra:0, security:0, product:0 })
// Bir önceki günün akış başına ilerleme deltası (dashboard'da "+N" rozetleri için).
const lastTrackProgress = reactive({ infra:0, security:0, product:0 })
const milestones = reactive([
  { pct:25, label:'+$10K', bonus:10000, reached:false, icon:'💰' },
  { pct:50, label:'+$15K', bonus:15000, reached:false, icon:'🎯' },
  { pct:75, label:'+$20K', bonus:20000, reached:false, icon:'🚀' },
])

// ─── EMPLOYEES (roster — ids 1-8 masalarda) ───
// Başlangıç takımı her türden birer kişi: (1) product, (2) infra, (5) security, (8) generalist hired başlar; gerisi 🏢 MANAGE'den işe alınır.
// `category` risk `type`'ıyla eşleşir; `reduction` o kategorinin olasılığını kalıcı düşürür (FR3).
const defaultEmployees = () => [
  { id:1, name:'Mert',    role:'Senior Dev', icon:'🧑‍💻', dailyCost:700, productivity:28, category:'bug',      reduction:15, specialty:'product',  hired:true,  morale:82, ownedPerks:[], overtime:false },
  { id:2, name:'Bob',     role:'DevOps',     icon:'🔧',   dailyCost:550, productivity:16, category:'server',   reduction:25, specialty:'infra',    hired:true,  morale:75, ownedPerks:[], overtime:false },
  { id:3, name:'Charlie', role:'QA',         icon:'🔍',   dailyCost:450, productivity:10, category:'bug',      reduction:25, specialty:'product',  hired:false, morale:75, ownedPerks:[], overtime:false },
  { id:4, name:'Diana',   role:'PM',         icon:'📊',   dailyCost:400, productivity:7,  category:'scope',    reduction:30, specialty:'security', hired:false, morale:75, ownedPerks:[], overtime:false },
  { id:5, name:'Eve',     role:'Security',   icon:'🔒',   dailyCost:500, productivity:7,  category:'security', reduction:30, specialty:'security', hired:true,  morale:75, ownedPerks:[], overtime:false },
  { id:6, name:'Frank',   role:'Frontend',   icon:'🎨',   dailyCost:450, productivity:18, category:'bug',      reduction:10, specialty:'product',  hired:false, morale:68, ownedPerks:[], overtime:false },
  { id:7, name:'Grace',   role:'AI Eng.',    icon:'🤖',   dailyCost:700, productivity:30, category:'api',      reduction:15, specialty:'infra',    hired:false, morale:75, ownedPerks:[], overtime:false },
  { id:8, name:'Hank',    role:'Intern',     icon:'👶',   dailyCost:200, productivity:4,  category:null,       reduction:0,  specialty:null,       hired:true,  morale:75, ownedPerks:[], overtime:false },
]
const employees = ref(defaultEmployees())

// ─── PER-EMPLOYEE MORALE POPUP ───
// Clicking a worker opens a popup where you spend budget on personalized perks to lift THEIR morale.
const moraleEmployeeId = ref(null)
const moraleEmployee = computed(() => employees.value.find(e => e.id === moraleEmployeeId.value) || null)
const moralePerks = computed(() => PERKS_BY_EMP[moraleEmployeeId.value] || [])

// ─── UPGRADES (tek seferlik satın alım, kalıcı olasılık azaltma — FR7) ───
const defaultUpgrades = () => [
  { id:'code-review', name:'Code Review',     icon:'🔍', cost:8000,  category:'bug',      reduction:20, purchased:false, desc:'Automated review lowers bug probability.' },
  { id:'cicd',        name:'CI/CD Pipeline',  icon:'🔁', cost:10000, category:'api',      reduction:25, purchased:false, desc:'Cuts integration / third-party failures.' },
  { id:'sec-audit',   name:'Security Audit',  icon:'🛡️', cost:12000, category:'security', reduction:30, purchased:false, desc:'Lowers vulnerability probability.' },
  { id:'risk-dash',   name:'Risk Dashboard',  icon:'📊', cost:15000, category:'all',      reduction:15, purchased:false, desc:'Monitors every risk type: −15% across the board.' },
  { id:'cloud-scale', name:'Cloud Scaling',   icon:'☁️', cost:9000,  category:'server',   reduction:30, purchased:false, desc:'Lowers server crash probability.' },
  { id:'espresso',    name:'Espresso Machine',icon:'☕', cost:5000,  category:'morale',   reduction:0,  purchased:false, morale:2, desc:'Passive +2 morale every day.' },
]
const upgrades = ref(defaultUpgrades())

// ─── RISKS (dört Tusler hayvanı da temsil edilecek şekilde) ───
const allRisksPool = [
  { id:1, name:'Server Crash',         desc:'The database is overloading and going down.', prob:60, cost:15000, delay:3, level:'high',   type:'server',   icon:'🔥' },
  { id:2, name:'API Rate Limit',       desc:'External services are blocking us.',          prob:60, cost:3000,  delay:1, level:'medium', type:'api',      icon:'⛔' },
  { id:3, name:'Security Hole',        desc:'A critical zero-day vulnerability!',          prob:30, cost:20000, delay:2, level:'high',   type:'security', icon:'🔓' },
  { id:4, name:'Scope Creep',          desc:'The client keeps asking for new things.',     prob:55, cost:5000,  delay:4, level:'medium', type:'scope',    icon:'📈' },
  { id:5, name:'Team Conflict',        desc:'The devs are fighting!',                      prob:50, cost:0,     delay:0, level:'low',    type:'conflict', icon:'⚡', moralDamage:18 },
  { id:6, name:'Critical Bug',         desc:'A critical error in production!',             prob:50, cost:8000,  delay:2, level:'high',   type:'bug',      icon:'🐛' },
  { id:7, name:'Third Party Down',     desc:'A dependent service is offline.',             prob:22, cost:4000,  delay:1, level:'low',    type:'api',      icon:'🔌' },
  { id:8, name:'Data Loss',            desc:'The backup failed!',                          prob:25, cost:25000, delay:3, level:'high',   type:'server',   icon:'💾' },
  { id:9, name:'Performance',          desc:'The system is very slow.',                    prob:45, cost:6000,  delay:2, level:'medium', type:'bug',      icon:'🐢' },
  { id:10,name:'Technical Debt',       desc:'Old code is causing problems.',               prob:60, cost:7000,  delay:3, level:'medium', type:'bug',      icon:'📚' },
  { id:11,name:'DDoS Attack',          desc:'Malicious traffic is incoming!',              prob:20, cost:18000, delay:2, level:'high',   type:'security', icon:'💀' },
  { id:12,name:'Regulation',           desc:'GDPR compliance is required.',                prob:22, cost:6000,  delay:2, level:'low',    type:'scope',    icon:'⚖️' },
  { id:13,name:'Intern Mistake',       desc:'Hank pushed to prod!',                        prob:70, cost:3000,  delay:1, level:'low',    type:'bug',      icon:'😱' },
  { id:14,name:'License Issue',        desc:"A vendor's license is expiring.",             prob:20, cost:5000,  delay:1, level:'low',    type:'api',      icon:'📋' },
  { id:15,name:'HR Risk',              desc:'A senior dev might leave!',                   prob:35, cost:0,     delay:0, level:'high',   type:'conflict', icon:'🚪', moralDamage:30 },
  { id:16,name:'Cloud Cost Blowup',    desc:'Needless instances running everywhere!',      prob:62, cost:12000, delay:0, level:'high',   type:'server',   icon:'💸' },
  { id:17,name:'Microservice Cascade', desc:'One service is locking up the others.',       prob:30, cost:16000, delay:3, level:'high',   type:'server',   icon:'⛓️' },
  { id:18,name:'Legacy Integration',   desc:'We cannot integrate with old code.',          prob:58, cost:11000, delay:2, level:'high',   type:'bug',      icon:'🏛️' },
  { id:19,name:'Mobile Compat Crisis', desc:'The new UI broke on mobile.',                 prob:45, cost:6000,  delay:1, level:'medium', type:'bug',      icon:'📱' },
  { id:20,name:'SaaS Price Hike',      desc:'A vendor raised prices by 30%.',              prob:24, cost:8000,  delay:0, level:'low',    type:'api',      icon:'🧾' },
  { id:21,name:'Open Source Security', desc:'A library we use has a vulnerability!',        prob:20, cost:22000, delay:3, level:'high',   type:'security', icon:'🕷️' },
  { id:22,name:'CDN Outage',           desc:'Static files are not loading.',               prob:22, cost:5000,  delay:1, level:'low',    type:'api',      icon:'🌍' },
  { id:23,name:'Stakeholder Conflict', desc:'The investor is unhappy with the project.',   prob:26, cost:0,     delay:1, level:'low',    type:'conflict', icon:'👔', moralDamage:20 },
  { id:24,name:'Management Change',    desc:'The sponsor left the company.',               prob:20, cost:10000, delay:2, level:'high',   type:'conflict', icon:'🌪️', moralDamage:15 },
  { id:25,name:'Audit / Review',       desc:'Unlicensed code was found!',                  prob:25, cost:15000, delay:2, level:'high',   type:'scope',    icon:'🕵️' },
  { id:26,name:'Team Burn-out',        desc:'The team is exhausted, morale at zero.',      prob:58, cost:0,     delay:2, level:'high',   type:'conflict', icon:'🧟', moralDamage:35 },
  { id:27,name:'Social Engineering',   desc:'A password was stolen via phishing.',         prob:66, cost:12000, delay:1, level:'high',   type:'security', icon:'🎣' },
  { id:28,name:'Data Breach (GDPR)',   desc:'Customer data leaked, huge fine!',            prob:15, cost:30000, delay:4, level:'high',   type:'security', icon:'🚨' },
]

// ─── COMPUTED ───
// Genel tamamlanma = üç akışın toplamı / toplam hedef (ticker, milestone'lar ve gün özeti bunu okur).
const completedPct = computed(() =>
  Math.floor(TRACK_KEYS.reduce((s, k) => s + project[k], 0) / TOTAL_TARGET * 100))
// Dashboard/gün özeti/post-mortem'in render ettiği akış dizisi (etiket + ikon + değer/hedef + %).
const tracks = computed(() => TRACKS.map(t => ({
  key: t.key, label: t.label, icon: t.icon,
  value: project[t.key], target: t.target,
  pct: Math.min(100, Math.floor(project[t.key] / t.target * 100)),
  delta: lastTrackProgress[t.key],
})))
const moraleIcon   = computed(() => gs.morale > 70 ? '🔥' : gs.morale > 50 ? '😊' : gs.morale > 30 ? '😐' : '😰')

// Aktif uzman + yükseltmelerin risk tipi başına toplam olasılık azaltması (0..REDUCTION_CAP).
// 'all' tipi yükseltme her risk tipine eklenir. Bu, bir riskin etkin olasılığını düşürür
// ve sınıflandırmayı kaydırabilir (🐯 Tiger → 🐶 Puppy) — proaktif Mitigate dersi (US-02/03).
const RISK_TYPES = ['server', 'api', 'security', 'scope', 'bug', 'conflict']
const reductionByType = computed(() => {
  const sum = {}
  const add = (type, pct) => { if (type) sum[type] = (sum[type] || 0) + pct }
  let allPct = 0
  employees.value.forEach(e => { if (e.hired) add(e.category, e.reduction || 0) })
  upgrades.value.forEach(u => {
    if (!u.purchased) return
    if (u.category === 'all') allPct += u.reduction
    else add(u.category, u.reduction || 0)
  })
  const out = {}
  RISK_TYPES.forEach(t => { out[t] = Math.min(REDUCTION_CAP, ((sum[t] || 0) + allPct) / 100) })
  return out
})

// Her kategorinin TEMEL tehdidi = havuzdaki o tip risklerin ortalama olasılığı (sabit, 0..100).
const baseThreatByType = (() => {
  const sum = {}, cnt = {}
  allRisksPool.forEach(r => { sum[r.type] = (sum[r.type] || 0) + r.prob; cnt[r.type] = (cnt[r.type] || 0) + 1 })
  const out = {}
  RISK_TYPES.forEach(t => { out[t] = cnt[t] ? Math.round(sum[t] / cnt[t]) : 0 })
  return out
})()

// GÜNCEL tehdit = temel × (1 − mitigasyon). Radar çubuklarının gösterdiği değer
// ve aynı zamanda bir sonraki riskin hangi kategoriden çıkacağının ağırlığı (öngörü çubukları).
const threatByType = computed(() => {
  const out = {}
  RISK_TYPES.forEach(t => { out[t] = Math.round(baseThreatByType[t] * (1 - (reductionByType.value[t] || 0))) })
  return out
})

// İnsan-okunur kategori etiketleri (log mesajı için).
const CATEGORY_LABELS = { server:'Server', api:'Integration', security:'Security', scope:'Scope', bug:'Bug', conflict:'Team' }
const categoryLabel = (key) => CATEGORY_LABELS[key] || key

// Danger level drives vignette + color grading
const dangerLevel = computed(() => {
  let d = 0
  if (gs.money < 10000)           d = Math.max(d, 0.8)
  else if (gs.money < 25000)      d = Math.max(d, 0.4)
  if (gs.morale < 20)             d = Math.max(d, 0.7)
  else if (gs.morale < 35)        d = Math.max(d, 0.35)
  return d
})

const vignetteStyle = computed(() => ({
  opacity: Math.min(0.75, dangerLevel.value * 0.75),
  background: `radial-gradient(ellipse at center, transparent 45%, ${dangerLevel.value > 0.6 ? '#cc0000' : '#880000'} 100%)`,
  transition: 'opacity 1s ease, background 1s ease',
}))

const mainFilter = computed(() => {
  if (fx.criticalSuccess) return 'brightness(1.2) saturate(1.8) hue-rotate(-15deg)'
  if (dangerLevel.value > 0.7) return 'saturate(1.35) hue-rotate(6deg)'
  if (dangerLevel.value > 0.4) return 'saturate(1.15)'
  return 'none'
})

const tickerText = computed(() => {
  const messages = [
    'Global AI market grew 340%...',
    'A rival company announced a new product...',
    'Cloud costs keep rising...',
    `Day ${gs.day} · Project ${completedPct.value}% complete...`,
    `Team morale is ${gs.morale > 60 ? 'high! 🔥' : gs.morale > 35 ? 'normal 😊' : 'critically low! 😰'}`,
    `Budget: $${gs.money.toLocaleString()} — ${gs.money > 50000 ? 'Safe 💰' : 'Be careful!'}`,
  ]
  return messages.join('   ·   ')
})

// ─── PARTICLE SYSTEM ───
const particlesArr = ref([])
let particleRafId = null

function spawnParticles(x, y, count = 14, type = 'day') {
  const palettes = {
    day:   ['#60d040','#a0e040','#ffe4a0','#f0b040','#80d0ff'],
    hire:  ['#b080f0','#e0c0ff','#8060c0','#ffe4a0'],
    crit:  ['#ffe040','#ffb000','#ffffff','#ffd040'],
    bug:   ['#ff4040','#ff8040','#801010'],
  }
  const colors = palettes[type] || palettes.day
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random()-0.5)*0.6
    const speed = 2.5 + Math.random() * 4
    particlesArr.value.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      life: 45 + Math.floor(Math.random() * 25),
      maxLife: 70,
      color: colors[Math.floor(Math.random()*colors.length)],
      size: 3 + Math.floor(Math.random() * 4),
    })
  }
}

function animateParticles() {
  const canvas = particleCanvas.value
  if (!canvas) { particleRafId = requestAnimationFrame(animateParticles); return }
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  particlesArr.value = particlesArr.value.filter(p => p.life > 0)
  particlesArr.value.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.life--
    ctx.globalAlpha = p.life / p.maxLife
    ctx.fillStyle = p.color
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
  })
  ctx.globalAlpha = 1
  particleRafId = requestAnimationFrame(animateParticles)
}

// ─── HELPERS ───
function triggerFx(type, duration = 400) {
  fx[type] = true
  setTimeout(() => fx[type] = false, duration)
}

function addLog(msg, type = 'info') {
  eventLog.value.unshift({ id:Date.now(), msg, type, day:gs.day })
  if (eventLog.value.length > 60) eventLog.value.pop()
}

function updateMoney(amount) {
  gs.money += amount
  if (amount < 0) triggerFx('moneyFlash')
}

function updateScore(amount) {
  // Skor 0'ın altına inmez — kredi cezası kazanılan tüm puanı silebilir ama negatife geçmez.
  gs.score = Math.max(0, gs.score + amount)
}

// GPAF score_update — güncel skor + bakiyeyi anlamlı geçişlerde loglar (gün sonu, risk, kredi, alışveriş, final).
function logScore(reason) {
  logger.scoreUpdate({ score: gs.score, balance: gs.money, day: gs.day, reason })
}

// Acil kredinin sabit skor bedeli (tutar × oran). Para anında eklenir, geri ödeme yok.
const loanCost = Math.round(LOAN_AMOUNT * LOAN_POINT_RATE)

function takeLoan(amount = LOAN_AMOUNT) {
  if (gs.status !== 'playing') return
  const cost = Math.round(amount * LOAN_POINT_RATE)
  updateMoney(amount)
  updateScore(-cost)
  gs.loans++
  gs.loanPenalty += cost
  spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 16, 'hire')
  addLog(`🏦 Took a $${amount.toLocaleString()} loan — kept the cash, paid −${cost.toLocaleString()} score.`, 'warning')
  logScore('loan')                      // GPAF score_update — bakiye/skor değişti
}

// Team morale (HUD + balance) is now the AVERAGE of the hired employees' individual morale.
function syncTeamMorale() {
  const hired = employees.value.filter(e => e.hired)
  gs.morale = hired.length
    ? Math.round(hired.reduce((s, e) => s + e.morale, 0) / hired.length)
    : 0
}

// A team-wide morale change (daily drift, espresso, risk fallout) hits every hired employee.
function updateMorale(d) {
  employees.value.forEach(e => {
    if (e.hired) e.morale = Math.max(0, Math.min(100, e.morale + d))
  })
  syncTeamMorale()
}

// Buy a personalized perk for one employee → boost only THEIR morale.
function buyPerk(perkId) {
  const e = moraleEmployee.value
  if (!e || !e.hired) return
  const perk = (PERKS_BY_EMP[e.id] || []).find(p => p.id === perkId)
  if (!perk || gs.money < perk.cost) return
  if (perk.type === 'item' && e.ownedPerks.includes(perk.id)) return
  if (perk.type === 'activity' && e.morale >= 100) return

  updateMoney(-perk.cost)
  e.morale = Math.max(0, Math.min(100, e.morale + perk.morale))
  if (perk.type === 'item') e.ownedPerks.push(perk.id)
  syncTeamMorale()
  spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 16, 'hire')
  addLog(`${perk.icon} ${e.name} got "${perk.name}" — +${perk.morale} morale (-$${perk.cost.toLocaleString()})`, 'success')
  logScore('shop')                      // GPAF score_update — bakiye değişti
}

// Bir akışa (track) ilerleme ekler, o akışın hedefiyle sınırlar; gerçekten eklenen miktarı döndürür.
function addTrackProgress(key, n) {
  if (n <= 0) return 0
  const before = project[key]
  project[key] = Math.min(TRACK_TARGET[key], project[key] + n)
  // Bir teslimat akışı hedefine ilk kez ulaştıysa GPAF level_complete say.
  if (before < TRACK_TARGET[key] && project[key] >= TRACK_TARGET[key]) {
    logger.levelComplete({ kind: 'track', track: key })
  }
  return project[key] - before
}

function checkMilestones() {
  const p = completedPct.value
  const reached = []
  for (const m of milestones) {
    if (!m.reached && p >= m.pct) {
      m.reached = true
      updateMoney(m.bonus)
      logger.levelComplete({ kind: 'milestone', pct: m.pct, label: m.label })   // GPAF level_complete
      addLog(`🎯 ${m.pct}% milestone reached! ${m.label}`, 'milestone')
      spawnParticles(window.innerWidth/2, window.innerHeight/2, 20, 'crit')
      reached.push(m)
    }
  }
  return reached
}

// Oyun bitti mi? Status'a göre korunur ki skor SADECE BİR KEZ sonlandırılsın (tekrar çağrılırsa no-op).
function checkGameEnd() {
  if (gs.status !== 'playing') return false   // zaten bitti — yeniden sonlandırma
  let ended = false
  if (gs.money <= 0)       { gameOverReason.value = 'Out of budget!'; gs.status = 'gameover'; ended = true }
  else if (gs.morale <= 0) { gameOverReason.value = 'The team quit!'; gs.status = 'gameover'; ended = true }
  // Zafer: ÜÇ teslimat akışı da kendi hedefine ulaştıysa (kapsamın tamamı teslim edildi).
  else if (TRACK_KEYS.every(k => project[k] >= TRACK_TARGET[k])) { gs.status = 'victory'; ended = true }
  if (ended) {
    finalizeScore()
    logScore('final')                                   // final score_update (folded competition total)
    logger.endSession(gs.status === 'victory')          // GPAF session_end → payload.completed
  }
  return ended
}

// Çalışan skoru (oyun içi kararlar) + oyun sonu bonuslarını TEK noktada yarışma skoruna çevirir
// (hız + sınıflandırma isabeti ağırlıklı). Dökümü post-mortem için saklar. src/scoring.js.
function finalizeScore() {
  const r = computeEndScore({
    runningScore: gs.score, day: gs.day, status: gs.status,
    money: gs.money, morale: gs.morale, stats,
  })
  scoreBreakdown.value = r
  gs.score = r.total
}

// ─── RESOLVE A RISK (classify → decide → reveal) ───
// Oyuncu hayvanı seçer (sınıflandırma) → "MİTİGE ET (parayla)" mı yoksa "ŞANSI DENE (bedava)" mı
// olduğuna karar verir → residual olasılığa karşı zar atılır ve sonuç DRAMATİK olarak açıklanır:
// risk gerçeğe dönüştü mü (bütçeyi/mo+rali/takvimi vurur) yoksa atlatıldı mı. Hasar, gerilim için
// "RESOLVING" anından sonra uygulanır. Skor KARAR kalitesini ödüllendirir (doğru sınıflandırma +
// düşürülen EMV), zarı değil → şanssız bir tetiklenme iyi oyunu cezalandırmaz.
function handleResolve({ guessKey, action = 'gamble', probPoints = 0, impactPoints = 0 }) {
  const risk = triggeredRisk.value
  if (!risk || riskOutcome.value) return
  const tk = trackForCategory(risk.type) || 'product'   // bu riskin beslediği / geri attığı teslimat akışı
  const tkIcon = TRACKS.find(t => t.key === tk)?.icon || ''
  const trueAnimal = classifyRisk(risk)
  const response = TUSLER_ANIMALS[guessKey].idealResponse
  const { verdict, scoreDelta, lesson } = evaluateResponse(trueAnimal.key, response)

  stats.tuslerTotal++
  stats.risksProactivelyHandled++
  if (verdict === 'ideal') stats.tuslerCorrect++

  const ep = effortPointsFor(verdict)
  const baseEmv = riskEmv(risk)

  // İki karar: MITIGATE (parayla azalt) veya ŞANSI DENE (bedava). Doğru sınıflandırma daha çok
  // mitigasyon gücü kazandırır; yine de tavanla sınırla (güvenlik).
  const pp = Math.max(0, Math.min(probPoints, ep))
  const ip = Math.max(0, Math.min(impactPoints, ep - pp))
  const m = applyMitigation(risk, pp, ip)
  const execCost = (pp + ip) * mitigationCostPerPoint(risk)   // mitigasyon parayla ödenir (peşin, riske göre ölçeklenir)
  const mitigated = (pp + ip) > 0

  if (execCost) updateMoney(-execCost)
  if (scoreDelta) updateScore(scoreDelta)
  // Karar kalitesi bonusu: düşürülen EMV (şansa bağlı değil).
  const emvReduced = Math.max(0, baseEmv - m.residualEmv)
  if (emvReduced) updateScore(Math.round(emvReduced / 100))

  // Takvim hasarı artık ilerleme baskısı: gecikme tetiklenirse projeyi geri atar (gün/leaderboard'a mal olur).
  const dmgProgress = m.residualDelay ? m.residualDelay * DELAY_PROGRESS_PER_DAY : 0

  // Residual olasılığa karşı zar at.
  const triggered = Math.random() * 100 < m.residualProb
  riskOutcome.value = {
    phase: 'rolling', triggered, mitigated, action, execCost, rollProb: m.residualProb,
    dmgMoney: m.residualMoney, dmgMorale: m.residualMorale, dmgProgress,
    riskName: risk.name, riskIcon: risk.icon,
  }

  // Dramatik an: kısa bir bekleyişten sonra sonucu açıkla ve bütçe/moral/takvim etkisini uygula.
  if (resolveTimer) clearTimeout(resolveTimer)
  resolveTimer = setTimeout(() => {
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2
    const bits = []
    if (execCost) bits.push(`mitigate -$${execCost.toLocaleString()}`)
    // İyi risk yönetimi PROJEYİ İLERLETİR: doğru okuma momentum kazandırır; riski hasarsız
    // atlatmak (zar/mitigasyon) ekibe inşa için zaman açar.
    let gained = 0
    if (verdict === 'ideal') gained += CLASSIFY_PROGRESS_BONUS   // doğru sınıflandırma → küçük momentum (tetiklense bile)
    if (triggered) {
      if (m.residualMoney)  updateMoney(-m.residualMoney)
      if (m.residualMorale) updateMorale(-m.residualMorale)
      if (dmgProgress)      project[tk] = Math.max(0, project[tk] - dmgProgress)   // gecikme yalnızca kendi akışını geri atar
      triggerFx('shake', 400); triggerFx('glitch', 500)
      if (m.residualMoney) triggerFx('moneyFlash')
      spawnParticles(cx, cy, 14, 'bug')
      if (m.residualMoney)  bits.push(`damage -$${m.residualMoney.toLocaleString()}`)
      if (m.residualMorale) bits.push(`-${m.residualMorale} morale`)
      if (dmgProgress)      bits.push(`${tkIcon} -${dmgProgress} progress`)
    } else {
      updateScore(100)   // avoided bonus
      gained += avoidProgressBonus(risk)   // hasarsız atlatıldı → EMV'ye göre ilerleme boost'u
      triggerFx('criticalSuccess', 1200)
      spawnParticles(cx, cy, 20, 'crit')
      bits.push('avoided ✓')
    }
    const progressGain = addTrackProgress(tk, gained)
    if (progressGain) { bits.push(`${tkIcon} +${progressGain} progress`); checkMilestones() }
    addLog(lesson, 'pmbok')
    const actionLabel = mitigated ? 'MITIGATED' : 'TOOK THE CHANCE'
    addLog(`${risk.icon} "${risk.name}" → ${actionLabel} (${bits.join(', ')})`, triggered ? 'warning' : 'success')
    if (riskOutcome.value) riskOutcome.value = { ...riskOutcome.value, phase: 'revealed', progressGain }
    logScore('risk_resolved')           // GPAF score_update — risk sonucu yerleşti
    resolveTimer = null
  }, 1050)
}

function closeClassify() {
  if (resolveTimer) { clearTimeout(resolveTimer); resolveTimer = null }
  triggeredRisk.value = null
  riskOutcome.value = null
  checkGameEnd()
}

// ─── SHOP: hire specialists / buy upgrades (FR3 + FR7) ───
// Radar çubuğuna tıklayınca shop o kategoriye odaklanarak açılır; HUD butonu odaksız açar.
function openManage(category = null) {
  manageFocus.value = category
  showManagement.value = true
}

function hireEmployee(id) {
  const e = employees.value.find(x => x.id === id)
  if (!e || e.hired) return
  e.hired = true
  syncTeamMorale()
  spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 16, 'hire')
  const red = e.reduction ? ` (${e.category} risk −${e.reduction}%)` : ''
  addLog(`🧑‍💻 Hired ${e.name} — ${e.role}, $${e.dailyCost.toLocaleString()}/day${red}`, 'success')
}

function buyUpgrade(id) {
  const u = upgrades.value.find(x => x.id === id)
  if (!u || u.purchased || gs.money < u.cost) return
  u.purchased = true
  updateMoney(-u.cost)
  spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 16, 'hire')
  addLog(`⚙️ Bought ${u.name} — ${u.category === 'all' ? 'all risks' : u.category} ${u.reduction ? '−' + u.reduction + '%' : ''}`, 'success')
  logScore('shop')                      // GPAF score_update — bakiye değişti
}

// ─── PROCESS NEXT DAY ───
async function handleNextDay() {
  spawnParticles(window.innerWidth/2, window.innerHeight - 120, 14, 'day')
  await processNextDay()
}

async function processNextDay() {
  if (isProcessing.value || gs.status !== 'playing' || triggeredRisk.value || daySummary.value) return
  isProcessing.value = true

  gs.day++

  // İşe alınan ekipten günlük ilerleme (moral çarpanıyla) — her çalışan `specialty` akışında uzmandır:
  // o akışa EXPERT_BONUS, diğer iki akışa EXPERT_TRICKLE oranında katkı verir. Uzmanlığı olmayan
  // (stajyer/genel) üretim üç akışa eşit bölünür.
  const mm = gs.morale >= 70 ? 1.2 : gs.morale >= 40 ? 1.0 : 0.75
  const gain = { infra:0, security:0, product:0 }
  employees.value.forEach(e => {
    if (!e.hired) return
    if (e.specialty && gain[e.specialty] !== undefined) {
      TRACK_KEYS.forEach(k => {
        gain[k] += e.productivity * (k === e.specialty ? EXPERT_BONUS : EXPERT_TRICKLE)
      })
    } else {
      const each = e.productivity / TRACK_KEYS.length
      TRACK_KEYS.forEach(k => { gain[k] += each })
    }
  })
  // Günlük gider = sabit ofis gideri + işe alınanların maaşları (FR1/FR3)
  const salaries = employees.value.filter(e => e.hired).reduce((s, e) => s + (e.dailyCost || 0), 0)
  const dailyCost = DAILY_COST + salaries
  lastDailyCost.value = dailyCost
  updateMoney(-dailyCost)
  updateMorale(-1)
  // Espresso Machine yükseltmesi: pasif moral telafisi
  const espresso = upgrades.value.find(u => u.id === 'espresso' && u.purchased)
  if (espresso) updateMorale(espresso.morale || 0)
  // Owned personalized perks give each employee a small daily morale bump
  employees.value.forEach(e => {
    if (!e.hired) return
    const passive = passiveMoraleFor(e)
    if (passive) e.morale = Math.min(100, e.morale + passive)
  })
  syncTeamMorale()
  // Akış başına ilerlemeyi uygula (moral çarpanı); clamp sonrası gerçekte eklenen miktarı say.
  let dp = 0
  TRACKS.forEach(t => {
    const added = addTrackProgress(t.key, Math.round(gain[t.key] * mm))
    lastTrackProgress[t.key] = added
    dp += added
  })
  lastDailyProgress.value = dp
  const reachedMs = checkMilestones()
  triggerFx('glitch', 300)
  logScore('day_end')                   // GPAF score_update — gün işlendi (oyun bitse de loglanır)

  isProcessing.value = false
  if (checkGameEnd()) return

  // ── ZAMANLA SCOPE DEĞİŞİMİ: müşteri gereksinimleri değişir → bir track geriye gider ──
  // (mevcut "geri atma" mekaniğiyle aynı; o gün risk çıkmaz ki gün çift kötü olmasın)
  let scopeChange = null
  if (gs.day >= SCOPE_CHANGE_MIN_DAY && scopeChanges.value < SCOPE_CHANGE_MAX
      && Math.random() < SCOPE_CHANGE_CHANCE) {
    const candidates = TRACK_KEYS.filter(k => project[k] > 0)   // sadece başlamış track'ler geri atılabilir
    if (candidates.length) {
      const key = candidates[Math.floor(Math.random() * candidates.length)]
      const t   = TRACKS.find(x => x.key === key)
      const pct = SCOPE_CHANGE_MIN_PCT + Math.random() * (SCOPE_CHANGE_MAX_PCT - SCOPE_CHANGE_MIN_PCT)
      const before = project[key]
      project[key] = Math.max(0, project[key] - Math.round(TRACK_TARGET[key] * pct))
      const lost = before - project[key]
      scopeChanges.value++
      scopeChange = { key, icon: t.icon, label: t.label, lost }
      addLog(`📋 SCOPE CHANGED — "${t.label}" gereksinimleri değişti (${t.icon} -${lost} ilerleme)`, 'warning')
      triggerFx('shake', 400); triggerFx('glitch', 500)
      spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 14, 'bug')
    }
  }

  // Bir süre sonra risk ortaya çıkar → oyuncu sınıflandırır (scope değiştiği gün risk çıkmaz)
  let riskSpawned = false
  if (!scopeChange && gs.day >= 3 && Math.random() < RISK_CHANCE) {
    const avail = allRisksPool.filter(r => !usedRiskIds.value.includes(r.id))
    if (avail.length) {
      // Tehdidi yüksek kategoriden risk gelme olasılığı daha yüksek (öngörü çubukları).
      const weights = avail.map(r => Math.max(1, threatByType.value[r.type] || 1))
      const total = weights.reduce((a, b) => a + b, 0)
      let roll = Math.random() * total, pick = 0
      while (pick < avail.length - 1 && (roll -= weights[pick]) > 0) pick++
      const r = JSON.parse(JSON.stringify(avail[pick]))
      usedRiskIds.value.push(r.id)
      // Aktif mitigasyonları uygula → etkin olasılık (sınıflandırmayı kaydırabilir)
      r.baseProb = r.prob
      const red = reductionByType.value[r.type] || 0
      r.prob = Math.max(0, Math.round(r.prob * (1 - red)))
      triggeredRisk.value = r
      triggerFx('shake', 400)
      addLog(`⚠️ A new risk appeared: "${r.name}" — classify it!`, 'warning')
      riskSpawned = true
    }
  }

  // Risk çıkmadıysa kısa gün özeti göster (In-Scope Day Summary)
  if (!riskSpawned) {
    daySummary.value = {
      day: gs.day,
      progress: dp,
      cost: dailyCost,
      morale: gs.morale,
      completedPct: completedPct.value,
      tracks: tracks.value,
      milestone: reachedMs.length ? reachedMs[reachedMs.length - 1] : null,
      scopeChange,   // null veya { key, icon, label, lost } — Day Summary'de uyarı bloğu
    }
  }
}

// ─── GAME LIFECYCLE ───
function startGame() {
  // Directly start playing — skip the risk planning screen.
  gs.status = 'playing'
  syncTeamMorale()
  logger.startSession()                 // GPAF session_start (new sessionId)
  logScore('start')                     // baseline score_update
}

// Kept for compatibility but no longer called from the UI.
function beginProject(payload) {
  plannedCategories.value = payload?.categories || []
  updateScore(payload?.score || 0)
  gs.status = 'playing'
  syncTeamMorale()
  const watching = plannedCategories.value.map(categoryLabel).join(', ')
  addLog(`📋 Risk plan set — identified: ${watching || 'no real risks flagged'}${payload?.score ? ` (+${payload.score} score)` : ''}.`, 'pmbok')
  addLog('🟢 PROJECT: NEON started. Advance the days; as risks appear, classify each to the right animal!', 'success')
}

function resetGame() {
  logger.reset()                        // clear the previous session's GPAF buffer
  Object.assign(gs, { status:'menu', money:100000, day:1, morale:75, score:0, loans:0, loanPenalty:0 })
  Object.assign(project, { infra:0, security:0, product:0 })
  Object.assign(lastTrackProgress, { infra:0, security:0, product:0 })
  employees.value = defaultEmployees()
  upgrades.value = defaultUpgrades()
  moraleEmployeeId.value = null
  eventLog.value = []
  usedRiskIds.value = []
  scopeChanges.value = 0
  plannedCategories.value = []
  milestones.forEach(m => m.reached = false)
  lastDailyProgress.value = 0; lastDailyCost.value = 0
  Object.assign(stats, { critSuccesses:0, bugsFixed:0, dilemmasResolved:0, risksProactivelyHandled:0, tuslerCorrect:0, tuslerTotal:0 })
  triggeredRisk.value = null
  if (resolveTimer) { clearTimeout(resolveTimer); resolveTimer = null }
  riskOutcome.value = null
  daySummary.value = null
  scoreBreakdown.value = null
  showManagement.value = false
  manageFocus.value = null
  showRiskCenter.value = false
  showKnowledgeBase.value = false
}

// ─── LIFECYCLE ───
onMounted(() => {
  // BG canvas
  const canvas = bgCanvas.value
  if (canvas) {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d'); const ts = 32
    const colors = ['#2d5a1b','#2a5418','#316020','#285215']
    for (let y=0;y<canvas.height;y+=ts) {
      for (let x=0;x<canvas.width;x+=ts) {
        ctx.fillStyle = colors[Math.floor(Math.random()*colors.length)]
        ctx.fillRect(x,y,ts,ts)
        ctx.fillStyle = 'rgba(0,0,0,0.08)'
        ctx.fillRect(x+ts-2,y,2,ts); ctx.fillRect(x,y+ts-2,ts,2)
      }
    }
  }
  // Particle canvas
  const pCanvas = particleCanvas.value
  if (pCanvas) {
    pCanvas.width = window.innerWidth; pCanvas.height = window.innerHeight
  }
  particleRafId = requestAnimationFrame(animateParticles)
})

onUnmounted(() => {
  if (particleRafId) cancelAnimationFrame(particleRafId)
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
/* Readable mono is the default; pixel font is opt-in via .pixel / identity classes below. */
* { font-family:'Share Tech Mono','Courier New',monospace; box-sizing:border-box; image-rendering:pixelated; }
.pixel { font-family:'Press Start 2P',monospace; }

/* ─── VIGNETTE ─── */
.vignette-overlay {
  position:fixed;inset:0;z-index:5;pointer-events:none;
  transition:opacity 1.2s ease;
}

/* ─── GLITCH OVERLAY ─── */
.glitch-overlay {
  position:fixed;inset:0;z-index:50;pointer-events:none;
  animation:glitchAnim 0.5s steps(3) forwards;
}
@keyframes glitchAnim {
  0%   { background:transparent; transform:none; }
  20%  { background:rgba(255,0,128,0.04); transform:translateX(-3px) skewX(-0.5deg); }
  40%  { background:rgba(0,255,255,0.04); transform:translateX(3px); }
  60%  { background:transparent; }
  80%  { background:rgba(255,0,0,0.03); transform:translateX(-1px); }
  100% { background:transparent; transform:none; }
}

/* ─── CRITICAL SUCCESS ─── */
.crit-flash {
  position:fixed;inset:0;z-index:60;pointer-events:none;
  background:radial-gradient(ellipse at center, rgba(255,220,0,0.15) 0%, transparent 70%);
  animation:critFade 2s ease-out forwards;
}
.crit-text {
  position:absolute;top:30%;left:50%;transform:translateX(-50%);
  font-family:'Press Start 2P',monospace;
  font-size:18px;color:#ffe040;text-shadow:0 0 20px #ffb000,0 0 40px #ff8000;
  animation:critText 2s ease-out forwards;
}
@keyframes critFade { 0%{opacity:1}80%{opacity:0.6}100%{opacity:0} }
@keyframes critText { 0%{transform:translateX(-50%) scale(0.5);opacity:0}20%{transform:translateX(-50%) scale(1.2);opacity:1}80%{opacity:1}100%{transform:translateX(-50%) translateY(-40px) scale(1);opacity:0} }

/* ─── BUG FLASH ─── */
.bug-flash {
  position:fixed;inset:0;z-index:60;pointer-events:none;
  background:radial-gradient(ellipse at center, rgba(255,0,0,0.12) 0%, transparent 70%);
  animation:bugFade 1.8s ease-out forwards;
}
.bug-text {
  position:absolute;top:30%;left:50%;transform:translateX(-50%);
  font-size:14px;color:#ff4040;text-shadow:0 0 15px #ff0000;
  animation:bugText 1.8s ease-out forwards;
}
@keyframes bugFade { 0%{opacity:1}100%{opacity:0} }
@keyframes bugText { 0%{transform:translateX(-50%) scale(0.8);opacity:0}15%{transform:translateX(-50%) scale(1.1);opacity:1}80%{opacity:1}100%{transform:translateX(-50%) translateY(-30px);opacity:0} }

/* ─── PIXEL PANEL ─── */
.pixel-panel { background:#b08050;border:4px solid #5a3018;box-shadow:inset 3px 3px 0 #d4a870,inset -3px -3px 0 #7a4828,4px 4px 0 #1a0a04; }
.pixel-inset { background:#6a4828;border:3px solid #3a1808;box-shadow:inset 2px 2px 0 #2a1008; }

/* ─── HUD ─── */
.pixel-hud-bar { border-bottom:4px solid #2a1008;box-shadow:0 4px 0 #1a0a04; }
.pixel-hud-chip { display:flex;align-items:center;gap:4px;padding:3px 8px;font-size:7px;border:2px solid;box-shadow:inset 1px 1px 0 rgba(255,255,255,0.15),2px 2px 0 #1a0a04; }
.hud-stat { display:flex;flex-direction:column;justify-content:center;gap:3px;padding:6px 12px;border:2px solid;box-shadow:inset 1px 1px 0 rgba(255,255,255,0.15),2px 2px 0 #1a0a04;min-width:72px; }
.hud-stat-label { font-size:11px;letter-spacing:1px;font-family:'Share Tech Mono',monospace;white-space:nowrap; }
.hud-stat-value { font-size:17px;font-family:'Press Start 2P',monospace;white-space:nowrap;line-height:1.2; }
.hud-stat-flash { background:#602020!important;border-color:#301010!important; }
.hud-stat-flash .hud-stat-label, .hud-stat-flash .hud-stat-value { color:#f08080!important; }
.hud-chip-red    { background:#602020!important;color:#f08080!important;border-color:#301010!important; }
.hud-chip-synergy { background:#203840;color:#60d0c0;border-color:#104030; }
.hud-chip-crit   { background:#302000;color:#f0c000;border-color:#504000; }

/* ─── BARS ─── */
.pixel-bar-track { height:8px;background:#1a0a04;border:2px solid #0a0404; }
.pixel-bar-fill  { height:100%;transition:width 0.5s steps(10); }
.bar-pulse-danger { animation:pulseDanger 0.8s step-end infinite; }
.bar-pulse-good   { animation:pulseGood 2s ease-in-out infinite; }
@keyframes pulseDanger { 0%,100%{opacity:1}50%{opacity:0.4} }
@keyframes pulseGood   { 0%,100%{box-shadow:none}50%{box-shadow:0 0 6px #60d060} }

/* ─── TABS ─── */
.pixel-tab-bar { border-bottom:3px solid #0a0602; }
.pixel-tab { padding:6px 4px;cursor:pointer;border:none;background:transparent;font-family:'Press Start 2P',monospace;transition:background 0.1s; }
.pixel-tab:hover { background:rgba(255,255,255,0.05); }

/* ─── TITLE BARS ─── */
.pixel-title-bar       { background:#4a3018;border-bottom:3px solid #2a1008;font-family:'Press Start 2P',monospace; }
.pixel-title-bar-red   { background:#602020;border-bottom:3px solid #3a1010; }
.pixel-title-bar-green { background:#206020;border-bottom:3px solid #103010; }

/* ─── BUTTONS ─── */
.pixel-btn       { background:#4a6030;color:#c8e090;border:3px solid #2a3818;box-shadow:0 4px 0 #1a2010;cursor:pointer;font-family:'Press Start 2P',monospace;transition:transform 0.1s,box-shadow 0.1s; }
.pixel-btn:hover { background:#5a7040; }
.pixel-btn:active { transform:translateY(4px);box-shadow:0 0 0; }
.pixel-btn-green       { background:#3a8030;color:#c8f090;border:3px solid #1a4018;box-shadow:0 4px 0 #0a2008;cursor:pointer;font-family:'Press Start 2P',monospace; }
.pixel-btn-green:hover { background:#4a9040; }
.pixel-btn-green:active { transform:translateY(4px);box-shadow:0 0 0; }
.pixel-btn-red         { background:#803030;color:#f09090;border:3px solid #401818;box-shadow:0 4px 0 #200808;cursor:pointer;font-family:'Press Start 2P',monospace; }

/* ─── MISC ─── */
.pixel-badge { background:#e04040;color:white;font-size:7px;width:14px;height:14px;display:flex;align-items:center;justify-content:center;border:2px solid #601010; }
.pixel-scrollbar::-webkit-scrollbar { width:8px; }
.pixel-scrollbar::-webkit-scrollbar-track { background:#3a2010; }
.pixel-scrollbar::-webkit-scrollbar-thumb { background:#6a4828;border:2px solid #3a2010; }
.pixel-ticker { background:#2a1808;border-top:3px solid #1a0a04; }
.ticker-scroll { animation:ticker 45s linear infinite;display:inline-block; }
@keyframes ticker { from{transform:translateX(100vw)}to{transform:translateX(-100%)} }

/* ─── FX ─── */
@keyframes shake { 0%,100%{transform:translate(0,0)}20%{transform:translate(-5px,3px)}40%{transform:translate(5px,-3px)}60%{transform:translate(-3px,5px)}80%{transform:translate(3px,-2px)} }
.shakeanim { animation:shake 0.4s ease-in-out; }
.bounce-anim { animation:bounce 0.6s infinite alternate; }
@keyframes bounce { from{transform:translateY(0)}to{transform:translateY(-14px)} }
.blinkanim { animation:blinkanim 0.6s step-start infinite; }
@keyframes blinkanim { 50%{opacity:0} }

/* ─── TRANSITIONS ─── */
.fade-enter-active,.fade-leave-active{transition:opacity 0.2s}
.fade-enter-from,.fade-leave-to{opacity:0}
.list-enter-active,.list-leave-active{transition:all 0.3s}
.list-enter-from{opacity:0;transform:translateX(18px)}
.list-leave-to{opacity:0;transform:translateX(-18px)}
</style>
