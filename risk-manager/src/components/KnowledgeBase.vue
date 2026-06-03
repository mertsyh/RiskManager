<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900 bg-opacity-90 p-4">
    <div class="pixel-panel p-0 overflow-hidden w-[760px] max-h-[92vh] flex flex-col border-4 shadow-lg"
         :style="{ borderColor: theme.titleText, backgroundColor: theme.panelBg }">

      <!-- Header -->
      <div class="px-5 py-4 flex justify-between items-center"
           :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
        <div class="flex items-center gap-3">
          <span class="text-2xl">📚</span>
          <span class="kb-title">RISK MANAGEMENT KNOWLEDGE BASE (PMBOK®)</span>
        </div>
        <button @click="$emit('close')" class="hover:text-red-400 text-2xl">✖</button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b-2 flex-wrap" :style="{ borderColor: theme.titleBarBg }">
        <button v-for="tab in tabs" :key="tab.id"
                @click="activeTab = tab.id"
                class="flex-1 py-3 text-sm transition-colors"
                :style="activeTab === tab.id ? { backgroundColor: theme.tabActiveBg, color: theme.tabActiveText } : { color: theme.riskDescText }">
          {{ tab.name }}
        </button>
      </div>

      <!-- Content Area -->
      <div class="p-5 overflow-y-auto pixel-scrollbar flex-1 text-sm"
           style="line-height: 1.6;"
           :style="{ color: theme.riskDescText }">

        <!-- BASICS TAB -->
        <div v-if="activeTab === 'basics'" class="flex flex-col gap-4">
          <div class="p-4 bg-black/30 rounded border border-white/10">
            <h3 class="text-base mb-2" :style="{ color: theme.chipYellowText }">What is Project Risk Management?</h3>
            <p>A risk is an <strong>uncertain</strong> event or condition that, if it occurs, has a positive or negative effect on at least one project objective (time, cost, scope or quality).</p>
          </div>
          <div class="p-4 bg-black/30 rounded border border-white/10">
            <h3 class="text-base mb-2" :style="{ color: theme.chipYellowText }">The Iron Triangle</h3>
            <p class="mb-2">Every project balances 3 constraints. Change one and the others are affected:</p>
            <div class="grid grid-cols-3 gap-3 text-center">
              <div class="p-3 bg-black/40 rounded border border-yellow-900">
                <div class="text-2xl">📅</div>
                <div :style="{ color: theme.chipYellowText }">Time</div>
                <div class="text-xs mt-1">Deadline / Schedule</div>
              </div>
              <div class="p-3 bg-black/40 rounded border border-green-900">
                <div class="text-2xl">💰</div>
                <div :style="{ color: theme.chipGreenText }">Cost</div>
                <div class="text-xs mt-1">Budget / Resources</div>
              </div>
              <div class="p-3 bg-black/40 rounded border border-blue-900">
                <div class="text-2xl">🎯</div>
                <div :style="{ color: theme.chipBlueText }">Scope</div>
                <div class="text-xs mt-1">Features / Quality</div>
              </div>
            </div>
            <div class="mt-3 p-3 bg-yellow-900/20 border border-yellow-800/30 rounded text-xs">
              💡 <strong>In the game:</strong> Deadline (time), budget and morale are all reflections of this triangle.
            </div>
          </div>
          <div class="p-4 bg-black/30 rounded border border-white/10">
            <h3 class="text-base mb-2" :style="{ color: theme.chipYellowText }">Risk Management Processes (PMBOK)</h3>
            <ul class="list-none flex flex-col gap-2">
              <li class="flex gap-2"><span :style="{ color: theme.chipGreenText }">①</span> <div><strong>Identify:</strong> Determine which risks could affect the project → <em>a Risk Register is created</em></div></li>
              <li class="flex gap-2"><span :style="{ color: theme.chipGreenText }">②</span> <div><strong>Qualitative Analysis:</strong> Quick prioritization with a Probability/Impact matrix</div></li>
              <li class="flex gap-2"><span :style="{ color: theme.chipGreenText }">③</span> <div><strong>Quantitative Analysis:</strong> Numerical evaluation via EMV</div></li>
              <li class="flex gap-2"><span :style="{ color: theme.chipGreenText }">④</span> <div><strong>Response Planning:</strong> Avoid / Mitigate / Transfer / Accept</div></li>
              <li class="flex gap-2"><span :style="{ color: theme.chipGreenText }">⑤</span> <div><strong>Monitor &amp; Control:</strong> Continuous tracking throughout the project</div></li>
            </ul>
          </div>
        </div>

        <!-- CYCLE TAB -->
        <div v-if="activeTab === 'cycle'" class="flex flex-col gap-4">
          <div class="p-4 bg-black/30 rounded border border-white/10">
            <h3 class="text-base mb-2" :style="{ color: theme.chipYellowText }">The Project Risk Management Cycle</h3>
            <p>Risk management is not a one-off task — it is a <strong>continuous loop</strong>. You plan how to face risk, identify what could go wrong, assess and prioritise each risk, choose a strategy, monitor constantly, respond when risks fire, then evaluate and feed the lessons back into planning.</p>
            <div class="mt-2 p-3 bg-green-900/20 border border-green-800/30 rounded text-xs">
              🎮 <strong>In the game:</strong> the cycle bar under the HUD shows where you are. The kickoff runs Planning + Identification, each day runs Monitoring &amp; Control, and risk cards walk Assessment → Strategies → Response.
            </div>
          </div>

          <div v-for="(s, i) in cycleStages" :key="s.key"
               class="flex gap-3 items-start p-4 bg-black/30 rounded border border-white/10">
            <div class="text-3xl flex-shrink-0">{{ s.icon }}</div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="text-xs px-2 py-0.5 rounded" :style="{ backgroundColor: theme.chipBlue, color: theme.chipBlueText }">{{ i + 1 }} / 7</span>
                <h4 class="text-base" :style="{ color: theme.chipYellowText }">{{ s.label }}</h4>
              </div>
              <p class="text-sm mb-2">{{ s.blurb }}</p>
              <div class="p-2 bg-black/30 rounded text-sm" :style="{ borderLeft: '3px solid ' + (theme.chipBlueText || '#5890e0') }">
                🎮 {{ cycleGame[s.key] }}
              </div>
            </div>
          </div>

          <div class="p-4 bg-black/30 rounded border border-yellow-800/30 text-sm">
            🔄 <strong>The loop closes:</strong> Evaluation feeds back into Planning — every project (and every playthrough) should make you sharper at spotting the next one's risks.
          </div>
        </div>

        <!-- TUSLER TAB -->
        <div v-if="activeTab === 'tusler'" class="flex flex-col gap-4">
          <!-- Intro -->
          <div class="p-4 bg-black/30 rounded border border-white/10">
            <h3 class="text-base mb-2" :style="{ color: theme.chipYellowText }">Tusler's Animal Metaphor</h3>
            <p>Robert Tusler places every risk on a <strong>Probability × Impact</strong> matrix and maps it to one of four animals. Instead of abstract percentages, animals let stakeholders grasp a risk instantly — and each animal whispers the right response to take.</p>
            <div class="mt-2 p-3 bg-green-900/20 border border-green-800/30 rounded text-xs">
              🎮 <strong>In the game:</strong> every risk pop-up plots the risk as a dot on a live 2×2 Probability × Impact plane.
            </div>
          </div>

          <!-- 2×2 visual -->
          <div class="p-4 bg-black/30 rounded border border-white/10">
            <h3 class="text-base mb-3" :style="{ color: theme.chipYellowText }">The 2×2 Matrix</h3>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="key in TUSLER_GRID" :key="key" class="p-3 rounded text-center"
                   :style="{ border: '2px solid ' + TUSLER_ANIMALS[key].color, background: TUSLER_ANIMALS[key].color + '14' }">
                <div class="text-3xl">{{ TUSLER_ANIMALS[key].emoji }}</div>
                <div class="text-sm mt-1" :style="{ color: TUSLER_ANIMALS[key].color }">{{ TUSLER_ANIMALS[key].name }}</div>
                <div class="text-xs mt-1 text-gray-400">{{ TUSLER_ANIMALS[key].probBand }}<br>{{ TUSLER_ANIMALS[key].impactBand }}</div>
                <div class="text-xs mt-1" :style="{ color: TUSLER_ANIMALS[key].color }">→ {{ TUSLER_ANIMALS[key].reco }}</div>
              </div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-2 px-1">
              <span>← Horizontal axis: Probability →</span>
              <span>↕ Vertical axis: Impact</span>
            </div>
          </div>

          <!-- Animal → response detail cards -->
          <div v-for="key in tuslerOrder" :key="key"
               class="flex gap-3 items-start p-4 bg-black/30 rounded border border-white/10">
            <div class="text-4xl flex-shrink-0">{{ TUSLER_ANIMALS[key].emoji }}</div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1 flex-wrap gap-1">
                <h4 class="text-base" :style="{ color: TUSLER_ANIMALS[key].color }">{{ TUSLER_ANIMALS[key].name }}</h4>
                <span class="text-xs px-2 py-0.5 rounded" :style="{ backgroundColor: TUSLER_ANIMALS[key].color + '22', color: TUSLER_ANIMALS[key].color }">{{ TUSLER_ANIMALS[key].probBand }} × {{ TUSLER_ANIMALS[key].impactBand }}</span>
              </div>
              <p class="text-sm mb-2">{{ TUSLER_ANIMALS[key].rationale }}</p>
              <div class="p-2 bg-black/30 rounded text-sm" :style="{ borderLeft: '3px solid ' + TUSLER_ANIMALS[key].color }">
                <strong>Ideal Response (PMBOK):</strong> {{ RESPONSE_LABELS[TUSLER_ANIMALS[key].idealResponse] }}
              </div>
              <div class="mt-1 text-sm" :style="{ color: theme.chipGreenText }">💡 {{ TUSLER_ANIMALS[key].tip }}</div>
            </div>
          </div>

          <!-- Closing / teaching point + attribution -->
          <div class="p-4 bg-black/30 rounded border border-yellow-800/30">
            <div class="text-sm mb-2">🎮 <strong>The game's scoring:</strong> apply an animal's ideal response (🐯→Avoid, 🐊→Transfer, 🐶→Mitigate, 🐱→Accept) and you earn bonus points + a lesson. A wrong match has no penalty — just a gentle note explaining the correct move.</div>
            <div class="text-sm mb-2 p-2 bg-green-900/20 border border-green-800/30 rounded">💡 <strong>Important:</strong> most high-impact risks in this game are 🐊 Alligators — low probability but devastating. In real life the most dangerous risks are often the rare-looking ones; that is exactly why a <strong>Contingency Reserve</strong> exists.</div>
            <div class="text-xs text-gray-500">📚 Source: Robert Tusler's Risk Classification Scheme.</div>
          </div>
        </div>

        <!-- STRATEGIES TAB -->
        <div v-if="activeTab === 'strategies'" class="flex flex-col gap-4">
          <p class="p-3 bg-black/20 rounded">The <strong>4 PMBOK strategies</strong> against threats and their in-game costs:</p>

          <div v-for="s in strategies" :key="s.key"
               class="flex gap-3 items-start p-4 bg-black/30 rounded border border-white/10">
            <div class="text-3xl flex-shrink-0">{{ s.icon }}</div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <h4 class="text-base" :style="{ color: s.color }">{{ s.title }}</h4>
                <span class="text-xs px-2 py-0.5 rounded" :style="{ backgroundColor: s.color + '22', color: s.color }">{{ s.cost }}</span>
              </div>
              <p class="text-sm mb-2">{{ s.desc }}</p>
              <div class="p-2 bg-black/30 rounded text-sm" :style="{ borderLeft: '3px solid ' + s.color }">
                <strong>Example:</strong> {{ s.example }}
              </div>
              <div class="mt-1 text-sm" :style="{ color: theme.chipGreenText }">
                🎮 In the game: {{ s.game }}
              </div>
            </div>
          </div>

          <div class="p-4 bg-black/30 rounded border border-yellow-800/30">
            <h4 class="text-sm mb-2" :style="{ color: theme.chipYellowText }">⚠️ Strategies for Opportunities (Positive Risk)</h4>
            <ul class="list-disc pl-5 flex flex-col gap-1 text-sm">
              <li><strong>Exploit:</strong> Make sure the opportunity happens (e.g. add extra resources)</li>
              <li><strong>Enhance:</strong> Increase its probability/impact</li>
              <li><strong>Share:</strong> Capture it together with a partner</li>
            </ul>
            <div class="mt-2 text-sm">🎮 In the game: high morale → Critical Success = an Exploit strategy!</div>
          </div>
        </div>

        <!-- METRICS TAB -->
        <div v-if="activeTab === 'metrics'" class="flex flex-col gap-4">
          <div class="p-4 bg-black/30 rounded border border-white/10">
            <h3 class="text-base mb-2" :style="{ color: theme.chipYellowText }">EMV (Expected Monetary Value)</h3>
            <p class="mb-2">A statistical method used to compute the average cost of a risk.</p>
            <div class="p-3 bg-black/50 text-center border border-white/20 mb-3 font-bold" :style="{ color: theme.chipGreenText }">
              EMV = Risk Probability (%) × Risk Impact ($)
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 bg-red-900/30 border border-red-800/30 rounded">
                <div class="text-sm mb-1" :style="{ color: '#f08080' }">Scary-looking risk:</div>
                <div class="text-sm">Probability: 10% × Impact: $100,000</div>
                <div class="text-base mt-1 font-bold text-red-300">EMV = $10,000</div>
              </div>
              <div class="p-3 bg-yellow-900/30 border border-yellow-800/30 rounded">
                <div class="text-sm mb-1" :style="{ color: theme.chipYellowText }">Less harmful:</div>
                <div class="text-sm">Probability: 80% × Impact: $5,000</div>
                <div class="text-base mt-1 font-bold text-yellow-300">EMV = $4,000</div>
              </div>
            </div>
            <div class="mt-3 p-3 bg-green-900/20 border border-green-800/30 rounded text-sm">
              💡 <strong>In the game:</strong> every risk pop-up shows its EMV. Tackle high-EMV risks first!
            </div>
          </div>

          <div class="p-4 bg-black/30 rounded border border-white/10">
            <h3 class="text-base mb-2" :style="{ color: theme.chipYellowText }">EVM (Earned Value Management)</h3>
            <div class="grid grid-cols-3 gap-2 text-center text-sm">
              <div class="p-3 bg-black/40 rounded">
                <div class="font-bold text-blue-300">PV</div>
                <div>Planned Value</div>
                <div class="mt-1 text-gray-400">How much should be done by now?</div>
              </div>
              <div class="p-3 bg-black/40 rounded">
                <div class="font-bold text-green-300">EV</div>
                <div>Earned Value</div>
                <div class="mt-1 text-gray-400">How much is actually done?</div>
              </div>
              <div class="p-3 bg-black/40 rounded">
                <div class="font-bold text-red-300">AC</div>
                <div>Actual Cost</div>
                <div class="mt-1 text-gray-400">How much was spent?</div>
              </div>
            </div>
            <div class="mt-2 text-sm flex flex-col gap-1">
              <div>• <strong>SV (Schedule Variance):</strong> EV - PV → negative means behind schedule!</div>
              <div>• <strong>CV (Cost Variance):</strong> EV - AC → negative means over budget!</div>
            </div>
          </div>

          <div class="p-4 bg-black/30 rounded border border-white/10">
            <h3 class="text-base mb-2" :style="{ color: theme.chipYellowText }">Synergy Bonus Formula</h3>
            <p class="text-sm">Each synergy pair adds +8 progress/day. The right team combination creates exponential output.</p>
            <div class="mt-2 p-3 bg-black/40 rounded text-sm">
              <div class="mb-1 font-bold" :style="{ color: theme.chipYellowText }">In-game synergy pairs:</div>
              <div>🧑‍💻 Senior Dev + 🔍 QA → quality loop</div>
              <div>🔧 DevOps + 🔒 Security → infrastructure fortress</div>
              <div>📊 PM + whole team → coordination multiplier</div>
              <div>🎨 Frontend + 🤖 AI → speed x2</div>
            </div>
          </div>
        </div>

        <!-- GLOSSARY TAB -->
        <div v-if="activeTab === 'glossary'" class="flex flex-col gap-3">
          <div class="p-3 bg-black/20 rounded text-sm">
            📖 PMBOK® standard terms and how they map into the game:
          </div>
          <div v-for="term in glossary" :key="term.en"
               class="p-4 bg-black/30 rounded border border-white/10 flex gap-3">
            <div class="text-xl flex-shrink-0">{{ term.icon }}</div>
            <div>
              <div class="flex gap-2 items-baseline flex-wrap mb-1">
                <span class="text-sm font-bold" :style="{ color: theme.chipYellowText }">{{ term.en }}</span>
              </div>
              <div class="text-sm mb-1">{{ term.desc }}</div>
              <div v-if="term.game" class="text-sm px-2 py-1 rounded" style="background: rgba(0,100,200,0.15); border-left: 2px solid #4080c0;">
                🎮 {{ term.game }}
              </div>
            </div>
          </div>
        </div>

        <!-- REAL WORLD TAB -->
        <div v-if="activeTab === 'realworld'" class="flex flex-col gap-4">
          <div class="p-3 bg-black/20 rounded text-sm">
            🌍 Real-world PM cases the game mechanics are based on:
          </div>
          <div v-for="case_ in realCases" :key="case_.title"
               class="p-4 bg-black/30 rounded border border-white/10">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">{{ case_.icon }}</span>
              <div>
                <div class="text-sm font-bold" :style="{ color: theme.chipYellowText }">{{ case_.title }}</div>
                <div class="text-sm" style="color: #888;">{{ case_.company }} · {{ case_.year }}</div>
              </div>
            </div>
            <p class="text-sm mb-2">{{ case_.story }}</p>
            <div class="p-2 bg-red-900/20 border border-red-800/30 rounded text-sm mb-2">
              <strong style="color: #f08080;">Mistake:</strong> {{ case_.mistake }}
            </div>
            <div class="p-2 bg-green-900/20 border border-green-800/30 rounded text-sm mb-2">
              <strong :style="{ color: theme.chipGreenText }">Lesson:</strong> {{ case_.lesson }}
            </div>
            <div class="p-2 rounded text-sm" style="background: rgba(80,40,200,0.15); border-left: 2px solid #8060e0;">
              🎮 <strong>In the game:</strong> {{ case_.game }}
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { TUSLER_ANIMALS, TUSLER_GRID, RESPONSE_LABELS } from '../tusler.js'
import { CYCLE_STAGES } from '../cycle.js'

