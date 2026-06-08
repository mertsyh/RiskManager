<template>
  <div class="fixed inset-0 z-[55] flex items-center justify-center bg-gray-900 bg-opacity-80 p-4">
    <div class="rp-panel modal-popin" :style="{ borderColor: theme.titleText }">

      <!-- Title bar -->
      <div class="rp-titlebar" :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
        <span>📋 RISK PLANNING — PROJECT KICKOFF</span>
        <span class="rp-steps">
          <span v-for="(s, i) in steps" :key="i" class="rp-dot" :class="{ 'rp-dot-on': i <= step }"></span>
        </span>
      </div>

      <!-- Conversation -->
      <div class="rp-body">
        <div class="rp-talk">
          <!-- PO avatar -->
          <div class="rp-avatar">
            <img :src="PO.sprite" class="rp-sprite" draggable="false" />
            <div class="rp-name">{{ PO.name }}</div>
            <div class="rp-role">{{ PO.role }}</div>
          </div>

          <!-- Speech bubble -->
          <div class="rp-bubble">
            <div class="rp-line">{{ current.type === 'results' ? resultLine : current.line }}</div>

            <!-- Intro: NEON spec card -->
            <div v-if="current.type === 'intro'" class="rp-brief">
              <div class="rp-brief-title">{{ NEON_PROJECT.name }} — {{ NEON_PROJECT.tagline }}</div>
              <div v-for="(b, i) in NEON_PROJECT.brief" :key="i" class="rp-brief-row">{{ b }}</div>
            </div>
          </div>
        </div>

        <!-- Answer controls -->
        <div class="rp-controls">

          <!-- INTRO -->
          <button v-if="current.type === 'intro'" class="rp-btn rp-btn-go" @click="next()">
            CONTINUE ▶
          </button>

          <!-- IDENTIFY: pick the real risks (multi-select) -->
          <template v-else-if="current.type === 'identify'">
            <div class="rp-risks">
              <button v-for="r in order" :key="r.id" class="rp-risk"
                :class="{ 'rp-risk-on': selected.has(r.id) }"
                @click="toggle(r.id)">
                <span class="rp-risk-ico">{{ r.icon }}</span>
                <span class="rp-risk-text">{{ r.text }}</span>
                <span class="rp-risk-check">{{ selected.has(r.id) ? '✓' : '+' }}</span>
              </button>
            </div>
            <button v-if="!confirmedIdentify" class="rp-btn rp-btn-go" @click="confirmIdentify()">
              CONFIRM {{ selected.size ? `(${selected.size})` : '' }} ▶
            </button>
            <button v-else class="rp-btn rp-btn-go" @click="next()">
              SEE RESULTS ▶
            </button>
          </template>

          <!-- RESULTS: scored recap -->
          <template v-else-if="current.type === 'results'">
            <div class="rp-result">
              <div class="rp-result-score">PLANNING SCORE <b>+{{ score.toLocaleString() }}</b>
                <span class="rp-result-sub">{{ correct.length }}/{{ realRisks.length }} real risks · +{{ pointsPerRisk }} each</span>
              </div>

              <div v-if="correct.length" class="rp-group">
                <div class="rp-group-head rp-good">✓ Correctly identified</div>
                <div v-for="r in correct" :key="r.id" class="rp-group-row">
                  <span class="rp-group-ico">{{ r.icon }}</span>
                  <span class="rp-group-text">{{ r.text }}</span>
                  <span class="rp-group-pts">+{{ pointsPerRisk }}</span>
                </div>
              </div>

              <div v-if="missed.length" class="rp-group">
                <div class="rp-group-head rp-warn">✗ Missed — you'll still meet these in play</div>
                <div v-for="r in missed" :key="r.id" class="rp-group-row">
                  <span class="rp-group-ico">{{ r.icon }}</span>
                  <span class="rp-group-text">{{ r.text }}</span>
                </div>
              </div>

              <div v-if="falsePicks.length" class="rp-group">
                <div class="rp-group-head rp-bad">⚠ Not a NEON risk — wrong kind of project</div>
                <div v-for="r in falsePicks" :key="r.id" class="rp-group-row rp-group-row-mute">
                  <span class="rp-group-ico">{{ r.icon }}</span>
                  <span class="rp-group-text">{{ r.text }} <i>— {{ r.why }}</i></span>
                </div>
              </div>
            </div>
            <button class="rp-btn rp-btn-go" @click="begin()">▶ BEGIN PROJECT</button>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({
  theme: { type: Object, default: () => ({}) },
  project: { type: Object, default: () => ({}) },
  // Score per genuine risk correctly identified (reward-correct-only model). Tunable.
  pointsPerRisk: { type: Number, default: 100 },
})
const emit = defineEmits(['begin'])

// Product Owner character. Sprite reused from public/ — swap freely.
const PO = {
  name: 'Deniz',
  role: 'Product Owner',
  sprite: import.meta.env.BASE_URL + 'employee2.png',
}

