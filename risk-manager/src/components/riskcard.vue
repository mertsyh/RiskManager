<template>
  <div :style="{
    background: levelBg,
    border: '3px solid ' + levelBorder,
    boxShadow: '2px 2px 0 #0a0404',
    position: 'relative', overflow: 'hidden',
  }">
    <!-- Level accent bar (sol kenar) -->
    <div :style="{position:'absolute',left:0,top:0,bottom:0,width:'4px',background:levelAccent,boxShadow:'0 0 6px '+levelAccent}"></div>

    <div style="padding:10px 10px 10px 14px;display:flex;flex-direction:column;gap:7px">

      <!-- Header: icon + name + prob + RBS category -->
      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px">
        <div style="display:flex;align-items:center;gap:7px">
          <span style="font-size:20px;flex-shrink:0">{{ risk.icon }}</span>
          <div>
            <div style="font-size:7px;color:#ffe4a0;line-height:1.8">{{ risk.name }}</div>
            <div style="display:flex;gap:5px;align-items:center;margin-top:2px">
              <div :style="{fontSize:'6px',color:levelAccent,letterSpacing:'1px'}">{{ levelLabel }}</div>
              <div style="font-size:5px;color:#4a6080;padding:1px 4px;border:1px solid #1a2840;background:#080c18">{{ rbsCategory }}</div>
            </div>
          </div>
        </div>
        <!-- Prob badge -->
        <div :style="{
          fontSize:'8px', padding:'5px 8px', flexShrink:0,
          background:'#0c0804', border:'3px solid '+levelBorder,
          color:levelAccent, fontWeight:'bold',
          boxShadow:'inset 1px 1px 0 rgba(255,255,255,0.08)',
          textAlign:'center', minWidth:'46px',
        }">%{{ risk.prob }}</div>
      </div>

      <!-- Description — kendi arka planı var -->
      <div class="body-text" style="line-height:1.6;padding:8px 10px;border:2px solid #281e0c"
        :style="{background:theme?.riskDescBg||'#0c0a06',color:theme?.riskDescText||'#c0a878'}">
        {{ risk.desc }}
      </div>

      <!-- Impact chips -->
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        <div v-if="risk.cost>0"
          style="font-size:8px;padding:5px 8px;background:#240808;border:2px solid #441010;color:#f08060;white-space:nowrap"
          title="Potansiyel Maliyet Etkisi">
          💸 -${{ risk.cost.toLocaleString() }}
        </div>
        <div v-if="risk.cost>0"
          style="font-size:8px;padding:5px 8px;background:#1a2418;border:2px solid #284020;color:#80f0a0;white-space:nowrap"
          title="Beklenen Parasal Değer (EMV) = Olasılık x Etki. Kararlarınızı buna göre verin!">
          📊 EMV: ${{ Math.round((risk.prob/100)*risk.cost).toLocaleString() }}
        </div>
        <div v-if="risk.delay>0"
          style="font-size:8px;padding:5px 8px;background:#201804;border:2px solid #403010;color:#e0b040;white-space:nowrap">
          ⏳ -{{ risk.delay }} GÜN
        </div>
        <div v-if="risk.moralDamage"
          style="font-size:8px;padding:5px 8px;background:#180830;border:2px solid #301050;color:#c878f0;white-space:nowrap">
          😰 -{{ risk.moralDamage }} MORAL
        </div>
      </div>

      <!-- PM Strategy Hint -->
      <div style="font-size:6px;color:#4a7060;padding:5px 8px;border-left:3px solid #1a4030;background:#060e0a;line-height:1.8">
        💡 <strong style="color:#5a9070">PM İpuçu:</strong> {{ strategyHint }}
      </div>

      <!-- Action grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:2px">
        <button @click="$emit('action',risk.id,'mitigate')" class="rsk-btn rsk-yellow" title="AZALT (Mitigate): Riskin olasılığını veya etkisini kabul edilebilir seviyeye çeker. Maliyetlidir ancak riski hafifletir.">
          🛡️ AZALT <span style="font-size:5px;opacity:0.65">$2k</span>
        </button>
        <button @click="$emit('action',risk.id,'avoid')" class="rsk-btn rsk-red" title="KAÇIN (Avoid): Proje planını değiştirerek riski tamamen ortadan kaldırır. En pahalı ama en güvenli yöntemdir.">
          🛑 ÖNLEM <span style="font-size:5px;opacity:0.65">$5k</span>
        </button>
        <button @click="$emit('action',risk.id,'transfer')" class="rsk-btn rsk-blue" title="AKTAR (Transfer): Riskin sorumluluğunu 3. bir partiye (sigorta/taşeron) devreder. Finansal riski korur.">
          📄 TRANSFER <span style="font-size:5px;opacity:0.65">$3k</span>
        </button>
        <button @click="$emit('action',risk.id,'accept')" class="rsk-btn rsk-gray" title="KABUL ET (Accept): Hiçbir proaktif aksiyon alınmaz. Düşük EMV'li riskler için idealdir.">
          ✅ KABUL ET
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ risk:Object, theme:Object })
defineEmits(['action'])