const props = defineProps({ theme: Object })
const emit = defineEmits(['close'])

// 7-stage risk management cycle (riskloop.png) → how each stage shows up in the game.
const cycleGame = {
  planning:       'The kickoff Risk Planning popup — pick a risk appetite (Cautious / Balanced / Aggressive).',
  identification: 'The kickoff Identification test — flag the risks you foresee. Right picks become known & cheaper.',
  assessment:     'Every risk card reads Probability × Impact and shows the EMV.',
  strategies:     'On the card you map the risk to a Tusler animal → Avoid / Transfer / Mitigate / Accept.',
  monitoring:     'The end-of-day Monitoring popup + Risk Radar — pre-empt a rising threat or keep building.',
  response:       'You execute the response: mitigate with budget, or take the chance.',
  evaluation:     'A short review at each milestone (and the Post-Mortem) — feeds lessons back into planning.',
}
const cycleStages = CYCLE_STAGES

const tabs = [
  { id: 'basics',     name: '📘 BASICS' },
  { id: 'cycle',      name: '🔄 CYCLE' },
  { id: 'tusler',     name: '🦁 TUSLER' },
  { id: 'strategies', name: '🛡️ STRATEGIES' },
  { id: 'metrics',    name: '📊 METRICS' },
  { id: 'glossary',   name: '📖 GLOSSARY' },
  { id: 'realworld',  name: '🌍 REAL WORLD' },
]
const activeTab = ref('basics')

