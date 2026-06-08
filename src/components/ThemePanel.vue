<template>
  <div style="position:relative;display:inline-block">
    <!-- Trigger button -->
    <button @click="open=!open" :style="{
      fontFamily:'Press Start 2P,monospace', fontSize:'7px', padding:'5px 8px',
      background:'#241808', color:'#c8a060', border:'3px solid #402810',
      boxShadow:'0 3px 0 #0a0804', cursor:'pointer',
    }">🎨 TEMA</button>

    <!-- Panel overlay -->
    <Transition name="slide">
      <div v-if="open" style="position:fixed;top:44px;right:0;bottom:0;z-index:200;display:flex;pointer-events:all">
        <!-- Backdrop -->
        <div style="position:fixed;inset:0;background:rgba(0,0,0,0.55)" @click="open=false"></div>

        <!-- Panel -->
        <div style="position:relative;z-index:1;width:310px;margin-left:auto;background:#3a2010;border-left:4px solid #5a3018;box-shadow:-4px 0 0 #1a0804;display:flex;flex-direction:column;overflow:hidden">

          <!-- Header -->
          <div style="background:#2a1408;border-bottom:3px solid #1a0804;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
            <span style="font-size:8px;color:#ffe4a0;letter-spacing:2px">🎨 TEMA DÜZENLE</span>
            <button @click="open=false" style="font-family:'Press Start 2P',monospace;font-size:7px;padding:4px 7px;background:#3c0808;color:#f06050;border:2px solid #5a1010;cursor:pointer">✕</button>
          </div>

          <!-- Scrollable content -->
          <div style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:14px" class="theme-scrollbar">

            <!-- ARKA PLAN -->
            <div>
              <div class="sec-title">🌿 ARKA PLAN</div>
              <div class="sec-body">
                <ColorRow label="Çim / Zemin" :value="theme.bgGrass" @change="emit('update', 'bgGrass', $event)" />
              </div>
            </div>

            <!-- HUD -->
            <div>
              <div class="sec-title">📊 HUD ÇUBUĞU</div>
              <div class="sec-body">
                <ColorRow label="HUD Arka Plan"      :value="theme.hudBg"          @change="emit('update','hudBg',$event)" />
                <ColorRow label="Para chip arka"      :value="theme.chipGreen"      @change="emit('update','chipGreen',$event)" />
                <ColorRow label="Para chip yazı"      :value="theme.chipGreenText"  @change="emit('update','chipGreenText',$event)" />
                <ColorRow label="Moral chip arka"     :value="theme.chipYellow"     @change="emit('update','chipYellow',$event)" />
                <ColorRow label="Moral chip yazı"     :value="theme.chipYellowText" @change="emit('update','chipYellowText',$event)" />
                <ColorRow label="Gün chip arka"       :value="theme.chipBlue"       @change="emit('update','chipBlue',$event)" />
                <ColorRow label="Gün chip yazı"       :value="theme.chipBlueText"   @change="emit('update','chipBlueText',$event)" />
                <ColorRow label="Süre chip normal"    :value="theme.chipBrown"      @change="emit('update','chipBrown',$event)" />
                <ColorRow label="Süre chip kritik"    :value="theme.chipRed"        @change="emit('update','chipRed',$event)" />
              </div>
            </div>

            <!-- PANELLER -->
            <div>
              <div class="sec-title">🗂 PANELLER</div>
              <div class="sec-body">
                <ColorRow label="Panel arka"          :value="theme.panelBg"        @change="emit('update','panelBg',$event)" />
                <ColorRow label="Panel kenar"         :value="theme.panelBorder"    @change="emit('update','panelBorder',$event)" />
                <ColorRow label="Başlık bar arka"     :value="theme.titleBarBg"     @change="emit('update','titleBarBg',$event)" />
                <ColorRow label="Başlık yazı"         :value="theme.titleText"      @change="emit('update','titleText',$event)" />
                <ColorRow label="Aktif tab arka"      :value="theme.tabActiveBg"    @change="emit('update','tabActiveBg',$event)" />
                <ColorRow label="Aktif tab yazı"      :value="theme.tabActiveText"  @change="emit('update','tabActiveText',$event)" />
              </div>
            </div>

            <!-- ÇALIŞANLAR -->
            <div>
              <div class="sec-title">👥 ÇALIŞAN KARTLARI</div>
              <div class="sec-body">
                <ColorRow label="İşe alındı arka"    :value="theme.empHiredBg"     @change="emit('update','empHiredBg',$event)" />
                <ColorRow label="İşe alındı kenar"   :value="theme.empHiredBorder" @change="emit('update','empHiredBorder',$event)" />
                <ColorRow label="Boş kart arka"      :value="theme.empIdleBg"      @change="emit('update','empIdleBg',$event)" />
                <ColorRow label="Boş kart kenar"     :value="theme.empIdleBorder"  @change="emit('update','empIdleBorder',$event)" />
                <ColorRow label="İsim yazısı"        :value="theme.empName"        @change="emit('update','empName',$event)" />
                <ColorRow label="Rol yazısı"         :value="theme.empRoleHired"   @change="emit('update','empRoleHired',$event)" />
                <ColorRow label="Maaş chip"          :value="theme.empSalary"      @change="emit('update','empSalary',$event)" />
                <ColorRow label="Verim chip"         :value="theme.empProd"        @change="emit('update','empProd',$event)" />
                <ColorRow label="Enerji: dolu"       :value="theme.energyFull"     @change="emit('update','energyFull',$event)" />
                <ColorRow label="Enerji: orta"       :value="theme.energyMid"      @change="emit('update','energyMid',$event)" />
                <ColorRow label="Enerji: düşük"      :value="theme.energyLow"      @change="emit('update','energyLow',$event)" />
              </div>
            </div>

            <!-- RİSKLER -->
            <div>
              <div class="sec-title">⚠ RİSK KARTLARI</div>
              <div class="sec-body">
                <ColorRow label="Kritik arka"        :value="theme.riskHighBg"     @change="emit('update','riskHighBg',$event)" />
                <ColorRow label="Kritik kenar"       :value="theme.riskHighBorder" @change="emit('update','riskHighBorder',$event)" />
                <ColorRow label="Kritik vurgu"       :value="theme.riskHighAccent" @change="emit('update','riskHighAccent',$event)" />
                <ColorRow label="Orta arka"          :value="theme.riskMedBg"      @change="emit('update','riskMedBg',$event)" />
                <ColorRow label="Orta kenar"         :value="theme.riskMedBorder"  @change="emit('update','riskMedBorder',$event)" />
                <ColorRow label="Orta vurgu"         :value="theme.riskMedAccent"  @change="emit('update','riskMedAccent',$event)" />
                <ColorRow label="Düşük arka"         :value="theme.riskLowBg"      @change="emit('update','riskLowBg',$event)" />
                <ColorRow label="Düşük kenar"        :value="theme.riskLowBorder"  @change="emit('update','riskLowBorder',$event)" />
                <ColorRow label="Düşük vurgu"        :value="theme.riskLowAccent"  @change="emit('update','riskLowAccent',$event)" />
                <ColorRow label="Açıklama arka"      :value="theme.riskDescBg"     @change="emit('update','riskDescBg',$event)" />
                <ColorRow label="Açıklama yazı"      :value="theme.riskDescText"   @change="emit('update','riskDescText',$event)" />
              </div>
            </div>

            <!-- İLERLEME -->
            <div>
              <div class="sec-title">📈 İLERLEME ÇUBUĞU</div>
              <div class="sec-body">
                <ColorRow label="Çubuk arka"         :value="theme.progressBg"     @change="emit('update','progressBg',$event)" />
                <ColorRow label="Dolgu: başlangıç"   :value="theme.progressLow"    @change="emit('update','progressLow',$event)" />
                <ColorRow label="Dolgu: %50+"        :value="theme.progressMid"    @change="emit('update','progressMid',$event)" />
                <ColorRow label="Dolgu: %75+"        :value="theme.progressHigh"   @change="emit('update','progressHigh',$event)" />
                <ColorRow label="Milestone aktif"    :value="theme.milestoneActive" @change="emit('update','milestoneActive',$event)" />
                <ColorRow label="Milestone yazı"     :value="theme.milestoneText"  @change="emit('update','milestoneText',$event)" />
              </div>
            </div>

            <!-- BUTONLAR -->
            <div>
              <div class="sec-title">🕹 BUTONLAR</div>
              <div class="sec-body">
                <ColorRow label="Sonraki Gün arka"   :value="theme.btnDayBg"       @change="emit('update','btnDayBg',$event)" />
                <ColorRow label="Sonraki Gün yazı"   :value="theme.btnDayText"     @change="emit('update','btnDayText',$event)" />
                <ColorRow label="İşe Al arka"        :value="theme.btnHireBg"      @change="emit('update','btnHireBg',$event)" />
                <ColorRow label="İşe Al yazı"        :value="theme.btnHireText"    @change="emit('update','btnHireText',$event)" />
              </div>
            </div>

            <!-- HAZIR TEMALAR -->
            <div>
              <div class="sec-title">✨ HAZIR TEMALAR</div>
              <div style="display:flex;flex-direction:column;gap:5px">
                <button v-for="p in presets" :key="p.name" @click="applyPreset(p)"
                  :style="{fontFamily:'Press Start 2P,monospace',fontSize:'6px',padding:'8px 10px',
                    background:p.preview,borderColor:p.border,color:p.text,
                    border:'3px solid',cursor:'pointer',textAlign:'left',
                    boxShadow:'2px 2px 0 #0a0404'}"
                  @mouseenter="e=>e.target.style.filter='brightness(1.2)'"
                  @mouseleave="e=>e.target.style.filter=''">
                  {{ p.name }}
                </button>
              </div>
            </div>

            <!-- SIFIRLA -->
            <button @click="applyPreset({values:null})"
              style="font-family:'Press Start 2P',monospace;font-size:6px;padding:9px;background:#200808;color:#f06050;border:3px solid #401010;cursor:pointer;width:100%;box-shadow:0 3px 0 #0a0404">
              ↺ VARSAYILANA SIFIRLA
            </button>

          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ColorRow from './ThemeColorRow.vue'

