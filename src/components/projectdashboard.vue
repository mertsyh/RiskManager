<template>
  <div style="flex:1;display:flex;flex-direction:row;gap:6px;min-height:0;overflow:hidden">

    <!-- ═══ OFFICE MAP (LEFT) ═══ -->
    <div class="office-panel" :style="{ backgroundColor: theme.panelBg, borderColor: theme.panelBorder }" style="flex:3;min-height:0;display:flex;flex-direction:column;">
      <div class="office-titlebar" :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
        <span style="font-size:12px;letter-spacing:2px">🏢 OFFICE — LIVE VIEW</span>
        <div style="display:flex;gap:10px;align-items:center">
          <span v-if="mitigationCount>0" style="font-size:12px;color:#80e060">🛡️ {{ mitigationCount }} MITIGATIONS</span>
          <span style="font-size:12px;">{{ hiredCount }}/8 ACTIVE</span>
          <button @click="$emit('openManage')" class="office-manage-btn">🏢 MANAGE</button>
        </div>
      </div>

      <!-- MAP CONTAINER -->
      <div ref="mapContainer" class="map-container">

        <!-- 1. Office background -->
        <img src="/ofisgorsel2.png" class="bg-img" draggable="false" />

        <!-- 2. Danger vignette -->
        <div v-if="dangerLevel>0.3" class="danger-vignette"
          :style="{opacity: Math.min(0.5, dangerLevel*0.55)}"></div>

        <!-- 3. CHARACTER SPRITES -->
        <div v-for="(desk, i) in DESKS" :key="i"
          class="desk-slot"
          :style="{ left: desk.x+'%', top: desk.y+'%', width: desk.w+'%' }">

          <template v-if="employees[i]?.hired">
            <div v-if="hasSynergyAt(i)" class="synergy-glow"></div>
            <div class="char-clickable" :class="{ 'char-low': employees[i].morale < 30 }"
                 @click="$emit('employeeClick', employees[i].id)"
                 :title="`${employees[i].name} · ${specName(employees[i])} · morale ${employees[i].morale}% — click to lift it`">
              <div v-if="employees[i].morale < 30" class="morale-alert">❗</div>
              <img
                :src="'/'+getSprite(i)"
                class="char-sprite"
                :class="{ 'sprite-tired': employees[i].morale < 25, 'sprite-overtime': employees[i].overtime }"
                draggable="false"
              />
              <Transition name="bubble">
                <div v-if="activeBubbles[i]" class="thought-bubble">{{ activeBubbles[i] }}</div>
              </Transition>
              <div class="char-hud">
                <div class="char-name">{{ employees[i].name }}</div>
                <div class="morale-track">
                  <div class="morale-fill"
                    :style="{
                      width: employees[i].morale+'%',
                      background: employees[i].morale>60?'#40e040':employees[i].morale>25?'#e0b030':'#e03030',
                    }"></div>
                </div>
                <div v-if="employees[i].overtime" class="overtime-badge">⏰</div>
              </div>
            </div>
          </template>

          <div v-else-if="employees[i]" class="empty-slot">
            <div class="empty-label">{{ employees[i].name }}<br><span style="color:#5a4028">HIRE</span></div>
          </div>
        </div>

        <!-- 4. Canvas overlay — synergy lines only -->
        <canvas ref="fxCanvas" class="fx-canvas"></canvas>

        <!-- 5. Critical / Bug event overlay text -->
        <Transition name="crit">
          <div v-if="lastCritSuccess" class="event-overlay crit-overlay">⭐ CRITICAL SUCCESS!</div>
        </Transition>
        <Transition name="crit">
          <div v-if="lastBugEvent" class="event-overlay bug-overlay">🐛 BUG OUTBREAK!</div>
        </Transition>
      </div>
    </div>

    <!-- ═══ RIGHT COLUMN: STATS & BUTTON ═══ -->
    <div style="flex:1; display:flex; flex-direction:column; gap:6px; min-width:360px; max-width:440px;">
      
      <!-- ═══ PROJECT STATS ═══ -->
      <div class="stats-panel" style="display:flex; flex-direction:column;">
      <div class="stats-titlebar">
        <span style="font-size:10px;color:#ffe4a0;letter-spacing:2px">PROJECT: NEON</span>
        <span :style="{fontSize:'12px',fontWeight:'bold',
          color:progressPercent>=75?'#60d060':progressPercent>=50?'#f0b040':'#80b0f0'}">
          {{ progressPercent }}%
        </span>
      </div>
      <div style="padding:10px; display:flex; flex-direction:column; justify-content:flex-start; gap:8px">

        <!-- ═══ DASHBOARD CONTROLS (SLOT) ═══ -->
        <div style="display:flex; flex-direction:column; gap:6px; flex-shrink:0;">
          <slot name="controls"></slot>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
        <!-- ═══ SCOPE — 3 deliverable tracks (ship when ALL reach 100%) ═══ -->
        <div>
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#b08050;margin-bottom:6px">
            <span>SCOPE — DELIVERABLES</span>
            <span style="color:#c8a060">{{ doneCount }}/{{ tracks.length }} SHIPPED</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:7px">
            <div v-for="t in tracks" :key="t.key" class="track-row">
              <div class="track-head">
                <span class="track-ico">{{ t.icon }}</span>
                <span class="track-name">{{ t.label }}</span>
                <span v-if="t.delta > 0" class="track-delta">+{{ t.delta }}</span>
                <span class="track-pct"
                  :style="{ color: t.pct>=100 ? '#60d060' : t.pct>=50 ? '#f0b040' : '#80b0f0' }">{{ t.pct }}%</span>
              </div>
              <div class="progress-track track-bar">
                <div class="progress-fill"
                  :style="{ width: t.pct+'%',
                    background: t.pct>=100 ? (T.progressHigh||'#48b838') : t.pct>=50 ? (T.progressMid||'#c0980a') : (T.progressLow||'#2868c8') }">
                  <div class="progress-shine"></div>
                </div>
                <div v-if="t.pct >= 100" class="track-done">✓ SHIPPED</div>
              </div>
            </div>
          </div>
          <!-- Overall milestone chips — money rewards as the WHOLE project crosses 25/50/75% -->
          <div style="display:flex;gap:4px;margin-top:8px">
            <div v-for="ms in milestones" :key="ms.pct" class="ms-chip"
              :style="{borderColor:ms.reached?(T.milestoneActive||'#a08820'):'#2a1c08',
                       color:ms.reached?(T.milestoneText||'#f0d060'):'#4a3818',
                       background:ms.reached?'#282000':'#140e04'}">
              {{ ms.reached ? ms.icon : '○' }} {{ ms.label }}
            </div>
          </div>
        </div>

        <!-- Stats grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px">
          <div class="stat-box">
            <div class="stat-label">DAILY<br>COST</div>
            <div class="stat-value" style="color:#e87060">-${{ dailyCost.toLocaleString() }}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">MORALE<br>MULT.</div>
            <div class="stat-value"
              :style="{color:morale>=60?'#58c848':morale>=35?'#c09820':'#e05858'}">
              {{ morale>=70?'×1.2':morale>=40?'×1.0':'×0.75' }}
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-label">CRIT<br>CHANCE</div>
            <div class="stat-value"
              :style="{color:critChance>10?'#ffe040':critChance>0?'#c0a020':'#3a3020'}">
              {{ critChance }}%
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-label">DAY</div>
            <div class="stat-value" style="color:#5888e0">
              {{ day }}
            </div>
          </div>
        </div>

        <!-- Daily progress row -->
        <div class="daily-row">
          <span style="font-size:13px;color:#6a4828;letter-spacing:1px">DAILY PROGRESS</span>
          <div style="display:flex;align-items:center;gap:8px">
            <span v-if="lastCritSuccess" class="badge-crit">⭐ 2×</span>
            <span v-if="lastBugEvent"    class="badge-bug">🐛 BUG</span>
            <span v-if="synergyBonus>0"  class="badge-syn">🤝 +{{ synergyBonus }}</span>
            <span style="font-size:18px;color:#58c840;font-weight:bold">
              +{{ Math.max(0,dailyProgress) }}
            </span>
          </div>
        </div>
        </div>
      </div>
    </div>



    <!-- ═══ RISK RADAR (predictive threat bars) ═══ -->
      <div class="radar-panel">
        <div class="radar-head">
          <span>🛡️ RISK RADAR</span>
          <span class="radar-sub">click a bar → mitigate</span>
        </div>
        <div class="radar-grid">
          <button v-for="(r, i) in radar" :key="r.key" class="radar-bar"
            :class="{ 'radar-hot': r.value >= 60, 'radar-planned': plannedSet.has(r.key) }"
            :title="`${r.label} threat ${r.value}/100${plannedSet.has(r.key) ? ' — flagged in your risk plan' : ''} — click to hire/upgrade`"
            @click="$emit('openManage', r.key)">
            <div class="radar-row1">
              <span class="radar-ico">{{ r.icon }}</span>
              <span class="radar-name">{{ r.label }}</span>
              <span v-if="plannedSet.has(r.key)" class="radar-plan-flag" title="Flagged in your risk plan">📋</span>
              <span v-if="i === 0 && r.value > 0" class="radar-next">▲ next?</span>
              <span class="radar-val" :style="{ color: r.tone }">{{ r.value }}</span>
            </div>
            <div class="radar-track"><span class="radar-fill" :style="{ width: r.value + '%', background: r.tone }"></span></div>
          </button>
        </div>
      </div>

    <!-- ═══ ADVANCE DAY BUTTON ═══ -->
      <button @click="$emit('nextDay',$event)" :disabled="processing"
        class="day-btn"
        :style="{
          color: processing ? '#504840' : (T.btnDayText||'#d0f0a0'),
          background: processing ? '#181410' : (T.btnDayBg||'#1c5014'),
          borderColor: processing ? '#100e08' : '#0c2c08',
          boxShadow: processing ? 'none' : '0 7px 0 #081008,inset 0 1px 0 rgba(255,255,255,0.15)',
          cursor: processing ? 'wait' : 'pointer',
        }"
      >{{ processing ? '⏳ PROCESSING' : '▶▶ NEXT DAY' }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps([
  'tracks','overallPct','morale','day','milestones','dailyProgress','dailyCost',
  'processing','employees','theme','synergyBonus','lastCritSuccess','lastBugEvent','reductionByType','threatByType','plannedCategories'
])
defineEmits(['nextDay','openManage','employeeClick'])

// ── RISK RADAR: kategori başına güncel tehdit çubukları (öngörü) ──
const RADAR_CATS = [
  { key:'bug',      icon:'🐛', label:'Bug',         color:'#e0a838' },
  { key:'server',   icon:'🔥', label:'Server',      color:'#e8702a' },
  { key:'security', icon:'🔒', label:'Security',    color:'#d05060' },
  { key:'scope',    icon:'📈', label:'Scope',       color:'#4fa050' },
  { key:'api',      icon:'🔌', label:'Integ.',      color:'#5890e0' },
  { key:'conflict', icon:'⚡', label:'Team',        color:'#b080e0' },
]
// Oyun başı risk planlamasında işaretlenen kategoriler — radar çubuğunda 📋 ile gösterilir.
const plannedSet = computed(() => new Set(props.plannedCategories || []))
const radar = computed(() => {
  const t = props.threatByType || {}
  return RADAR_CATS.map(c => {
    const value = Math.round(t[c.key] || 0)
    const tone = value >= 60 ? '#e05858' : value >= 33 ? '#e0b030' : '#58c848'
    return { ...c, value, tone }
  }).sort((a, b) => b.value - a.value)
})

const mapContainer = ref(null)
const fxCanvas     = ref(null)
const T = computed(() => props.theme || {})

const progressPercent = computed(() => Math.min(100, props.overallPct || 0))
const doneCount = computed(() => (props.tracks || []).filter(t => t.pct >= 100).length)
const hiredCount = computed(() =>
  props.employees?.filter(e=>e.hired).length || 0)
const mitigationCount = computed(() =>
  Object.values(props.reductionByType || {}).filter(v => v > 0).length)
const critChance = computed(() =>
  props.morale >= 70 ? 15 : props.morale >= 55 ? 5 : 0)
const dangerLevel = computed(() => {
  let d = 0
  if (props.morale < 30) d = Math.max(d, 0.7)
  return d
})

// ── SPRITE ASSIGNMENT ──
const SPRITES = ['employee1.png', 'employee2.png', 'employee3.png', 'employee4.png', 'employee5.png', 'a1.png', 'a2.png', 'a3.png']
function getSprite(idx) { return SPRITES[idx % SPRITES.length] }

// ── SCOPE SPECIALTY (tooltip label) ──
const SPEC_LABEL = { infra: '🏗️ Infra expert', security: '🔒 Security expert', product: '💳 Product expert' }
function specName(e) { return SPEC_LABEL[e?.specialty] || '🧩 Generalist' }

// ── DESK SLOT POSITIONS (fixed) ──
const DESKS = [
  { x: 33.8, y: 34.0, w: 23.0 },  // Alice
  { x: 3.1, y: 56.8, w: 22.0 },  // Bob
  { x: 39.9, y: 66.1, w: 22.0 },  // Charlie
  { x: 44.9, y: 42.3, w: 24.0 },  // Diana
  { x: 28.0, y: 73.0, w: 23.0 },  // Eve
  { x: 64.1, y: 50.9, w: 10.0 },  // Frank
  { x: 29.1, y: 45.3, w: 10.5 },  // Grace
  { x: 20.1, y: 66.4, w: 10.0 },  // Hank
]

// ── SYNERGY PAIRS (desk indices) ──
const SYNERGY_PAIRS = [[0,2],[1,7],[2,5],[3,0],[3,1],[3,2],[3,5],[5,6]]

function hasSynergyAt(idx) {
  const emps = props.employees || []
  return SYNERGY_PAIRS.some(([a,b]) => {
    if (a!==idx && b!==idx) return false
    const partner = emps[a===idx?b:a]
    return partner?.hired
  })
}

// ── THOUGHT BUBBLES ──
const BUBBLES = {
  tired:    ['😴','💤','🥱'],
  overtime: ['🔥','💦','😤'],
  happy:    ['😊','💡','✨','🎵','☕'],
  neutral:  ['💭','🤔','📝','⚙️'],
}
const activeBubbles = ref({})
let bubbleTimer = null

function tickBubbles() {
  const emps = props.employees || []
  // Clear a random existing bubble
  const keys = Object.keys(activeBubbles.value)
  if (keys.length > 0 && Math.random() < 0.45) {
    const nb = {...activeBubbles.value}
    delete nb[keys[Math.floor(Math.random()*keys.length)]]
    activeBubbles.value = nb
  }
  // Spawn on a hired employee
  const hired = emps.filter(e=>e.hired)
  if (!hired.length || Math.random() > 0.55) return
  const emp  = hired[Math.floor(Math.random()*hired.length)]
  const idx  = emps.indexOf(emp)
  let pool = BUBBLES.neutral
  if (emp.morale < 25)         pool = BUBBLES.tired
  else if (emp.overtime)        pool = BUBBLES.overtime
  else if (props.morale > 65)   pool = BUBBLES.happy
  activeBubbles.value = {
    ...activeBubbles.value,
    [idx]: pool[Math.floor(Math.random()*pool.length)],
  }
  setTimeout(() => {
    const nb = {...activeBubbles.value}; delete nb[idx]
    activeBubbles.value = nb
  }, 2600)
}

// ── CANVAS FX: animated synergy lines ──
let rafId = null

function drawFx() {
  const canvas = fxCanvas.value
  const container = mapContainer.value
  if (!canvas || !container) { rafId = requestAnimationFrame(drawFx); return }

  const W = container.clientWidth, H = container.clientHeight
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W; canvas.height = H
  }

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0,0,W,H)
  const emps = props.employees || []
  const now  = Date.now()

  SYNERGY_PAIRS.forEach(([ia,ib]) => {
    const ea = emps[ia], eb = emps[ib]
    if (!ea?.hired || !eb?.hired) return
    const da = DESKS[ia], db = DESKS[ib]
    if (!da||!db) return
    // Center of each sprite
    const ax = (da.x + da.w/2)/100*W
    const ay = (da.y + 6)/100*H
    const bx = (db.x + db.w/2)/100*W
    const by = (db.y + 6)/100*H
    const offset = (now/55)%14
    ctx.save()
    ctx.strokeStyle='rgba(96,208,192,0.5)'
    ctx.lineWidth=2
    ctx.setLineDash([5,5])
    ctx.lineDashOffset=-offset
    ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke()
    ctx.restore()
  })

  rafId = requestAnimationFrame(drawFx)
}

