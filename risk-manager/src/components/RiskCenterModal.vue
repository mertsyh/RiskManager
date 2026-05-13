<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80 p-4">
    <div class="rc-panel">

      <!-- Header -->
      <div class="rc-header">
        <div class="flex items-center gap-2">
          <span class="text-xl">⚠️</span>
          <div>
            <div class="rc-header-sub">PMBOK · RİSK YÖNETİM MERKEZİ</div>
            <div class="rc-header-title">RİSK & OLAY MERKEZİ</div>
          </div>
        </div>
        <button @click="$emit('close')" class="rc-close-btn">✖</button>
      </div>

      <!-- PMBOK tip banner -->
      <div class="rc-pmbok-banner">
        💡 <strong>Risk Yönetim Planı:</strong> Her riski tanımla → Analiz et (Olasılık × Etki) → Yanıt planla → İzle. Bu ekran bir Risk Register'dır.
      </div>

      <!-- Tabs -->
      <div class="rc-tabs">
        <button v-for="tab in tabs" :key="tab.id"
                @click="activeTab = tab.id"
                class="rc-tab"
                :class="{ 'rc-tab-active': activeTab === tab.id }">
          <span>{{ tab.icon }}</span>
          {{ tab.label }}
          <span v-if="tab.id === 'threats' && pendingRisks.length" class="rc-badge">{{ pendingRisks.length }}</span>
        </button>
      </div>

      <!-- Content -->
      <div class="rc-content pixel-scrollbar">

        <!-- ── TAB 1: TEHDİT (Risk Cards) ── -->
        <div v-if="activeTab === 'threats'">
          <div class="rc-emv-portfolio">
            📊 Toplam Maruz Kalma: <strong>${{ portfolioEmv.toLocaleString() }}</strong> (Aktif EMV)
          </div>
          <div v-if="!sortedPendingRisks.length" class="rc-empty">
            <div class="text-4xl mb-3">✅</div>
            <div>Aktif tehdit yok</div>
            <div class="rc-empty-sub">Tüm riskler çözüldü veya henüz tetiklenmedi.</div>
          </div>
          <div class="flex flex-col gap-3">
            <template v-for="(risk, i) in sortedPendingRisks" :key="risk.id">
              <div v-if="i === 0 || priorityBand(risk) !== priorityBand(sortedPendingRisks[i-1])"
                   class="rc-priority-divider" :class="'prio-' + priorityBand(risk)">
                {{ priorityLabel(risk) }}
              </div>
              <RiskCard :risk="risk" :theme="theme" @action="(id, type) => $emit('action', id, type)" />
            </template>
          </div>
        </div>

        <!-- ── TAB 2: MATRİS (Qualitative Risk Matrix) ── -->
        <div v-if="activeTab === 'matrix'">
          <div class="matrix-intro">
            <span class="matrix-intro-icon">📊</span>
            <div>
              <div class="matrix-intro-title">Niteliksel Risk Analizi (Qualitative Risk Analysis)</div>
              <div class="matrix-intro-desc">Her risk, Olasılık ve Etki eksenlerinde konumlanır. Kırmızı = kritik önlem gerektirir. Bu matris, hangi riske önce müdahale edeceğini gösterir.</div>
            </div>
          </div>

          <div class="matrix-wrap">
            <!-- Y axis label -->
            <div class="matrix-y-label">← DÜŞÜK  ETKİ  YÜKSEK →</div>

            <div class="matrix-grid-area">
              <!-- X axis labels -->
              <div class="matrix-x-labels">
                <span>DÜŞÜK<br>OLASILIK</span>
                <span>ORTA<br>OLASILIK</span>
                <span>YÜKSEK<br>OLASILIK</span>
              </div>

              <!-- 3x3 matrix cells -->
              <div class="matrix-grid">
                <div v-for="cell in matrixCells" :key="cell.key"
                     class="matrix-cell"
                     :class="'matrix-cell-' + cell.color">
                  <div class="matrix-cell-label">{{ cell.label }}</div>
                  <div class="matrix-cell-risks">
                    <div v-for="r in cell.risks" :key="r.id" class="matrix-risk-chip"
                         :title="r.name + ' — Olasılık: %' + r.prob + ' | Etki: $' + (r.cost||0).toLocaleString()">
                      <span>{{ r.icon }}</span>
                      <span class="matrix-chip-name">{{ r.name }}</span>
                    </div>
                    <div v-if="!cell.risks.length" class="matrix-cell-empty">—</div>
                  </div>
                </div>
              </div>

              <!-- Legend -->
              <div class="matrix-legend">
                <div class="legend-item"><span class="legend-dot legend-red"></span> Kritik → Hemen Müdahale</div>
                <div class="legend-item"><span class="legend-dot legend-yellow"></span> Orta → Planla</div>
                <div class="legend-item"><span class="legend-dot legend-green"></span> Düşük → İzle</div>
              </div>
            </div>
          </div>

          <!-- Top risks by EMV -->
          <div class="emv-section">
            <div class="emv-title">📈 EMV Sıralaması (Beklenen Parasal Değer = Olasılık × Etki)</div>
            <div class="emv-list">
              <div v-for="(r, i) in topEmvRisks" :key="r.id" class="emv-row">
                <span class="emv-rank">#{{ i+1 }}</span>
                <span class="emv-icon">{{ r.icon }}</span>
                <span class="emv-name">{{ r.name }}</span>
                <span class="emv-val">${{ Math.round((r.prob/100)*r.cost).toLocaleString() }}</span>
                <span class="emv-formula">(%{{ r.prob }} × ${{ r.cost.toLocaleString() }})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── TAB 3: KAYIT (Risk Register) ── -->
        <div v-if="activeTab === 'register'">
          <div class="register-intro">
            <div class="register-intro-title">📋 Risk Kayıt Defteri (Risk Register)</div>
            <div class="register-intro-desc">PMBOK Kapsam: Risk Register, projenin tüm tanımlanan risklerini, analizlerini ve yanıt stratejilerini belgeleyen resmi dokümandır.</div>
          </div>

          <div class="register-table-wrap">
            <table class="register-table">
              <thead>
                <tr>
                  <th>Risk</th>
                  <th>Kategori</th>
                  <th>Seviye</th>
                  <th>Olasılık</th>
                  <th>Etki ($)</th>
                  <th>EMV</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="risk in allRisks" :key="risk.id"
                    :class="'register-row-' + risk.status">
                  <td class="register-name">
                    <span>{{ risk.icon }}</span> {{ risk.name }}
                  </td>
                  <td class="register-cat">{{ rbsCategory(risk.type) }}</td>
                  <td>
                    <span class="register-level" :class="'level-' + risk.level">
                      {{ levelLabel(risk.level) }}
                    </span>
                  </td>
                  <td class="register-prob">%{{ risk.prob }}</td>
                  <td class="register-cost">${{ (risk.cost||0).toLocaleString() }}</td>
                  <td class="register-emv">${{ Math.round((risk.prob/100)*(risk.cost||0)).toLocaleString() }}</td>
                  <td>
                    <span class="register-status" :class="'status-' + risk.status">
                      {{ statusLabel(risk.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="register-summary">
            <div class="rs-item">
              <div class="rs-val">{{ allRisks.length }}</div>
              <div class="rs-lbl">Toplam Risk</div>
            </div>
            <div class="rs-item">
              <div class="rs-val" style="color:#e86050">{{ allRisks.filter(r=>r.level==='high').length }}</div>
              <div class="rs-lbl">Kritik</div>
            </div>
            <div class="rs-item">
              <div class="rs-val" style="color:#58c848">${{ totalEmv.toLocaleString() }}</div>
              <div class="rs-lbl">Toplam EMV</div>
            </div>
            <div class="rs-item">
              <div class="rs-val" style="color:#80b0f0">{{ allRisks.filter(r=>r.status==='resolved').length }}</div>
              <div class="rs-lbl">Çözüldü</div>
            </div>
          </div>
        </div>

        <!-- ── TAB 4: GÜNLÜK (Event Log) ── -->
        <div v-if="activeTab === 'log'">
          <EventLog :events="eventLog" />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import RiskCard from './RiskCard.vue'
import EventLog from './EventLog.vue'

const props = defineProps({
  pendingRisks: Array,
  allRisks: Array,
  eventLog: Array,
  theme: Object
})
defineEmits(['close', 'action'])

const activeTab = ref('threats')

const tabs = [
  { id: 'threats',  icon: '⚠️', label: 'TEHDİT' },
  { id: 'matrix',   icon: '📊', label: 'MATRİS' },
  { id: 'register', icon: '📋', label: 'KAYIT' },
  { id: 'log',      icon: '📰', label: 'GÜNLÜK' },
]

const sortedPendingRisks = computed(() =>
  [...(props.pendingRisks || [])].sort((a, b) =>
    ((b.prob / 100) * (b.cost || 0)) - ((a.prob / 100) * (a.cost || 0))
  )
)
const portfolioEmv = computed(() =>
  (props.pendingRisks || []).reduce((s, r) => s + Math.round((r.prob / 100) * (r.cost || 0)), 0)
)
function priorityBand(risk) {
  const emv = (risk.prob / 100) * (risk.cost || 0)
  return emv > 5000 ? 'high' : emv > 2000 ? 'medium' : 'low'
}
function priorityLabel(risk) {
  return { high: '🔴 YÜKSEK ÖNCELİK', medium: '🟡 ORTA ÖNCELİK', low: '🟢 DÜŞÜK ÖNCELİK' }[priorityBand(risk)]
}

// ── Risk Matrix logic ──
// Prob: low <35, mid 35-65, high >65
// Impact: low <5000, mid 5000-15000, high >15000
function probBucket(r) {
  if (r.prob < 35) return 0
  if (r.prob < 65) return 1
  return 2
}
function impactBucket(r) {
  const c = r.cost || 0
  if (c < 5000) return 0
  if (c < 15000) return 1
  return 2
}

const CELL_COLORS = [
  ['green','yellow','yellow'],
  ['yellow','yellow','red'],
  ['yellow','red','red'],
]
const CELL_LABELS = [
  ['DÜŞÜK','ORTA','ORTA'],
  ['ORTA','ORTA','KRİTİK'],
  ['ORTA','KRİTİK','KRİTİK'],
]

const matrixCells = computed(() => {
  const cells = []
  for (let prob = 0; prob < 3; prob++) {
    for (let impact = 0; impact < 3; impact++) {
      const risks = (props.allRisks || []).filter(r =>
        r.status !== 'resolved' && probBucket(r) === prob && impactBucket(r) === impact
      )
      cells.push({
        key: `${prob}-${impact}`,
        color: CELL_COLORS[prob][impact],
        label: CELL_LABELS[prob][impact],
        risks,
      })
    }
  }
  return cells
})

const topEmvRisks = computed(() =>
  (props.allRisks || [])
    .filter(r => r.cost > 0 && r.status !== 'resolved')
    .map(r => ({ ...r, emv: Math.round((r.prob / 100) * r.cost) }))
    .sort((a, b) => b.emv - a.emv)
    .slice(0, 5)
)

const totalEmv = computed(() =>
  (props.allRisks || []).reduce((s, r) => s + Math.round((r.prob / 100) * (r.cost || 0)), 0)
)

// ── Register helpers ──
function rbsCategory(type) {
  return { server: '⚙️ Teknik', security: '🔒 Güvenlik', bug: '🐛 Kalite', api: '🔌 Dış', scope: '📈 Kapsam', conflict: '👥 İnsan' }[type] || '❓ Diğer'
}
function levelLabel(l) {
  return { high: 'KRİTİK', medium: 'ORTA', low: 'DÜŞÜK' }[l] || l
}
function statusLabel(s) {
  return { pending: 'Bekliyor', active: 'Aktif', resolved: 'Çözüldü' }[s] || s
}
</script>

<style scoped>
.rc-panel {
  width: 740px; max-height: 92vh;
  display: flex; flex-direction: column;
  background: #1a1008;
  border: 4px solid #3a2010;
  box-shadow: 6px 6px 0 #060302, inset 2px 2px 0 #2a1c0c;
  overflow: hidden;
}
.rc-header {
  background: #2a1408; border-bottom: 3px solid #1a0c04;
  padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;
}
.rc-header-sub { font-family:'Press Start 2P',monospace; font-size:6px; color:#5a4020; letter-spacing:2px; margin-bottom:4px; }
.rc-header-title { font-family:'Press Start 2P',monospace; font-size:11px; color:#ffe4a0; }
.rc-close-btn { font-size:18px; color:#7a5030; background:none; border:none; cursor:pointer; }
.rc-close-btn:hover { color:#e06040; }

.rc-pmbok-banner {
  background: #0c1820; border-bottom: 2px solid #1a3040;
  padding: 7px 14px;
  font-family:'Press Start 2P',monospace; font-size:6px; color:#5888a8; line-height:1.8;
}

.rc-tabs {
  display: flex; border-bottom: 3px solid #0a0602;
}
.rc-tab {
  flex: 1; padding: 10px 4px;
  font-family:'Press Start 2P',monospace; font-size:7px;
  background: #140c04; color: #5a4020; border: none; cursor: pointer;
  border-right: 2px solid #0a0602;
  display: flex; align-items: center; justify-content: center; gap: 4px;
  transition: background 0.1s;
  position: relative;
}
.rc-tab:hover { background: #1e1408; color: #8a6030; }
.rc-tab-active { background: #2a1808; color: #ffe4a0; border-bottom: 3px solid #f0b040; }
.rc-badge {
  background: #e04040; color: white; font-size: 6px;
  min-width: 14px; height: 14px; border-radius: 0;
  display: inline-flex; align-items: center; justify-content: center;
  border: 2px solid #601010; padding: 0 2px;
}

.rc-content {
  flex: 1; overflow-y: auto; padding: 12px; background: rgba(0,0,0,0.2);
}

.rc-empty { text-align:center; padding:40px 0; font-family:'Press Start 2P',monospace; font-size:10px; color:#5a4020; }
.rc-empty-sub { font-size:7px; color:#3a2810; margin-top:8px; line-height:2; }

.rc-emv-portfolio {
  background:#0a1420; border:2px solid #1a2840; border-left:4px solid #4080c0;
  padding:8px 12px; margin-bottom:10px;
  font-family:'Press Start 2P',monospace; font-size:7px; color:#5888a8; line-height:2;
}
.rc-emv-portfolio strong { color:#80b0f0; }

.rc-priority-divider {
  font-family:'Press Start 2P',monospace; font-size:7px;
  padding:5px 8px; border-bottom:2px solid; margin:8px 0 4px 0; letter-spacing:2px;
}
.prio-high   { color:#e06060; border-color:#501010; background:#1a0808; }
.prio-medium { color:#d0a040; border-color:#503010; background:#1a1008; }
.prio-low    { color:#60c060; border-color:#104810; background:#081408; }

/* ── MATRIX ── */
.matrix-intro {
  display: flex; gap: 10px; align-items: flex-start;
  background: #0a1420; border: 2px solid #1a2840; padding: 10px; margin-bottom: 12px;
}
.matrix-intro-icon { font-size: 24px; flex-shrink: 0; }
.matrix-intro-title { font-family:'Press Start 2P',monospace; font-size:8px; color:#80a0c0; margin-bottom:5px; }
.matrix-intro-desc { font-family:'Press Start 2P',monospace; font-size:6px; color:#4a6080; line-height:2; }

.matrix-wrap { display:flex; gap:8px; margin-bottom:12px; }
.matrix-y-label {
  font-family:'Press Start 2P',monospace; font-size:5px; color:#4a3820;
  writing-mode: vertical-rl; text-orientation: mixed;
  transform: rotate(180deg); letter-spacing:1px; text-align:center;
}
.matrix-grid-area { flex:1; }
.matrix-x-labels {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  margin-bottom:4px;
}
.matrix-x-labels span {
  font-family:'Press Start 2P',monospace; font-size:5px; color:#4a3820;
  text-align:center; line-height:1.8;
}
.matrix-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 3px;
}
.matrix-cell {
  min-height: 80px; padding: 6px; border: 2px solid;
  display: flex; flex-direction: column; gap: 4px;
}
.matrix-cell-red    { background:#200808; border-color:#501010; }
.matrix-cell-yellow { background:#201008; border-color:#503010; }
.matrix-cell-green  { background:#081408; border-color:#104810; }

.matrix-cell-label {
  font-family:'Press Start 2P',monospace; font-size:5px; text-align:center;
}
.matrix-cell-red    .matrix-cell-label { color:#e06060; }
.matrix-cell-yellow .matrix-cell-label { color:#d0a040; }
.matrix-cell-green  .matrix-cell-label { color:#60c060; }

.matrix-cell-risks { display:flex; flex-direction:column; gap:2px; flex:1; }
.matrix-risk-chip {
  display:flex; align-items:center; gap:3px;
  background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
  padding: 2px 4px; cursor:help;
}
.matrix-chip-name { font-family:'Press Start 2P',monospace; font-size:5px; color:#c0a070; line-height:1.5; }
.matrix-cell-empty { font-family:'Press Start 2P',monospace; font-size:6px; color:#2a1e10; text-align:center; margin:auto; }

.matrix-legend {
  display:flex; gap:12px; margin-top:8px; justify-content:center;
}
.legend-item { display:flex; align-items:center; gap:5px; font-family:'Press Start 2P',monospace; font-size:5px; color:#5a4020; }
.legend-dot { width:8px; height:8px; border:1px solid rgba(255,255,255,0.2); }
.legend-red    { background:#e06060; }
.legend-yellow { background:#d0a040; }
.legend-green  { background:#60c060; }

.emv-section {
  background:#0a1008; border:2px solid #1a2010; padding:10px;
}
.emv-title { font-family:'Press Start 2P',monospace; font-size:7px; color:#60a050; margin-bottom:8px; }
.emv-list { display:flex; flex-direction:column; gap:5px; }
.emv-row {
  display:flex; align-items:center; gap:8px;
  padding: 5px 8px; background:#0c1408; border:1px solid #1a2810;
}
.emv-rank { font-family:'Press Start 2P',monospace; font-size:6px; color:#3a5028; width:16px; }
.emv-icon { font-size:14px; }
.emv-name { font-family:'Press Start 2P',monospace; font-size:6px; color:#c0a060; flex:1; }
.emv-val  { font-family:'Press Start 2P',monospace; font-size:8px; color:#e06050; font-weight:bold; }
.emv-formula { font-family:'Press Start 2P',monospace; font-size:5px; color:#4a3820; }

/* ── REGISTER ── */
.register-intro {
  background:#0c1420; border:2px solid #1a2840; padding:10px; margin-bottom:10px;
}
.register-intro-title { font-family:'Press Start 2P',monospace; font-size:8px; color:#80a0c0; margin-bottom:5px; }
.register-intro-desc  { font-family:'Press Start 2P',monospace; font-size:6px; color:#4a6080; line-height:2; }

.register-table-wrap { overflow-x:auto; margin-bottom:10px; }
.register-table { width:100%; border-collapse:collapse; }
.register-table th {
  font-family:'Press Start 2P',monospace; font-size:6px; color:#5a4020;
  background:#1a0e04; border:1px solid #2a1808; padding:6px 8px; text-align:left; white-space:nowrap;
}
.register-table td {
  font-family:'Press Start 2P',monospace; font-size:6px; color:#a08060;
  border:1px solid #1a0e04; padding:5px 8px; vertical-align:middle;
}
.register-row-pending td { background:#160e06; }
.register-row-active  td { background:#1a0a0a; }
.register-row-resolved td { background:#080e08; opacity:0.6; }

.register-name { color:#c0a070!important; display:flex; align-items:center; gap:5px; white-space:nowrap; }
.register-cat  { color:#7080a0!important; white-space:nowrap; }
.register-prob { color:#c0a040!important; text-align:center; }
.register-cost { color:#e06050!important; }
.register-emv  { color:#60c080!important; font-weight:bold; }

.register-level {
  display:inline-block; padding:2px 5px; font-size:5px; border:1px solid;
}
.level-high   { color:#e06060; border-color:#501010; background:#200808; }
.level-medium { color:#d0a040; border-color:#503010; background:#201008; }
.level-low    { color:#60c060; border-color:#104810; background:#081408; }

.register-status {
  display:inline-block; padding:2px 5px; font-size:5px; border:1px solid;
}
.status-pending  { color:#c0a040; border-color:#503020; background:#1c1008; }
.status-active   { color:#e06060; border-color:#501010; background:#200808; }
.status-resolved { color:#60c060; border-color:#104810; background:#081408; }

.register-summary {
  display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:8px;
}
.rs-item {
  background:#140e06; border:2px solid #2a1808; padding:10px; text-align:center;
}
.rs-val { font-family:'Press Start 2P',monospace; font-size:16px; color:#c0a060; margin-bottom:5px; }
.rs-lbl { font-family:'Press Start 2P',monospace; font-size:6px; color:#4a3020; }
</style>