const props = defineProps({ theme: Object })
const emit = defineEmits(['update'])
const open = ref(false)

const presets = [
  { name:'🌊 Derin Okyanus', preview:'#0a1828', border:'#1a4060', text:'#80d0ff',
    values:{ bgGrass:'#0a1020', hudBg:'#0a1828', chipGreen:'#103050', chipGreenText:'#60d0ff', chipYellow:'#102040', chipYellowText:'#80c0ff', chipBlue:'#081830', chipBlueText:'#40a0f0', chipBrown:'#0a1828', chipRed:'#301020', panelBg:'#0e2038', panelBorder:'#1a4060', titleBarBg:'#081428', titleText:'#80d0ff', tabActiveBg:'#102040', tabActiveText:'#c0e8ff', empHiredBg:'#0a1830', empHiredBorder:'#2060a0', empIdleBg:'#0e1c30', empIdleBorder:'#184060', empName:'#c0e8ff', empRoleHired:'#4090d0', empSalary:'#f08060', empProd:'#60d0ff', energyFull:'#30c0e0', energyMid:'#8090e0', energyLow:'#e04040', riskHighBg:'#200810', riskHighBorder:'#501020', riskHighAccent:'#f06080', riskMedBg:'#181420', riskMedBorder:'#303060', riskMedAccent:'#8080f0', riskLowBg:'#081828', riskLowBorder:'#1040a0', riskLowAccent:'#40a0f0', riskDescBg:'#060e18', riskDescText:'#90b8d8', progressBg:'#060e18', progressLow:'#2060c0', progressMid:'#4090e0', progressHigh:'#60d0ff', milestoneActive:'#80d0ff', milestoneText:'#c0e8ff', btnDayBg:'#102050', btnDayText:'#80d0ff', btnHireBg:'#082040', btnHireText:'#60c0ff' }},
  { name:'🌲 Orman Yeşili',  preview:'#0a1e0a', border:'#1a4818', text:'#a0e070',
    values:{ bgGrass:'#081408', hudBg:'#0c1e0c', chipGreen:'#0e2e0e', chipGreenText:'#80e050', chipYellow:'#1c2008', chipYellowText:'#c0d040', chipBlue:'#081c10', chipBlueText:'#50d090', chipBrown:'#101808', chipRed:'#281208', panelBg:'#102010', panelBorder:'#284818', titleBarBg:'#0a1808', titleText:'#a0f060', tabActiveBg:'#182e10', tabActiveText:'#c0f080', empHiredBg:'#0a2010', empHiredBorder:'#287828', empIdleBg:'#141e0c', empIdleBorder:'#243818', empName:'#d0f090', empRoleHired:'#70c050', empSalary:'#f09060', empProd:'#70e040', energyFull:'#40d030', energyMid:'#c0c020', energyLow:'#e04030', riskHighBg:'#200a08', riskHighBorder:'#502010', riskHighAccent:'#f07040', riskMedBg:'#1c1808', riskMedBorder:'#403010', riskMedAccent:'#d0b030', riskLowBg:'#081808', riskLowBorder:'#186018', riskLowAccent:'#50d050', riskDescBg:'#060e04', riskDescText:'#90b870', progressBg:'#060c04', progressLow:'#206820', progressMid:'#40a030', progressHigh:'#60d040', milestoneActive:'#90e060', milestoneText:'#c0f080', btnDayBg:'#144010', btnDayText:'#90e050', btnHireBg:'#103010', btnHireText:'#70d040' }},
  { name:'🌆 Şehir Işıkları', preview:'#0c0820', border:'#3020a0', text:'#e0c0ff',
    values:{ bgGrass:'#080610', hudBg:'#0c0820', chipGreen:'#100830', chipGreenText:'#d080ff', chipYellow:'#180820', chipYellowText:'#ff80c0', chipBlue:'#080c28', chipBlueText:'#80a0ff', chipBrown:'#0c0820', chipRed:'#280830', panelBg:'#100c28', panelBorder:'#3020a0', titleBarBg:'#080618', titleText:'#e0c0ff', tabActiveBg:'#1a1040', tabActiveText:'#f0d0ff', empHiredBg:'#100828', empHiredBorder:'#6030c0', empIdleBg:'#14102a', empIdleBorder:'#3020a0', empName:'#f0d0ff', empRoleHired:'#c080ff', empSalary:'#ff8080', empProd:'#80d0ff', energyFull:'#a060f0', energyMid:'#f060a0', energyLow:'#f04040', riskHighBg:'#200818', riskHighBorder:'#601030', riskHighAccent:'#ff6090', riskMedBg:'#180820', riskMedBorder:'#501050', riskMedAccent:'#e060e0', riskLowBg:'#080c28', riskLowBorder:'#202870', riskLowAccent:'#6080f0', riskDescBg:'#060410', riskDescText:'#b090d0', progressBg:'#060410', progressLow:'#402080', progressMid:'#8030c0', progressHigh:'#c040f0', milestoneActive:'#e0a0ff', milestoneText:'#f0d0ff', btnDayBg:'#1a0840', btnDayText:'#d080ff', btnHireBg:'#180830', btnHireText:'#b060f0' }},
  { name:'🔥 Cehennem Kırmızı', preview:'#1e0808', border:'#701010', text:'#ff9060',
    values:{ bgGrass:'#120404', hudBg:'#1e0808', chipGreen:'#281008', chipGreenText:'#ff8040', chipYellow:'#2a0c08', chipYellowText:'#ffa060', chipBlue:'#200808', chipBlueText:'#ff7050', chipBrown:'#1e0808', chipRed:'#380808', panelBg:'#221008', panelBorder:'#601010', titleBarBg:'#180808', titleText:'#ffa070', tabActiveBg:'#301008', tabActiveText:'#ffb080', empHiredBg:'#200c08', empHiredBorder:'#702010', empIdleBg:'#1c1008', empIdleBorder:'#501808', empName:'#ffc090', empRoleHired:'#ff8050', empSalary:'#ff6040', empProd:'#ff9050', energyFull:'#ff7030', energyMid:'#e05020', energyLow:'#c02010', riskHighBg:'#280808', riskHighBorder:'#701010', riskHighAccent:'#ff5040', riskMedBg:'#241008', riskMedBorder:'#603010', riskMedAccent:'#ff8030', riskLowBg:'#201408', riskLowBorder:'#504010', riskLowAccent:'#ffb030', riskDescBg:'#100604', riskDescText:'#d09060', progressBg:'#100604', progressLow:'#801020', progressMid:'#c02020', progressHigh:'#ff3020', milestoneActive:'#ff8040', milestoneText:'#ffa060', btnDayBg:'#601010', btnDayText:'#ffa070', btnHireBg:'#501008', btnHireText:'#ff8050' }},
]