onMounted(() => {
  rafId = requestAnimationFrame(drawFx)
  bubbleTimer = setInterval(tickBubbles, 2200)
})
onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (bubbleTimer) clearInterval(bubbleTimer)
})
</script>

<style scoped>
/* ─── COORD PANEL ─── */
.coord-panel {
  position:absolute; top:8px; right:8px; z-index:20;
  background:rgba(10,6,2,0.88);
  border:2px solid #3a2010;
  padding:7px 9px;
  box-shadow:2px 2px 0 rgba(0,0,0,0.6);
  min-width:160px;
}
.desk-slot.dragging { cursor:grabbing !important; z-index:15; }
.desk-slot.dragging .char-sprite { filter:drop-shadow(0 6px 12px rgba(255,200,0,0.6)) brightness(1.1); }
.office-panel {
  background:#1a0e06;
  border:4px solid #0a0602;
  box-shadow:inset 2px 2px 0 #2a1808, 3px 3px 0 #060402;
  overflow:hidden;
  flex:1; min-height:0;
  display:flex; flex-direction:column;
}
.office-titlebar {
  background:#2a1408;border-bottom:3px solid #1a0804;
  padding:6px 12px;display:flex;justify-content:space-between;align-items:center;
  font-family:'Press Start 2P',monospace;
}
.office-manage-btn {
  font-family:'Press Start 2P',monospace;font-size:9px;cursor:pointer;
  padding:5px 8px;background:#4a6030;color:#c8e090;border:2px solid #2a3818;
  box-shadow:0 2px 0 #1a2010;transition:filter 0.1s,transform 0.1s;
}
.office-manage-btn:hover{filter:brightness(1.2)}
.office-manage-btn:active{transform:translateY(2px);box-shadow:0 0 0}
.stats-panel {
  background:#5a3818;border:4px solid #2a1208;
  box-shadow:inset 3px 3px 0 #7a5030,inset -3px -3px 0 #3a2010,3px 3px 0 #0a0402;
  overflow:hidden;flex-shrink:0;
}
.stats-titlebar {
  background:#2a1408;border-bottom:3px solid #1a0804;
  padding:6px 12px;display:flex;justify-content:space-between;
  font-family:'Press Start 2P',monospace;
}