// Tusler animal classification (from the shared module)
const tuslerOrder = ['tiger', 'alligator', 'puppy', 'kitten']

const strategies = [
  {
    key: 'avoid', icon: '🛑', title: 'Avoid',
    color: '#f08080', cost: 'Game: $5,000',
    desc: 'Change the project plan to eliminate the risk entirely. Its probability and impact drop to zero.',
    example: 'Remove a third-party library that has a security vulnerability from the project.',
    game: 'The risk becomes "resolved" and can no longer trigger. The most expensive but safest option.'
  },
  {
    key: 'mitigate', icon: '🛡️', title: 'Mitigate',
    color: '#d8a830', cost: 'Game: $2,000',
    desc: 'Reduce the probability or potential impact of a risk to an acceptable level.',
    example: 'Hire a QA engineer or add automated tests to counter bug risk.',
    game: 'The risk probability is halved. It can still trigger, but is less likely.'
  },
  {
    key: 'transfer', icon: '📄', title: 'Transfer',
    color: '#5890e0', cost: 'Game: $3,000',
    desc: 'Shift the financial impact and management responsibility of a risk to a third party.',
    example: 'Buy insurance for a server crash, or outsource DevOps.',
    game: 'Even if the risk happens, the cost/morale damage is zeroed out. The risk is still alive.'
  },
  {
    key: 'accept', icon: '✅', title: 'Accept',
    color: '#907860', cost: 'Game: Free',
    desc: 'Take no proactive action. A rational choice for low-EMV risks.',
    example: 'Deliberately ignore a low-probability, low-impact risk.',
    game: 'No money is spent, but the risk stays "active" and deals full damage if it triggers.'
  },
]