// ─── PROJECT: NEON — a concrete project so the risks make sense ───
const NEON_PROJECT = {
  name: 'NEON',
  tagline: 'a cloud payments & analytics platform',
  brief: [
    '💳 Processes customer payments in real time (mobile + web)',
    '🔌 Plugs into third-party payment & banking APIs',
    '🔒 Stores regulated personal & financial data (GDPR / PCI)',
    '💰 $100,000 budget · no hard deadline · small sharp team',
  ],
}

// Candidate risks: 6 genuine (one per game category → flags the matching Risk Radar bar),
// + 4 distractors from unrelated project domains. `type` only on the real ones.
const NEON_RISKS = [
  { id:'srv',    icon:'🔥', text:'Transaction database buckles under peak payment volume',      real:true,  type:'server',   why:'Uptime at peak load is make-or-break for payments.' },
  { id:'api',    icon:'🔌', text:'A third-party payment / banking API goes down or rate-limits us', real:true, type:'api',     why:'NEON depends on external payment & banking APIs.' },
  { id:'sec',    icon:'🔒', text:'Customer financial data is breached — GDPR / PCI fines',        real:true,  type:'security', why:'You store regulated financial data.' },
  { id:'scope',  icon:'📈', text:'Client keeps adding new payment features mid-build',           real:true,  type:'scope',    why:'Classic client-driven scope creep.' },
  { id:'bug',    icon:'🐛', text:'A critical bug slips into the settlement engine',              real:true,  type:'bug',      why:'Money-moving code with a bug is a top risk.' },
  { id:'team',   icon:'⚡', text:'A key engineer burns out or the team starts to clash',         real:true,  type:'conflict', why:'A small team under budget pressure is fragile.' },
  { id:'mfg',    icon:'🏭', text:'A raw-material shortage stalls the assembly line',             real:false,                  why:'NEON is software — there is no factory or assembly line.' },
  { id:'crop',   icon:'🌾', text:"A poor harvest cuts this season's crop yield",                 real:false,                  why:'An agriculture risk — unrelated to a payments app.' },
  { id:'retail', icon:'🏬', text:'Foot traffic drops at the physical retail stores',            real:false,                  why:'NEON has no brick-and-mortar storefronts.' },
  { id:'ship',   icon:'🚢', text:'Shipping containers stuck at port delay delivery',            real:false,                  why:'A digital product ships over the wire — no containers.' },
]

// Shuffle display order once, for replay variety.
const order = [...NEON_RISKS].sort(() => Math.random() - 0.5)

// ─── Conversation script ───
const steps = [
  {
    type: 'intro',
    line: `Welcome aboard — I'm Deniz, your Product Owner. Here's what we're building: PROJECT: NEON. No hard deadline, but every day burns cash and morale, so finish in as few days as you can. Before we touch a line of code — let's plan for what could go wrong.`,
  },
  {
    type: 'identify',
    line: `A junior drafted this list of "possible risks." Some genuinely threaten NEON — others are noise copied from completely different kinds of projects. Flag only the ones that actually threaten NEON.`,
  },
  {
    type: 'results',
  },
]

const step = ref(0)
const selected = reactive(new Set())
const confirmedIdentify = ref(false)

const current = computed(() => steps[step.value])

const realRisks = NEON_RISKS.filter(r => r.real)
const correct = computed(() => realRisks.filter(r => selected.has(r.id)))
const missed = computed(() => realRisks.filter(r => !selected.has(r.id)))
const falsePicks = computed(() => NEON_RISKS.filter(r => !r.real && selected.has(r.id)))
const score = computed(() => correct.value.length * props.pointsPerRisk)
const planCategories = computed(() => [...new Set(correct.value.map(r => r.type))])

const resultLine = computed(() => {
  const hit = correct.value.length
  const total = realRisks.length
  let line
  if (hit === total)      line = `Flawless read — you caught every real threat to NEON. That's a PO who's shipped before.`
  else if (hit >= total - 2 && hit > 0) line = `Solid read — you caught most of what can actually hurt NEON.`
  else if (hit > 0)       line = `A start — you spotted some, but real threats slipped by. They'll still show up in play.`
  else                    line = `None of the real ones flagged — no worries, you'll meet them in the field soon enough.`
  if (falsePicks.value.length) line += ` (The ${falsePicks.value.length} other-domain pick${falsePicks.value.length > 1 ? 's' : ''} you flagged ${falsePicks.value.length > 1 ? "aren't" : "isn't"} a NEON risk — wrong kind of project.)`
  return line
})

function toggle(id) {
  if (selected.has(id)) selected.delete(id)
  else selected.add(id)
}

function confirmIdentify() {
  confirmedIdentify.value = true
}

function next() {
  if (step.value < steps.length - 1) step.value++
}

function begin() {
  emit('begin', {
    categories: planCategories.value,
    score: score.value,
  })
}
</script>