/* ─── MAP ─── */
.map-container {
  position:relative; overflow:hidden; flex:1; min-height:0; background:#0a0604;
}
/* ─── ROOM BACKGROUNDS ─── */
.bg-img {
  position:absolute;inset:0;width:100%;height:100%;
  object-fit:contain;object-position:center center;
  image-rendering:pixelated;
  pointer-events:none;
}
.fx-canvas {
  position:absolute;inset:0;width:100%;height:100%;pointer-events:none;
}
.danger-vignette {
  position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(ellipse at center, transparent 35%, rgba(180,0,0,0.85) 100%);
}

/* ─── DESK SLOT ─── */
.desk-slot {
  position:absolute;
  display:flex;
  flex-direction:column;
  align-items:center;
  /* height driven by image aspect */
}

/* ─── CHARACTER SPRITE ─── */
.char-sprite {
  width:100%;
  image-rendering:pixelated;
  display:block;
  filter:drop-shadow(0 4px 6px rgba(0,0,0,0.6));
  transition:filter 0.4s;
}
.sprite-tired {
  filter:drop-shadow(0 4px 6px rgba(0,0,0,0.6)) saturate(0.5) brightness(0.8);
}
.sprite-overtime {
  filter:drop-shadow(0 4px 8px rgba(255,120,0,0.5)) brightness(1.1);
}