const levelBg     = computed(()=>({high:props.theme?.riskHighBg||'#280c0c',medium:props.theme?.riskMedBg||'#241808',low:props.theme?.riskLowBg||'#0a1e0a'}[props.risk.level]))
const levelBorder = computed(()=>({high:props.theme?.riskHighBorder||'#602020',medium:props.theme?.riskMedBorder||'#604018',low:props.theme?.riskLowBorder||'#206020'}[props.risk.level]))
const levelAccent = computed(()=>({high:props.theme?.riskHighAccent||'#e86050',medium:props.theme?.riskMedAccent||'#d8a830',low:props.theme?.riskLowAccent||'#58d058'}[props.risk.level]))
const levelLabel  = computed(()=>({high:'⚠ KRİTİK RİSK',medium:'◆ ORTA RİSK',low:'• DÜŞÜK RİSK'}[props.risk.level]))

// RBS (Risk Breakdown Structure) kategorisi
const rbsCategory = computed(() => ({
  server:   '⚙️ Teknik / Altyapı',
  security: '🔒 Güvenlik',
  bug:      '🐛 Kalite',
  api:      '🔌 Dış Bağımlılık',
  scope:    '📈 Kapsam',
  conflict: '👥 İnsan Kaynakları',
}[props.risk.type] || '❓ Diğer'))

// Proaktif strateji önerisi
const strategyHint = computed(() => {
  const emv = (props.risk.prob / 100) * (props.risk.cost || 0)
  if (props.risk.level === 'high' && emv > 5000) return 'Yüksek EMV! Önlem ($5k) veya Transfer ($3k) stratejişi ile riski önceden bertaraf edin.'
  if (props.risk.type === 'server')   return 'Cloud Scaling yükseltmesi bu tür risklerin olasılığını %30 azaltır (Mitigate).'
  if (props.risk.type === 'security') return 'Eve (🔒 Güvenlik) işe alımı bu riski pasif azaltır. Transfer sigorta gibi çalışır.'
  if (props.risk.type === 'bug')      return 'Code Review ve Charlie (QA) işe alımı bug riskini mitigate eder. Düşük EMV ise Kabul Et.'
  if (props.risk.type === 'api')      return 'Transfer ideal: 3. parti riskini sigorta/taşerona devrederek maliô koruyun.'
  if (props.risk.type === 'scope')    return 'Kapsam risklerini Önlem ile çözün veya Change Request sürecine yönlendirin.'
  if (props.risk.type === 'conflict') return 'Diana (PM) işe alımı çatışma riskini pasif azaltır. Azalt stratejisi önerilir.'
  return 'EMV = %' + props.risk.prob + ' × $' + (props.risk.cost||0).toLocaleString() + ' = $' + Math.round(emv).toLocaleString() + '. Bu değeri baz alarak karar verin.'
})
</script>

<style scoped>
.rsk-btn {
  font-family:'Press Start 2P',monospace; font-size:6px;
  padding:7px 4px; border:3px solid; cursor:pointer;
  display:flex; align-items:center; justify-content:center; gap:3px;
  transition:filter 0.1s, transform 0.1s; box-shadow:0 3px 0;
  line-height:1;
}
.rsk-btn:hover  { filter:brightness(1.3); }
.rsk-btn:active { transform:translateY(3px); box-shadow:0 0 0; }

.rsk-yellow { background:#241a04; color:#d8a830; border-color:#483408; box-shadow:0 3px 0 #0c0a02; }
.rsk-red    { background:#240808; color:#e06050; border-color:#4c1010; box-shadow:0 3px 0 #0c0404; }
.rsk-blue   { background:#080e24; color:#5890e0; border-color:#10204c; box-shadow:0 3px 0 #02040c; }
.rsk-gray   { background:#14100a; color:#907860; border-color:#241c10; box-shadow:0 3px 0 #060402; }
</style>