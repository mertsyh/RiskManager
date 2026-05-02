<template>
  <!-- BG Grass -->
  <div class="fixed inset-0 -z-10 overflow-hidden" :style="{background:theme.bgGrass}">
    <canvas ref="bgCanvas" class="absolute inset-0 w-full h-full"></canvas>
  </div>

  <!-- ══ DANGER VIGNETTE (always present, opacity driven by danger) ══ -->
  <div class="vignette-overlay" :style="vignetteStyle"></div>

  <!-- ══ GLITCH OVERLAY ══ -->
  <div v-if="fx.glitch" class="glitch-overlay"></div>

  <!-- ══ CRITICAL SUCCESS FLASH ══ -->
  <Transition name="fade">
    <div v-if="fx.criticalSuccess" class="crit-flash">
      <div class="crit-text">⭐ KRİTİK BAŞARI!</div>
    </div>
  </Transition>

  <!-- ══ BUG EVENT FLASH ══ -->
  <Transition name="fade">
    <div v-if="fx.bugEvent" class="bug-flash">
      <div class="bug-text">🐛 BUG PATLAMASI!</div>
    </div>
  </Transition>

  <!-- ══ PARTICLE CANVAS ══ -->
  <canvas ref="particleCanvas" class="particle-canvas" style="position:fixed;inset:0;z-index:30;pointer-events:none"></canvas>