/* ─── SYNERGY GLOW ─── */
.synergy-glow {
  position:absolute;
  inset:-4px;
  border:2px solid rgba(96,208,192,0.45);
  animation:synPulse 1.8s ease-in-out infinite;
  pointer-events:none;
}
@keyframes synPulse {
  0%,100%{opacity:0.25;transform:scale(0.96)}
  50%    {opacity:0.7; transform:scale(1.03)}
}

/* ─── THOUGHT BUBBLE ─── */
.thought-bubble {
  position:absolute;
  top:-28px;
  left:55%;
  background:rgba(255,255,255,0.94);
  border:2px solid rgba(0,0,0,0.25);
  padding:3px 6px;
  font-size:14px;line-height:1;
  box-shadow:2px 2px 0 rgba(0,0,0,0.3);
  white-space:nowrap;
  z-index:10;
}
.thought-bubble::after {
  content:'';position:absolute;
  bottom:-6px;left:5px;
  width:6px;height:6px;
  background:rgba(255,255,255,0.94);
  border-right:2px solid rgba(0,0,0,0.25);
  border-bottom:2px solid rgba(0,0,0,0.25);
}
.bubble-enter-active{transition:all 0.25s ease}
.bubble-leave-active{transition:all 0.35s ease}
.bubble-enter-from{opacity:0;transform:translateY(5px) scale(0.8)}
.bubble-leave-to{opacity:0;transform:translateY(-8px) scale(0.9)}