const defaults = { bgGrass:'#2d5a1b', hudBg:'#4a3018', chipGreen:'#2a6020', chipGreenText:'#a0e080', chipYellow:'#605020', chipYellowText:'#f0d060', chipBlue:'#203060', chipBlueText:'#80b0f0', chipBrown:'#4a3018', chipRed:'#602020', panelBg:'#2a1808', panelBorder:'#1a0c04', titleBarBg:'#2a1408', titleText:'#ffe4a0', tabActiveBg:'#3a2010', tabActiveText:'#ffe4a0', empHiredBg:'#2a1e40', empHiredBorder:'#8060c0', empIdleBg:'#4a2e14', empIdleBorder:'#6a3c18', empName:'#ffe4a0', empRoleHired:'#b080e0', empSalary:'#e87060', empProd:'#70d050', energyFull:'#48c038', energyMid:'#c0980a', energyLow:'#d03828', riskHighBg:'#280c0c', riskHighBorder:'#602020', riskHighAccent:'#e86050', riskMedBg:'#241808', riskMedBorder:'#604018', riskMedAccent:'#d8a830', riskLowBg:'#0a1e0a', riskLowBorder:'#206020', riskLowAccent:'#58d058', riskDescBg:'#0c0a06', riskDescText:'#c0a878', progressBg:'#100804', progressLow:'#2868c8', progressMid:'#c0980a', progressHigh:'#48b838', milestoneActive:'#a08820', milestoneText:'#f0d060', btnDayBg:'#1c5014', btnDayText:'#d0f0a0', btnHireBg:'#186010', btnHireText:'#80e050' }

function applyPreset(p) {
  const vals = p.values || defaults
  Object.keys(vals).forEach(k => emit('update', k, vals[k]))
}
</script>

<style scoped>
.sec-title { font-size:6px;color:#ffe4a0;letter-spacing:2px;padding:5px 0;border-bottom:2px solid #3a1808;margin-bottom:6px; }
.sec-body  { display:flex;flex-direction:column;gap:4px; }

.theme-scrollbar::-webkit-scrollbar { width:6px; }
.theme-scrollbar::-webkit-scrollbar-track { background:#1a0804; }
.theme-scrollbar::-webkit-scrollbar-thumb { background:#5a3018;border:1px solid #3a1808; }

.slide-enter-active,.slide-leave-active { transition:transform 0.25s ease; }
.slide-enter-from,.slide-leave-to { transform:translateX(100%); }
</style>