<div class="min-h-screen flex flex-col" style="font-family:'Press Start 2P',monospace;image-rendering:pixelated" :style="{filter: mainFilter}" :class="{shakeanim: fx.shake}">

    <!-- ══════════ MENU ══════════ -->
    <Transition name="fade">
      <div v-if="gs.status==='menu'" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80">
        <div class="relative z-10 flex flex-col gap-4 pixel-panel p-0 overflow-hidden w-[480px] border-4 border-gray-800 shadow-lg">
          <div class="pixel-title-bar px-4 py-2 flex justify-between text-xs" :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
            <span>★ ANTHROPIC VENTURES ★</span><span>v3.0</span>
          </div>
          <div class="px-6 pb-6 flex flex-col gap-6 pt-4">
            <div class="text-center" style="line-height:2.5">
              <div style="font-size:32px;color:#fff;text-shadow:4px 4px 0 #000;letter-spacing:4px">RISK</div>
              <div style="font-size:32px;color:#fff;text-shadow:4px 4px 0 #000;letter-spacing:2px">MANAGER</div>
              <div style="font-size:10px;color:#a3b18a;margin-top:4px;letter-spacing:3px">PROTOCOL // 2026</div>
            </div>
            <div class="pixel-inset p-4 text-center text-sm" :style="{ backgroundColor: theme.panelBg, color: theme.riskDescText }">
              30 günde PROJECT: NEON'u teslim et.<br>Ekibi yönet · Riskleri bertaraf et · Sürprizlerle baş et!
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="pixel-inset p-3 text-center" :style="{ backgroundColor: theme.panelBg, color: theme.chipGreenText }"><div class="text-2xl">🤝</div>EKİP SİNERJİSİ</div>
              <div class="pixel-inset p-3 text-center" :style="{ backgroundColor: theme.panelBg, color: theme.chipYellowText }"><div class="text-2xl">⭐</div>KRİTİK BAŞARI</div>
              <div class="pixel-inset p-3 text-center" :style="{ backgroundColor: theme.panelBg, color: '#c080f0' }"><div class="text-2xl">❓</div>İKİLEM SİSTEMİ</div>
              <div class="pixel-inset p-3 text-center" :style="{ backgroundColor: theme.panelBg, color: '#f06060' }"><div class="text-2xl">🐛</div>BUG RİSKİ</div>
            </div>
            <button @click="startGame" class="pixel-btn-green py-4 text-lg tracking-widest">▶  SİSTEMİ BAŞLAT</button>
          </div>
          <div class="pixel-title-bar px-4 py-2 text-center text-xs" :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
            ANTHROPIC VENTURES © 2026
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══════════ POST MORTEM (GAME OVER / VICTORY) ══════════ -->
    <Transition name="fade">
      <PostMortemReport v-if="gs.status==='gameover' || gs.status==='victory'" 
        :status="gs.status" 
        :reason="gameOverReason" 
        :project="project" 
        :stats="stats" 
        :gs="gs" 
        :theme="theme" 
        @restart="resetGame" />
    </Transition>

    <!-- ══════════ PLAYING ══════════ -->
    <template v-if="gs.status !== 'menu'">

      <!-- HUD BAR -->
      <header class="pixel-hud-bar flex items-center justify-between px-3 shrink-0" style="height:44px"
        :style="{background:theme.hudBg}">
        <div style="font-size:8px;color:#ffe4a0;display:flex;align-items:center;gap:6px">
          <span style="font-size:18px">🏢</span> RM 2026
        </div>
        <div style="display:flex;gap:5px;align-items:center">
          <!-- Money -->
          <div class="pixel-hud-chip" :class="fx.moneyFlash?'hud-chip-red':''"
            :style="!fx.moneyFlash?{background:theme.chipGreen,color:theme.chipGreenText,borderColor:theme.chipGreen}:{}">
            💰 ${{ gs.money.toLocaleString() }}
          </div>
          <!-- Morale with pulsing bar -->
          <div class="pixel-hud-chip" style="display:flex;align-items:center;gap:5px"
            :style="{background:theme.chipYellow,color:theme.chipYellowText,borderColor:theme.chipYellow}">
            {{ moraleIcon }}
            <div class="pixel-bar-track" style="width:52px">
              <div :class="['pixel-bar-fill', gs.morale<30?'bar-pulse-danger':gs.morale>70?'bar-pulse-good':'']"
                   :style="{width:gs.morale+'%',background:gs.morale>60?theme.energyFull:gs.morale>30?theme.energyMid:theme.energyLow}"></div>
            </div>
            {{ gs.morale }}%
          </div>
          <!-- Day -->
          <div class="pixel-hud-chip" :style="{background:theme.chipBlue,color:theme.chipBlueText,borderColor:theme.chipBlue}">
            📅 G{{ gs.day }}/30
          </div>
          <!-- Deadline -->
          <div class="pixel-hud-chip" :class="project.deadline<=5?'blinkanim':''"
            :style="project.deadline<=5?{background:theme.chipRed,color:'#f08080',borderColor:theme.chipRed}:{background:theme.chipBrown,color:'#c8a070',borderColor:theme.chipBrown}">
            ⏱ {{ project.deadline }}G KALDI
          </div>
          <!-- Synergy indicator -->
          <div v-if="synergyBonus > 0" class="pixel-hud-chip hud-chip-synergy">
            🤝 SİNERJİ +{{ synergyBonus }}
          </div>
          <!-- Crit chance indicator -->
          <div v-if="critChance > 0" class="pixel-hud-chip hud-chip-crit blinkanim">
            ⭐ KRIT %{{ critChance }}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:6px;color:#7a6040">PROJECT: NEON</span>
          <button @click="showKnowledgeBase = true" class="pixel-btn" style="font-size: 6px; padding: 2px 4px;">📖 BİLGİ</button>
          <button @click="toggleTheme" class="pixel-btn" style="font-size: 6px; padding: 2px 4px;">🎨</button>
          <ThemePanel :theme="theme" @update="(k,v)=>theme[k]=v" />
        </div>
      </header>

      <!-- MAIN GRID (3 COLUMNS) -->
      <main class="flex-1 p-2 gap-2 overflow-hidden w-full"
            style="display:grid;grid-template-columns:260px 1fr 260px; max-width: 1400px; margin: 0 auto;">
        
        <!-- LEFT: Educational Sidebar -->
        <EducationalSidebar side="left" :theme="theme" />

        <!-- CENTER: Dashboard & Controls -->
        <div class="flex flex-col gap-2 overflow-hidden h-full">
          <!-- DASHBOARD CONTROLS -->
          <div class="flex gap-2 w-full shrink-0">
            <button @click="showTeamShop = true" class="pixel-btn-green flex-1 py-3 text-sm flex items-center justify-center gap-2">
              <span>💼</span> EKİP VE YÜKSELTME
            </button>
            <button @click="showRiskCenter = true" class="pixel-btn-red flex-1 py-3 text-sm flex items-center justify-center gap-2 relative">
              <span>⚠️</span> RİSK & OLAYLAR
              <span v-if="pendingRisks.length" class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs border-2 border-white" style="animation: pulse 2s infinite">{{ pendingRisks.length }}</span>
            </button>
          </div>

          <!-- CENTER DASHBOARD -->
          <div class="w-full flex-1 overflow-hidden" style="display:flex;flex-direction:column;gap:6px">
          <ProjectDashboard
            :project="project" :morale="gs.morale" :day="gs.day"
            :milestones="milestones" :dailyProgress="lastDailyProgress"
            :dailyCost="lastDailyCost" :processing="isProcessing"
            :employees="employees" :theme="theme"
            :synergyBonus="synergyBonus"
            :lastCritSuccess="lastCritSuccess"
            :lastBugEvent="lastBugEvent"
            @nextDay="handleNextDay" />
          </div>
        </div>

        <!-- RIGHT: Educational Sidebar -->
        <EducationalSidebar side="right" :theme="theme" />
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
    <Transition name="fade"><RiskModal v-if="triggeredRisk" :risk="triggeredRisk" @close="closeModal" /></Transition>
    <Transition name="fade"><DaySummary v-if="showDaySummary" :summary="daySummaryData" @close="closeDaySummary" /></Transition>
    <Transition name="fade">
      <DilemmaModal v-if="showDilemma && currentDilemma" :dilemma="currentDilemma"
        @choose="handleDilemmaChoice" @close="showDilemma=false" />
    </Transition>
    <Transition name="fade">
      <KnowledgeBase v-if="showKnowledgeBase" :theme="theme" @close="showKnowledgeBase=false" />
    </Transition>
    <Transition name="fade">
      <TeamShopModal v-if="showTeamShop" 
        :employees="employees" 
        :upgrades="upgrades" 
        :money="gs.money" 
        :theme="theme" 
        :getSynergyPartners="getSynergyPartners"
        @hire="e=>{ hireEmployee(e); spawnParticles(100,400,10,'hire') }"
        @fire="fireEmployee" 
        @overtime="setOvertime" 
        @buy="buyUpgrade"
        @close="showTeamShop=false" />
    </Transition>
    <Transition name="fade">
      <RiskCenterModal v-if="showRiskCenter" 
        :pendingRisks="pendingRisks" 
        :eventLog="eventLog" 
        :theme="theme" 
        @action="handleRiskAction"
        @close="showRiskCenter=false" />
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import EmployeePanel from './components/EmployeePanel.vue'
import ProjectDashboard from './components/projectdashboard.vue'
import RiskCard from './components/RiskCard.vue'
import RiskModal from './components/RiskModal.vue'
import EventLog from './components/EventLog.vue'
import DaySummary from './components/DaySummary.vue'
import UpgradeShop from './components/UpgradeShop.vue'
import ThemePanel from './components/ThemePanel.vue'
import DilemmaModal from './components/DilemmaModal.vue'
import KnowledgeBase from './components/KnowledgeBase.vue'
import PostMortemReport from './components/PostMortemReport.vue'
import TeamShopModal from './components/TeamShopModal.vue'
import RiskCenterModal from './components/RiskCenterModal.vue'
import EducationalSidebar from './components/EducationalSidebar.vue'
import { newTheme } from './design.js'

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