/* ─── CLICKABLE CHARACTER (opens the morale popup) ─── */
.char-clickable {
  position:relative; width:100%;
  display:flex; flex-direction:column; align-items:center;
  cursor:pointer;
}
.char-clickable:hover .char-sprite {
  filter:drop-shadow(0 6px 10px rgba(255,200,0,0.55)) brightness(1.12);
}
.char-low .char-sprite { animation:lowMoraleShake 1.4s ease-in-out infinite; }
@keyframes lowMoraleShake {
  0%,100%{transform:translateX(0)}
  25%{transform:translateX(-1.5px)}
  75%{transform:translateX(1.5px)}
}
.morale-alert {
  position:absolute; top:-14px; right:8%; z-index:11;
  font-size:14px;
  animation:alertBounce 0.7s ease-in-out infinite;
}
@keyframes alertBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

/* ─── CHAR HUD (name + morale bar) ─── */
.char-hud {
  position:relative;
  display:flex;flex-direction:column;align-items:center;gap:2px;
  margin-top:2px; width:100%;
}
.char-name {
  font-family:'Press Start 2P',monospace;
  font-size:8px; color:#ffe4a0;
  background:rgba(10,6,2,0.85);
  border:1px solid rgba(90,48,24,0.8);
  padding:3px 6px;white-space:nowrap;
  text-shadow:1px 1px 0 #000;
}
.morale-track {
  width:80%;height:6px;
  background:rgba(0,0,0,0.6);
  border:1px solid rgba(0,0,0,0.8);
  overflow:hidden;
}
.morale-fill {
  height:100%;transition:width 0.5s steps(8);
}
.overtime-badge {
  position:absolute;top:-2px;right:0;
  font-size:10px;
  animation:flicker 0.35s step-end infinite alternate;
}
@keyframes flicker{0%{opacity:1}100%{opacity:0.55}}