const glossary = [
  { icon: '📋', en: 'Risk Register', desc: 'The living document holding all identified risks, their probabilities, impacts and response plans.', game: 'The threat list in the game is your Risk Register.' },
  { icon: '🗺️', en: 'Risk Matrix', desc: 'A 2D grid categorizing risks as High/Medium/Low. A qualitative analysis tool.', game: 'The Critical/Moderate/Minor color codes on risk cards come from this matrix.' },
  { icon: '💰', en: 'Contingency Reserve', desc: 'A pre-approved budget buffer set aside for known risks. Sized against total EMV.', game: 'Your starting budget ($100k) hides a contingency reserve. Manage it well!' },
  { icon: '📈', en: 'Scope Creep', desc: 'The gradual, unapproved expansion of project scope. The #1 cause of IT project failure.', game: 'The "Scope Creep" risk pushes your deadline — classify and respond to protect the baseline.' },
  { icon: '⏰', en: 'Crashing', desc: 'Compressing the schedule by adding extra cost (overtime, resources). Shortens time, raises cost.', game: 'Working overtime = crashing. Speed rises but each teammate’s morale falls — lift it back up from their morale popup.' },
  { icon: '📉', en: 'Technical Debt', desc: 'Trading code quality for short-term speed. It returns later as maintenance cost and bug risk.', game: 'The "Technical Debt" risk card raises the bug probability.' },
  { icon: '🎯', en: 'Baseline', desc: 'The approved project plan (scope, schedule, budget). Changes are measured against it.', game: '30 days / $100k / 3000 effort is your baseline.' },
  { icon: '🔄', en: 'Lessons Learned', desc: 'The retrospective done at project Closing. Feeds future projects.', game: 'The Post-Mortem screen at the end of the game is your Lessons Learned.' },
  { icon: '🤝', en: 'Stakeholder', desc: 'Anyone affected by or affecting the project. Client, team, management, vendors, etc.', game: 'The client (scope creep), team (morale) and investor (budget) are your stakeholders.' },
  { icon: '🔀', en: 'Change Control', desc: 'Running requested changes to scope/schedule through a formal process.', game: 'Responding deliberately to a risk instead of ignoring it is applying change control.' },
]