// ─── REFS & STATE ───
const showTeamShop = ref(false), showRiskCenter = ref(false)
const triggeredRisk = ref(null), showDaySummary = ref(false), daySummaryData = ref(null)
const isProcessing = ref(false), lastDailyProgress = ref(0), lastDailyCost = ref(0)
const gameOverReason = ref(''), bgCanvas = ref(null), particleCanvas = ref(null)
const lastCritSuccess = ref(false), lastBugEvent = ref(false)
const showDilemma = ref(false), currentDilemma = ref(null)
const showKnowledgeBase = ref(false)
const eventLog = ref([])
const stats = reactive({ critSuccesses: 0, bugsFixed: 0, dilemmasResolved: 0 })

const fx = reactive({ shake:false, moneyFlash:false, glitch:false, criticalSuccess:false, bugEvent:false })
const gs = reactive({ status:'menu', money:100000, day:1, morale:75 })
const project = reactive({ deadline:30, progress:0, totalEffort:1000 })
const milestones = reactive([
  { pct:25, label:'+$10K', bonus:10000, reached:false, icon:'💰' },
  { pct:50, label:'+$15K', bonus:15000, reached:false, icon:'🎯' },
  { pct:75, label:'+$20K', bonus:20000, reached:false, icon:'🚀' },
])

// ─── EMPLOYEES ───
const defaultEmployees = () => [
  { id:1, name:'Alice', role:'Senior Dev', icon:'🧑‍💻', dailyCost:2000, productivity:50, moralBonus:0, desc:'Bug -%20 | QA ile sinerji', hired:false, energy:100, overtime:false },
  { id:2, name:'Bob',   role:'DevOps',     icon:'🔧',   dailyCost:1500, productivity:30, moralBonus:0, desc:'Server -%25 | Güvenlik ile sinerji', hired:false, energy:100, overtime:false },
  { id:3, name:'Charlie',role:'QA',        icon:'🔍',   dailyCost:1200, productivity:20, moralBonus:0, desc:'Bug -%15 | Senior ile sinerji', hired:false, energy:100, overtime:false },
  { id:4, name:'Diana', role:'PM',         icon:'📊',   dailyCost:1000, productivity:15, moralBonus:8, desc:'+8 moral/gün | Tüm ekiple sinerji', hired:false, energy:100, overtime:false },
  { id:5, name:'Eve',   role:'Güvenlik',   icon:'🔒',   dailyCost:1300, productivity:15, moralBonus:0, desc:'Siber -%30 | DevOps ile sinerji', hired:false, energy:100, overtime:false },
  { id:6, name:'Frank', role:'Frontend',   icon:'🎨',   dailyCost:1100, productivity:35, moralBonus:5, desc:'+5 moral/gün | AI ile sinerji', hired:false, energy:100, overtime:false },
  { id:7, name:'Grace', role:'AI Müh.',    icon:'🤖',   dailyCost:1800, productivity:60, moralBonus:0, desc:'Süper verimli | Frontend ile sinerji', hired:false, energy:100, overtime:false },
  { id:8, name:'Hank',  role:'Stajyer',    icon:'👶',   dailyCost:400,  productivity:8,  moralBonus:0, desc:'Ucuz ama riskli', hired:false, energy:100, overtime:false },
]
const employees = ref(defaultEmployees())

// Sinerji çiftleri (id çiftleri)
const SYNERGY_PAIRS = [[1,3],[2,5],[4,1],[4,2],[4,3],[4,5],[4,6],[4,7],[6,7]]

function getSynergyPartners(empId) {
  return SYNERGY_PAIRS
    .filter(([a,b]) => (a===empId||b===empId))
    .map(([a,b]) => a===empId ? b : a)
    .filter(partnerId => employees.value.find(e=>e.id===partnerId)?.hired)
}