<style scoped>
.rp-panel {
  width: 720px; max-width: 96vw; max-height: 94vh;
  background: #1a1008; border: 4px solid #3a2010;
  box-shadow: 6px 6px 0 #060302, inset 2px 2px 0 #2a1c0c;
  font-family: 'Share Tech Mono', monospace;
  display: flex; flex-direction: column; overflow: hidden;
}
.rp-titlebar {
  padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;
  font-size: 12px; letter-spacing: 1px; font-family: 'Press Start 2P', monospace;
  border-bottom: 3px solid #1a0c04;
}
.rp-steps { display: flex; gap: 6px; }
.rp-dot { width: 9px; height: 9px; background: #3a2810; border: 1px solid #1a0c04; }
.rp-dot-on { background: #f0c040; }

.rp-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }

.rp-talk { display: flex; gap: 14px; align-items: stretch; }
.rp-avatar {
  flex-shrink: 0; width: 110px; background: #0e0a04; border: 3px solid #301808;
  padding: 10px 6px; display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.rp-sprite { width: 64px; height: 64px; image-rendering: pixelated; }
.rp-name { font-family: 'Press Start 2P', monospace; font-size: 10px; color: #ffe4a0; text-align: center; }
.rp-role { font-size: 11px; color: #a07840; text-align: center; line-height: 1.2; }

.rp-bubble {
  flex: 1; position: relative; background: #0c0a06; border: 3px solid #4a3a1a;
  padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; min-height: 120px;
}
.rp-bubble::before {
  content: ''; position: absolute; left: -12px; top: 28px;
  border-top: 8px solid transparent; border-bottom: 8px solid transparent;
  border-right: 12px solid #4a3a1a;
}
.rp-line { font-size: 15px; color: #e8d4a8; line-height: 1.5; }

.rp-brief { background: #140e06; border: 2px solid #3a2c14; padding: 10px 12px; display: flex; flex-direction: column; gap: 5px; }
.rp-brief-title { font-family: 'Press Start 2P', monospace; font-size: 10px; color: #f0c040; letter-spacing: 1px; margin-bottom: 3px; }
.rp-brief-row { font-size: 13px; color: #c8b488; line-height: 1.35; }

.rp-controls { display: flex; flex-direction: column; gap: 12px; }

.rp-risks { display: flex; flex-direction: column; gap: 7px; }
.rp-risk {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px; cursor: pointer;
  background: #100a04; border: 2px solid #301808; color: #c8a878;
  font-family: 'Share Tech Mono', monospace; font-size: 13px; text-align: left;
  transition: filter 0.1s, transform 0.1s, border-color 0.15s;
}
.rp-risk:hover { filter: brightness(1.2); border-color: #5a3818; }
.rp-risk:active { transform: translateY(1px); }
.rp-risk-on { background: rgba(60,44,16,0.5); border-color: #b08840; box-shadow: 0 0 0 1px rgba(240,200,80,0.35); }
.rp-risk-ico { font-size: 17px; flex-shrink: 0; }
.rp-risk-text { flex: 1; line-height: 1.3; }
.rp-risk-check { font-family: 'Press Start 2P', monospace; font-size: 12px; color: #f0c040; flex-shrink: 0; }

.rp-result { background: #100a04; border: 3px solid #4a3a1a; padding: 12px 14px; display: flex; flex-direction: column; gap: 12px; }
.rp-result-score { font-family: 'Press Start 2P', monospace; font-size: 12px; color: #ffe4a0; letter-spacing: 1px; display: flex; flex-direction: column; gap: 5px; }
.rp-result-score b { color: #f0d060; font-size: 18px; }
.rp-result-sub { font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #a08850; letter-spacing: 0; }
.rp-group { display: flex; flex-direction: column; gap: 4px; }
.rp-group-head { font-size: 12px; letter-spacing: 0.5px; margin-bottom: 2px; }
.rp-good { color: #80e060; }
.rp-warn { color: #f0b040; }
.rp-bad { color: #e08060; }
.rp-group-row { display: flex; align-items: baseline; gap: 8px; font-size: 13px; color: #d8c098; line-height: 1.35; padding-left: 4px; }
.rp-group-row-mute { color: #9a8a6a; }
.rp-group-row-mute i { color: #7a6a4a; }
.rp-group-ico { flex-shrink: 0; }
.rp-group-text { flex: 1; }
.rp-group-pts { flex-shrink: 0; color: #80e060; font-size: 12px; }

.rp-btn {
  font-family: 'Press Start 2P', monospace; font-size: 13px; cursor: pointer;
  padding: 14px; letter-spacing: 2px; width: 100%;
  background: #1c5014; color: #d0f0a0; border: 4px solid #0c2c08; box-shadow: 0 5px 0 #081008;
  transition: filter 0.1s, transform 0.1s;
}
.rp-btn:hover { filter: brightness(1.15); }
.rp-btn:active { transform: translateY(5px); box-shadow: 0 0 0; }
.rp-btn:disabled { filter: grayscale(0.7) brightness(0.6); cursor: not-allowed; box-shadow: 0 5px 0 #081008; transform: none; }

.modal-popin { animation: popin 0.25s cubic-bezier(0.175,0.885,0.32,1.275); }
@keyframes popin { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