const realCases = [
  {
    icon: '🚀', title: 'Mars Climate Orbiter Disaster',
    company: 'NASA / Lockheed Martin', year: '1999',
    story: 'A $327 million spacecraft burned up in the Martian atmosphere because one team used metric (newtons) and the other imperial (pounds) units, and nobody noticed.',
    mistake: 'The integration risk was never identified. There was no communication plan between the two teams (Risk: "Third Party Integration").',
    lesson: 'In project management an "Assumption Log" is critical. Is every team using the same units?',
    game: 'The "Third Party Down" and "Security Hole" risks simulate similar integration failures.'
  },
  {
    icon: '🏦', title: 'Knight Capital Flash Crash',
    company: 'Knight Capital Group', year: '2012',
    story: 'During a software update an old algorithm was accidentally deployed to production. In 45 minutes the firm lost $440 million and nearly went bankrupt.',
    mistake: 'Change control was not applied. There was no rollback plan. The deployment risk had been "accepted".',
    lesson: 'The "intern pushed to prod" scenario is exactly this! Investing in a CI/CD pipeline and code review prevents such disasters.',
    game: 'The "Intern Mistake" and "Critical Bug" risks were inspired by this case.'
  },
  {
    icon: '🏗️', title: 'Denver Airport Baggage System',
    company: 'Denver International Airport', year: '1995',
    story: 'The automated baggage system opened 2 years late. Scope kept expanding (scope creep), costs exceeded $3.2 billion, and accumulated technical debt made the system unusable.',
    mistake: 'There was no change control process. Every "small" extra request was accepted. Nobody accepted or transferred the risk.',
    lesson: 'Saying "yes" to scope creep automatically breaks the time/cost triangle. A formal change request is mandatory.',
    game: 'The "Scope Creep" and "Technical Debt" risks are derived from this scenario.'
  },
  {
    icon: '🎮', title: 'Cyberpunk 2077 Early Launch',
    company: 'CD Projekt Red', year: '2020',
    story: 'Under management pressure an early release was decided. The team burned out, technical debt piled up. On launch day it was pulled from the PlayStation Store and $51M was refunded.',
    mistake: 'Crashing was applied while ignoring team morale. The bug risk was neither transferred nor accepted — it was "ignored".',
    lesson: 'Falling morale is not just sadness; it is a measurable risk factor that directly raises bug probability.',
    game: 'The low morale → Bug Outbreak mechanic models exactly this relationship. Keep morale high!'
  },
]
</script>

<style scoped>
.kb-title { font-size: 14px; letter-spacing: 2px; font-family: 'Press Start 2P', monospace; }
</style>