const synergyBonus = computed(() => {
  let bonus = 0
  SYNERGY_PAIRS.forEach(([a,b]) => {
    const empA = employees.value.find(e=>e.id===a)
    const empB = employees.value.find(e=>e.id===b)
    if (empA?.hired && empB?.hired) bonus += 8
  })
  return bonus
})

// ─── UPGRADES ───
const defaultUpgrades = () => [
  { id:'cicd',   name:'CI/CD Pipeline',  icon:'⚙️', cost:5000,  bought:false, desc:'+20 ilerleme/gün' },
  { id:'review', name:'Code Review',     icon:'👁️', cost:3000,  bought:false, desc:'Bug riski -%20' },
  { id:'cloud',  name:'Cloud Scaling',   icon:'☁️', cost:4000,  bought:false, desc:'Server riski -%30' },
  { id:'copilot',name:'AI Copilot',      icon:'🧠', cost:6000,  bought:false, desc:'Dev\'lere +15 üretim' },
  { id:'coffee', name:'Espresso Mak.',   icon:'☕', cost:1500,  bought:false, desc:'+5 moral/gün' },
  { id:'monitor',name:'APM Monitor',     icon:'📡', cost:3500,  bought:false, desc:'Risk olasılık bilgisi' },
  { id:'ergonomic',name:'Ergonomik Masa',icon:'🪑', cost:2500,  bought:false, desc:'Enerji tüketimi -%30' },
  { id:'standup', name:'Daily Standup',  icon:'📋', cost:1000,  bought:false, desc:'Her gün +5 moral bonus' },
]
const upgrades = ref(defaultUpgrades())

// ─── RISKS ───
const allRisksPool = [
  { id:1, name:'Sunucu Çöküşü',      desc:'Veritabanı aşırı yükten çöküyor.',      prob:45, cost:15000, delay:3, level:'high',   type:'server',   status:'pending', icon:'🔥' },
  { id:2, name:'API Limiti',         desc:'Dış servisler engelliyor.',              prob:60, cost:3000,  delay:1, level:'medium', type:'api',      status:'pending', icon:'⛔' },
  { id:3, name:'Güvenlik Açığı',     desc:'Kritik zero-day açığı!',                prob:30, cost:20000, delay:2, level:'high',   type:'security', status:'pending', icon:'🔓' },
  { id:4, name:'Kapsam Kayması',     desc:'Müşteri yeni şeyler istiyor.',          prob:55, cost:5000,  delay:4, level:'medium', type:'scope',    status:'pending', icon:'📈' },
  { id:5, name:'Takım Çatışması',    desc:'Devler kavga ediyor!',                  prob:40, cost:0,     delay:0, level:'low',    type:'conflict', status:'pending', icon:'⚡', moralDamage:25 },
  { id:6, name:'Kritik Bug',         desc:"Production'da kritik hata!",            prob:50, cost:8000,  delay:2, level:'high',   type:'bug',      status:'pending', icon:'🐛' },
  { id:7, name:'3. Parti Çöktü',     desc:'Bağımlı servis offline.',               prob:35, cost:4000,  delay:1, level:'medium', type:'api',      status:'pending', icon:'🔌' },
  { id:8, name:'Veri Kaybı',         desc:'Yedekleme başarısız!',                  prob:25, cost:25000, delay:3, level:'high',   type:'server',   status:'pending', icon:'💾' },
  { id:9, name:'Performans',         desc:'Sistem çok yavaş.',                     prob:45, cost:6000,  delay:2, level:'medium', type:'bug',      status:'pending', icon:'🐢' },
  { id:10,name:'Teknik Borç',        desc:'Eski kod sorun yaratıyor.',             prob:60, cost:7000,  delay:3, level:'medium', type:'bug',      status:'pending', icon:'📚' },
  { id:11,name:'DDoS Saldırısı',     desc:'Kötü trafik geliyor!',                 prob:20, cost:18000, delay:2, level:'high',   type:'security', status:'pending', icon:'💀' },
  { id:12,name:'Mevzuat',            desc:'KVKK uyumluluğu gerekli.',             prob:25, cost:10000, delay:2, level:'medium', type:'scope',    status:'pending', icon:'⚖️' },
  { id:13,name:'Stajyer Hatası',     desc:"Hank prod'a push etti!",               prob:70, cost:3000,  delay:1, level:'low',    type:'bug',      status:'pending', icon:'😱' },
  { id:14,name:'Lisans Sorunu',      desc:'Tedarikçi lisansı bitiyor.',            prob:30, cost:5000,  delay:1, level:'medium', type:'api',      status:'pending', icon:'📋' },
  { id:15,name:'İK Riski',           desc:'Kıdemli dev ayrılabilir!',             prob:35, cost:0,     delay:0, level:'high',   type:'conflict', status:'pending', icon:'🚪', moralDamage:30 },
]
const activeRiskPool = ref([])