/* ─── EMPTY SLOT ─── */
.empty-slot {
  width:100%;
  display:flex;align-items:center;justify-content:center;
  opacity:0.3;
}
.empty-label {
  font-family:'Press Start 2P',monospace;font-size:5px;
  color:#8a6040;text-align:center;line-height:2;
  border:1px dashed #4a3018;padding:4px 6px;
  background:rgba(0,0,0,0.3);
}

/* ─── EVENT OVERLAYS ─── */
.event-overlay {
  position:absolute;inset:0;pointer-events:none;
  display:flex;align-items:center;justify-content:center;
  font-family:'Press Start 2P',monospace;
  text-shadow:0 0 20px currentColor, 3px 3px 0 #000;
  animation:eventPop 1.8s ease-out forwards;
}
.crit-overlay { font-size:16px;color:#ffe040;background:rgba(255,200,0,0.06); }
.bug-overlay  { font-size:14px;color:#f04040;background:rgba(255,0,0,0.06); }
@keyframes eventPop {
  0%  {opacity:0;transform:scale(0.6)}
  20% {opacity:1;transform:scale(1.1)}
  70% {opacity:1}
  100%{opacity:0;transform:scale(1) translateY(-24px)}
}
.crit-enter-active,.crit-leave-active{transition:opacity 0.2s}
.crit-enter-from,.crit-leave-to{opacity:0}

/* ─── PROGRESS BAR ─── */
.progress-track {
  height:24px;background:#100804;border:3px solid #080402;
  position:relative;overflow:hidden;
}
.progress-fill {
  height:100%;transition:width 0.8s steps(20);position:relative;
}
.progress-shine {
  position:absolute;top:0;left:0;right:0;height:8px;background:rgba(255,255,255,0.18);
}
.progress-shimmer {
  position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);
  animation:shimmer 0.7s ease-out;
}
@keyframes shimmer{from{transform:translateX(-100%)}to{transform:translateX(200%)}}
.ms-tick{position:absolute;top:0;bottom:0;width:3px;transform:translateX(-50%)}
.progress-label{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;color:rgba(255,255,255,0.85);font-family:'Press Start 2P',monospace}
.ms-chip{flex:1;text-align:center;padding:7px 4px;border:2px solid;font-size:11px;font-family:'Press Start 2P',monospace}

/* ─── SCOPE TRACK BARS ─── */
.track-row{display:flex;flex-direction:column;gap:3px}
.track-head{display:flex;align-items:center;gap:6px;font-family:'Share Tech Mono',monospace}
.track-ico{font-size:14px;line-height:1}
.track-name{font-size:11px;color:#c8a878;letter-spacing:0.5px;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.track-delta{font-size:11px;color:#58c840;font-weight:bold}
.track-pct{font-size:12px;font-weight:bold;min-width:34px;text-align:right}
.track-bar{height:16px}
.track-done{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:9px;color:#0a2008;font-family:'Press Start 2P',monospace;letter-spacing:1px;text-shadow:0 1px 0 rgba(255,255,255,0.25)}

/* ─── STAT BOXES ─── */
.stat-box{background:#180c04;border:3px solid #301808;box-shadow:inset 2px 2px 0 #100802;padding:10px;text-align:center}
.stat-label{font-size:12px;color:#8a6438;margin-bottom:6px;line-height:1.5;letter-spacing:1px}
.stat-value{font-size:20px;font-family:'Press Start 2P',monospace}
.daily-row{background:#180c04;border:3px solid #301808;padding:10px 12px;display:flex;justify-content:space-between;align-items:center}

/* ─── BADGES ─── */
.badge-crit{font-size:11px;color:#ffe040;font-family:'Press Start 2P',monospace;animation:blinkanim 0.5s step-start 4}
.badge-bug {font-size:11px;color:#f04040;font-family:'Press Start 2P',monospace}
.badge-syn {font-size:11px;color:#60d0c0;font-family:'Press Start 2P',monospace}
@keyframes blinkanim{50%{opacity:0}}

/* ─── DAY BUTTON ─── */
.day-btn{font-family:'Press Start 2P',monospace;font-size:16px;padding:22px;border:4px solid;width:100%;letter-spacing:3px;flex-shrink:0;transition:transform 0.1s,box-shadow 0.1s}
.day-btn:hover:not(:disabled){filter:brightness(1.15)}
.day-btn:active:not(:disabled){transform:translateY(7px);box-shadow:none!important}

/* ─── RISK RADAR ─── */
.radar-panel{background:#1a0e06;border:4px solid #0a0602;box-shadow:inset 2px 2px 0 #2a1808,3px 3px 0 #060402;flex-shrink:0;padding:0}
.radar-head{background:#2a1408;border-bottom:3px solid #1a0804;padding:5px 10px;display:flex;justify-content:space-between;align-items:center;font-family:'Press Start 2P',monospace;font-size:9px;color:#ffe4a0;letter-spacing:1px}
.radar-sub{font-family:'Share Tech Mono',monospace;font-size:10px;color:#a07840;letter-spacing:0}
.radar-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:7px}
.radar-bar{background:#100a04;border:2px solid #301808;padding:5px 7px;cursor:pointer;text-align:left;display:flex;flex-direction:column;gap:4px;font-family:'Share Tech Mono',monospace;transition:filter 0.1s,transform 0.1s,border-color 0.2s}
.radar-bar:hover{filter:brightness(1.25);border-color:#5a3818}
.radar-bar:active{transform:translateY(2px)}
.radar-hot{border-color:#7a2020;box-shadow:0 0 8px rgba(224,80,80,0.35)}
.radar-planned{border-color:#b08840;box-shadow:inset 0 0 0 1px rgba(240,200,80,0.35)}
.radar-planned.radar-hot{border-color:#b08840;box-shadow:inset 0 0 0 1px rgba(240,200,80,0.4),0 0 8px rgba(224,80,80,0.35)}
.radar-plan-flag{font-size:10px;line-height:1}
.radar-row1{display:flex;align-items:center;gap:5px}
.radar-ico{font-size:13px;line-height:1}
.radar-name{font-size:11px;color:#c8a878;flex:1;letter-spacing:0.5px}
.radar-next{font-size:8px;color:#f08060;font-family:'Press Start 2P',monospace;white-space:nowrap}
.radar-val{font-size:12px;font-weight:bold}
.radar-track{height:7px;background:#080402;border:1px solid #000;overflow:hidden}
.radar-fill{display:block;height:100%;transition:width 0.5s steps(10),background 0.3s}
</style>