// ─── DILEMMAS ───
const allDilemmas = [
  { id:1, icon:'📈', title:'KAPSAM KAYMASI (Scope Creep)', desc:"Müşteri sözleşmede olmayan ufak ama 'şık' bir özellik (Gold Plating) istiyor.",
    optA:{ text:'✅ Kabul Et  +20 Moral, -3G', effect:()=>{ updateMorale(20); project.deadline-=3; addLog('[PMBOK]: Müşteri mutlu ama proje takvimi sıkıştı! (Scope Creep)','warning') } },
    optB:{ text:'🚫 Reddet (Change Request İste)', effect:()=>{ addLog('[PMBOK]: Ek kapsam talebi reddedildi, temel çizgi (baseline) korundu.','success') } } },
  { id:2, icon:'💼', title:'KAYNAK RİSKİ (Turnover)', desc:'Kıdemli bir geliştirici rakip firmadan %30 zamlı teklif aldı.',
    optA:{ text:'💰 Zam Ver  -$8K',          effect:()=>{ updateMoney(-8000); addLog("[PMBOK]: Bütçeden feragat edilerek kilit kaynak elde tutuldu.",'success') } },
    optB:{ text:'🚪 Reddet  -20 Moral',       effect:()=>{ updateMorale(-20); addLog("[PMBOK]: Geliştirici ayrıldı, takım morali ve hız düştü.",'warning') } } },
  { id:3, icon:'⚡', title:'HIZLANDIRMA (Crashing)', desc:'Teslimatı hızlandırmak için ekibe fazla mesai yaptırmalı mıyız? (Schedule Compression)',
    optA:{ text:'⏰ Mesaiye Kal +$15K / -20M', effect:()=>{ updateMoney(15000); updateMorale(-20); project.deadline-=1; addLog('[PMBOK]: Crashing uygulandı: Bütçe eklendi ama ekip yoruldu.','warning') } },
    optB:{ text:'🛑 Hayır (Statüko Koru)',    effect:()=>{ addLog('[PMBOK]: Normal tempoda devam ediliyor.','info') } } },
  { id:4, icon:'🔍', title:'KALİTE GÜVENCESİ (QA)', desc:'Bir alt yüklenicinin kodunda potansiyel hatalar (Defects) var.',
    optA:{ text:'🛡️ Testleri Sıkılaştır -$5K', effect:()=>{ updateMoney(-5000); activeRiskPool.value.forEach(r=>{ if(r.type==='bug') r.prob=Math.max(5,r.prob-15) }); addLog('[PMBOK]: Kalite Kontrol (Prevention) maliyeti arttı ama Bug riski düştü.','success') } },
    optB:{ text:'🤫 Kabul Et (Risk Primi Artar)', effect:()=>{ activeRiskPool.value.forEach(r=>{ if(r.type==='bug') r.prob=Math.min(95,r.prob+20) }); addLog('[PMBOK]: Teknik borç kabul edildi, son kullanıcı hata riski yükseldi!','danger') } } },
  { id:5, icon:'📜', title:'SÖZLEŞME RİSKİ',    desc:'Tedarikçi firma lisans yenilemesi için sözleşme dışı ek ücret talep ediyor.',
    optA:{ text:'⚖️ İtiraz Et (Riskli)',      effect:()=>{ if(Math.random()<0.5){ addLog('[PMBOK]: İtiraz başarılı, sözleşme korundu.','success') } else { updateMoney(-10000); addLog('[PMBOK]: İtiraz başarısız, hukuki masraflar bütçeyi deldi!','danger') } } },
    optB:{ text:'💸 Öde ve Geç -$4K',         effect:()=>{ updateMoney(-4000); addLog('[PMBOK]: Risk kabul edildi ve Contingency Reserve (Yedek Akçe) kullanıldı.','warning') } } },
]

// ─── POSITIVE / NEGATIVE EVENTS ───
const positiveEvents = [
  {msg:'☕ Yeni kahve makinesi! Moral arttı.',   moralDelta:12, moneyDelta:0,    progressDelta:0},
  {msg:'🎉 Takım öğle yemeğine çıktı!',         moralDelta:15, moneyDelta:0,    progressDelta:8},
  {msg:'🚀 Yeni kütüphane işi hızlandırdı!',    moralDelta:5,  moneyDelta:0,    progressDelta:25},
  {msg:'💰 Müşteri ek bütçe onayladı!',          moralDelta:10, moneyDelta:8000, progressDelta:0},
  {msg:'🌟 Alice gece kritik sorunu çözdü!',     moralDelta:8,  moneyDelta:0,    progressDelta:35},
  {msg:'📣 Blog yazısı viral oldu!',             moralDelta:22, moneyDelta:0,    progressDelta:0},
  {msg:'🎵 Ofise müzik sistemi kuruldu!',        moralDelta:18, moneyDelta:0,    progressDelta:0},
  {msg:'🏆 Ekip ödül aldı! Prestij yükseldi.',  moralDelta:20, moneyDelta:5000, progressDelta:0},
]
const negativeEvents = [
  {msg:'🤧 Kritik dev hastalandı!',              moralDelta:-5,  moneyDelta:0,     progressDelta:-20},
  {msg:'⚡ Elektrik kesintisi! 2 saat kayıp.',   moralDelta:-10, moneyDelta:0,     progressDelta:-18},
  {msg:'📞 Müşteri sürpriz toplantı istedi!',    moralDelta:-5,  moneyDelta:0,     progressDelta:-28},
  {msg:'☕ Kahve makinesi bozuldu!',             moralDelta:-15, moneyDelta:0,     progressDelta:0},
  {msg:"🐛 Birisi prod'a test kodu push etti!", moralDelta:-12, moneyDelta:-2000, progressDelta:-10},
  {msg:'💤 Fazla mesai verim düşürdü.',          moralDelta:-10, moneyDelta:0,     progressDelta:-12},
  {msg:'🌧️ İstanbul\'da fırtına, ulaşım yok.', moralDelta:-8,  moneyDelta:0,     progressDelta:-15},
]

// ─── COMPUTED ───
const pendingRisks   = computed(() => activeRiskPool.value.filter(r=>r.status==='pending'))
const activeRisks    = computed(() => activeRiskPool.value.filter(r=>r.status==='active'))
const completedPct   = computed(() => Math.floor(project.progress/project.totalEffort*100))
const victoryScore   = computed(() => Math.floor(gs.money/100+project.deadline*500+gs.morale*100+stats.critSuccesses*1000))
const critChance     = computed(() => gs.morale >= 70 ? 15 : gs.morale >= 55 ? 5 : 0)
const bugChance      = computed(() => gs.morale < 40 ? 20 : gs.morale < 55 ? 8 : 0)
const moraleIcon     = computed(() => gs.morale > 70 ? '🔥' : gs.morale > 50 ? '😊' : gs.morale > 30 ? '😐' : '😰')

// Danger level drives vignette + color grading
const dangerLevel = computed(() => {
  let d = 0
  if (project.deadline <= 3)      d = Math.max(d, 1.0)
  else if (project.deadline <= 7) d = Math.max(d, 0.6)
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
  if (fx.bugEvent)        return 'saturate(0.5) brightness(0.85) hue-rotate(180deg)'
  if (dangerLevel.value > 0.7) return 'saturate(1.35) hue-rotate(6deg)'
  if (dangerLevel.value > 0.4) return 'saturate(1.15)'
  return 'none'
})

const tickerText = computed(() => {
  const messages = [
    'Küresel yapay zeka pazarı %340 büyüdü...',
    'Rakip şirket yeni ürün duyurdu...',
    'Bulut maliyetleri artmaya devam ediyor...',
    'Bir junior prod\'a yanlış push etti...',
    `Proje %${completedPct.value} tamamlandı, ${project.deadline} gün kaldı...`,
    `Ekip morali ${gs.morale > 60 ? 'yüksek! 🔥' : gs.morale > 35 ? 'normal 😊' : 'kritik düşüklükte! 😰'}`,
    `Bütçe: $${gs.money.toLocaleString()} — ${gs.money > 50000 ? 'Güvende 💰' : 'Dikkatli ol!'}`,
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

function updateMorale(d) {
  gs.morale = Math.max(0, Math.min(100, gs.morale + d))
}

function checkMilestones() {
  const p = completedPct.value
  for (const m of milestones) {
    if (!m.reached && p >= m.pct) {
      m.reached = true
      updateMoney(m.bonus)
      addLog(`🎯 %${m.pct} kilometre taşı! ${m.label}`, 'milestone')
      spawnParticles(window.innerWidth/2, window.innerHeight/2, 20, 'crit')
    }
  }
}

function checkGameEnd() {
  if (gs.money <= 0)                          { gameOverReason.value='Bütçe tükendi!';        gs.status='gameover'; return true }
  if (project.deadline <= 0)                  { gameOverReason.value='Süre doldu!';            gs.status='gameover'; return true }
  if (gs.morale <= 0)                         { gameOverReason.value='Ekip istifa etti!';      gs.status='gameover'; return true }
  if (project.progress >= project.totalEffort){ gs.status='victory'; return true }
  return false
}

// ─── PLAYER ACTIONS ───
function hireEmployee(id) {
  const e = employees.value.find(x=>x.id===id)
  if (!e || e.hired || gs.money < e.dailyCost) return
  e.hired = true; updateMoney(-e.dailyCost)
  addLog(`👤 ${e.name} (${e.role}) işe alındı`, 'hire')
  if (id === 8) {
    const r = allRisksPool.find(r=>r.id===13)
    if (r && !activeRiskPool.value.find(x=>x.id===13)) activeRiskPool.value.push(JSON.parse(JSON.stringify(r)))
  }
}

function fireEmployee(id) {
  const e = employees.value.find(x=>x.id===id)
  if (!e || !e.hired) return
  e.hired = false; e.energy = 100; e.overtime = false
  updateMorale(-12); addLog(`❌ ${e.name} işten çıkarıldı`, 'warning')
}

function setOvertime(id) {
  const e = employees.value.find(x=>x.id===id)
  if (!e || !e.hired) return
  e.overtime = !e.overtime
  addLog(`⏰ ${e.name} fazla mesai ${e.overtime?'açıldı':'kapatıldı'}`, 'info')
}

function buyUpgrade(uid) {
  const u = upgrades.value.find(x=>x.id===uid)
  if (!u || u.bought || gs.money < u.cost) return
  u.bought = true; updateMoney(-u.cost)
  addLog(`⚙️ Yükseltme: ${u.name}`, 'upgrade')
  if (uid==='cloud')  activeRiskPool.value.forEach(r=>{ if(r.type==='server') r.prob=Math.max(5,r.prob-30) })
  if (uid==='review') activeRiskPool.value.forEach(r=>{ if(r.type==='bug') r.prob=Math.max(5,r.prob-20) })
}

function handleRiskAction(riskId, actionType) {
  const risk = activeRiskPool.value.find(r=>r.id===riskId)
  if (!risk) return
  const a = {
    mitigate: ()=>{ updateMoney(-2000); risk.prob=Math.floor(risk.prob/2); risk.status='active'; addLog(`🛡️ [PM NOTU - Mitigate]: "${risk.name}" olasılığı yarıya indirildi (-$2k). Mantıklı bir savunma!`,'warning') },
    avoid:    ()=>{ updateMoney(-5000); risk.status='resolved'; addLog(`🛑 [PM NOTU - Avoid]: "${risk.name}" tamamen önlendi (-$5k). Plandaki değişiklikle riski kökünden çözdünüz.`,'success') },
    transfer: ()=>{ updateMoney(-3000); risk.cost=0; risk.moralDamage=0; risk.status='active'; addLog(`📄 [PM NOTU - Transfer]: "${risk.name}" aktarıldı (-$3k). Risk gerçekleşse bile hasar bize yansımayacak.`,'info') },
    accept:   ()=>{ risk.status='active'; addLog(`✅ [PM NOTU - Accept]: "${risk.name}" kabul edildi. Proaktif bütçe harcanmadı, ancak pasif olarak tetikteyiz.`,'info') },
  }
  a[actionType]?.()
}

// ─── DILEMMA SYSTEM ───
function tryTriggerDilemma() {
  if (gs.day < 3) return
  if (Math.random() > 0.22) return
  const resolved = new Set(eventLog.value.filter(e=>e.type==='dilemma').map(e=>e.dilemmaId))
  const available = allDilemmas.filter(d=>!resolved.has(d.id))
  if (!available.length) return
  const chosen = available[Math.floor(Math.random()*available.length)]
  currentDilemma.value = chosen
  showDilemma.value = true
}

function handleDilemmaChoice(opt) {
  if (!currentDilemma.value) return
  const choice = opt === 'a' ? currentDilemma.value.optA : currentDilemma.value.optB
  choice.effect()
  addLog(`❓ İkilem: "${currentDilemma.value.title}" → ${choice.text}`, 'dilemma')
  eventLog.value[0].dilemmaId = currentDilemma.value.id
  stats.dilemmasResolved++
  showDilemma.value = false
  currentDilemma.value = null
}

// ─── PROCESS NEXT DAY ───
async function handleNextDay(eventData) {
  // Spawn particles at button area
  spawnParticles(window.innerWidth/2, window.innerHeight - 120, 14, 'day')
  await processNextDay()
}

async function processNextDay() {
  if (isProcessing.value || gs.status !== 'playing') return
  isProcessing.value = true

  gs.day++; project.deadline--
  let dp = 10, dc = 0
  const ev = []

  // Upgrades
  const hasCopilot  = upgrades.value.find(u=>u.id==='copilot')?.bought
  const hasCicd     = upgrades.value.find(u=>u.id==='cicd')?.bought
  const hasCoffee   = upgrades.value.find(u=>u.id==='coffee')?.bought
  const hasErgo     = upgrades.value.find(u=>u.id==='ergonomic')?.bought
  const hasStandup  = upgrades.value.find(u=>u.id==='standup')?.bought

  if (hasCicd)    { dp += 20; ev.push({text:'⚙️ CI/CD: +20 ilerleme', type:'success'}) }
  if (hasCoffee)  { updateMorale(5);  ev.push({text:'☕ Espresso: +5 moral', type:'success'}) }
  if (hasStandup) { updateMorale(5);  ev.push({text:'📋 Standup: +5 moral', type:'success'}) }

  // Morale multiplier
  const mm = gs.morale >= 70 ? 1.2 : gs.morale >= 40 ? 1.0 : 0.75

  // Employee contributions
  employees.value.forEach(e => {
    if (!e.hired) return
    dc += e.dailyCost
    const energyDrain = (e.overtime ? 20 : 10) * (hasErgo ? 0.7 : 1)
    e.energy = Math.max(0, e.energy - energyDrain)
    const copilotB = (hasCopilot && ['Senior Dev','Frontend Dev','AI Müh.','Stajyer'].includes(e.role)) ? 15 : 0
    dp += Math.floor((e.productivity + copilotB) * (e.energy/100) * mm * (e.overtime?1.5:1))
    if (e.moralBonus > 0) updateMorale(e.moralBonus)
    if (e.id === 6) updateMorale(5)
    if (e.energy === 0) ev.push({text:`😴 ${e.name} tamamen tükendi!`, type:'warning'})
  })

  // Synergy bonus
  const syn = synergyBonus.value
  if (syn > 0) { dp += syn; ev.push({text:`🤝 Ekip sinerjisi: +${syn} puan`, type:'success'}) }

  // Base morale decay
  updateMorale(-3)

  // ── CRITICAL SUCCESS ── (morale > 70, 15% chance)
  lastCritSuccess.value = false
  if (gs.morale >= 70 && Math.random() < critChance.value/100) {
    dp = Math.floor(dp * 2)
    lastCritSuccess.value = true
    stats.critSuccesses++
    triggerFx('criticalSuccess', 2000)
    ev.push({text:'⭐ KRİTİK BAŞARI! İlerleme 2x!', type:'success'})
    addLog('⭐ KRİTİK BAŞARI!', 'milestone')
    spawnParticles(window.innerWidth/2, window.innerHeight/2, 24, 'crit')
  }

  // ── BUG EVENT ── (low morale)
  lastBugEvent.value = false
  if (!lastCritSuccess.value && bugChance.value > 0 && Math.random() < bugChance.value/100) {
    const bugLoss = Math.floor(dp * 0.35)
    dp -= bugLoss
    lastBugEvent.value = true
    stats.bugsFixed++
    triggerFx('bugEvent', 1800)
    triggerFx('glitch', 600)
    ev.push({text:`🐛 Moral düşük! Bug patlaması: -${bugLoss} puan`, type:'warning'})
    addLog('🐛 Bug patlaması! Moral düşük.', 'danger')
    spawnParticles(window.innerWidth/2, window.innerHeight/2, 12, 'bug')
  }

  // ── RANDOM EVENT ──
  if (Math.random() < 0.40) {
    const isPos = Math.random() < 0.5
    const pool = isPos ? positiveEvents : negativeEvents
    const re = pool[Math.floor(Math.random()*pool.length)]
    updateMorale(re.moralDelta)
    if (re.moneyDelta) updateMoney(re.moneyDelta)
    dp += re.progressDelta
    ev.push({text: re.msg, type: isPos ? 'event-good' : 'event-bad'})
    addLog(re.msg, isPos ? 'success' : 'warning')
  }

  // ── NEW RANDOM RISK ──
  if (gs.day >= 4 && Math.random() < 0.25) {
    const avail = allRisksPool.filter(r=>!activeRiskPool.value.find(ar=>ar.id===r.id))
    if (avail.length) {
      const nr = avail[Math.floor(Math.random()*avail.length)]
      activeRiskPool.value.push(JSON.parse(JSON.stringify(nr)))
      addLog(`⚠️ Yeni tehdit: "${nr.name}"`, 'warning')
      triggerFx('glitch', 400)
    }
  }

  // ── ACTIVE RISK TRIGGERS ──
  let trd = null
  for (const risk of activeRisks.value) {
    if (Math.random()*100 < risk.prob) { trd = risk; break }
  }

  lastDailyProgress.value = dp
  lastDailyCost.value = dc
  updateMoney(-dc)
  project.progress = Math.min(project.totalEffort, project.progress + Math.max(0, dp))
  checkMilestones()

  // Day advance glitch
  triggerFx('glitch', 500)

  daySummaryData.value = {
    day: gs.day, progress: dp, cost: dc, events: ev, morale: gs.morale,
    triggeredRisk: trd, critSuccess: lastCritSuccess.value, bugEvent: lastBugEvent.value,
    synergyBonus: syn,
  }
  showDaySummary.value = true
  isProcessing.value = false

  if (trd) {
    triggeredRisk.value = trd
    triggerFx('shake', 500)
    triggerFx('glitch', 700)
    if (trd.moralDamage) updateMorale(-trd.moralDamage)
    updateMoney(-trd.cost)
    project.deadline -= trd.delay
    trd.status = 'resolved'
    addLog(`🚨 RİSK TETİKLENDİ: "${trd.name}" -$${trd.cost.toLocaleString()}`, 'danger')
    spawnParticles(window.innerWidth/2, window.innerHeight/2, 16, 'bug')
  }

  checkGameEnd()
}

function closeDaySummary() {
  showDaySummary.value = false
  // Maybe trigger dilemma after summary
  setTimeout(tryTriggerDilemma, 300)
}

function closeModal() { triggeredRisk.value = null; checkGameEnd() }

function startGame() {
  gs.status = 'playing'
  activeRiskPool.value = [
    JSON.parse(JSON.stringify(allRisksPool[0])),
    JSON.parse(JSON.stringify(allRisksPool[1])),
    JSON.parse(JSON.stringify(allRisksPool[5])),
  ]
  addLog('🟢 Sistem başlatıldı. PROJECT: NEON aktif.', 'success')
}

function resetGame() {
  Object.assign(gs, {status:'menu',money:100000,day:1,morale:75})
  Object.assign(project, {progress:0,deadline:30})
  employees.value = defaultEmployees()
  upgrades.value = defaultUpgrades()
  activeRiskPool.value = []
  eventLog.value = []
  milestones.forEach(m=>m.reached=false)
  lastDailyProgress.value = 0; lastDailyCost.value = 0
  Object.assign(stats, {critSuccesses:0,bugsFixed:0,dilemmasResolved:0})
  lastCritSuccess.value = false; lastBugEvent.value = false
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
* { font-family:'Press Start 2P',monospace; box-sizing:border-box; image-rendering:pixelated; }

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
.pixel-title-bar       { background:#4a3018;border-bottom:3px solid #2a1008; }
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