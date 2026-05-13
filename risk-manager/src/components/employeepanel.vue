<template>
  <div :style="{
    background: employee.hired ? (theme?.empHiredBg||'#2a1e40') : (theme?.empIdleBg||'#4a2e14'),
    border: '3px solid ' + (employee.hired ? (theme?.empHiredBorder||'#8060c0') : (theme?.empIdleBorder||'#6a3c18')),
    boxShadow: '2px 2px 0 #0a0404',
    position: 'relative', overflow: 'hidden',
  }">
    <!-- Hired top bar -->
    <div v-if="employee.hired"
      style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#c080f0,transparent)">
    </div>

    <div style="padding:10px">
      <!-- Row 1: avatar + name + button -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <!-- Avatar — büyük -->
        <div :style="{
          width:'38px', height:'38px', flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'22px',
          background: employee.hired ? '#1e1030' : '#301808',
          border: '3px solid ' + (employee.hired ? '#7050b0' : '#4a2810'),
          boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.12), 2px 2px 0 #080404',
        }">{{ employee.icon }}</div>

        <!-- Name block -->
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px"
            :style="{color:theme?.empName||'#ffe4a0'}">
            {{ employee.name }}
          </div>
          <div :style="{fontSize:'8px',color:employee.hired?(theme?.empRoleHired||'#b080e0'):(theme?.empIdleBorder||'#9a7040'),marginTop:'1px',whiteSpace:'nowrap'}">
            {{ employee.role }}
          </div>
        </div>
      </div>

      <!-- Button row -->
      <div style="display:flex;gap:5px;margin-bottom:8px">
        <button v-if="!employee.hired"
          @click="$emit('hire', employee.id)"
          :disabled="!canAfford"
          :style="{
            fontFamily:'Press Start 2P,monospace', fontSize:'7px', padding:'6px 10px',
            flex:1,
          background: canAfford ? (props.theme?.btnHireBg||'#186010') : '#181410',
            color: canAfford ? (props.theme?.btnHireText||'#80e050') : '#403028',
            border: '3px solid ' + (canAfford ? '#0c3808' : '#100e08'),
            boxShadow: canAfford ? '0 3px 0 #081004' : 'none',
            cursor: canAfford ? 'pointer' : 'not-allowed',
          }">✔ İŞE AL (${{ employee.hiringCost.toLocaleString() }})</button>

        <template v-else>
          <button @click="$emit('overtime', employee.id)"
            :style="{
              fontFamily:'Press Start 2P,monospace', fontSize:'6px', padding:'5px 7px',
              flex:1,
              background: employee.overtime ? '#3a2004' : '#241a0c',
              color: employee.overtime ? '#f09830' : '#6a5030',
              border: '3px solid ' + (employee.overtime ? '#6a3808' : '#382a14'),
              boxShadow: '0 3px 0 #0a0804',
              cursor:'pointer',
            }" title="Fazla Mesai Aç/Kapat">
            ⏰ {{ employee.overtime ? 'MESAI: ON' : 'MESAI: OFF' }}
          </button>
          <button @click="$emit('fire', employee.id)"
            style="font-family:'Press Start 2P',monospace;font-size:6px;padding:5px 7px;background:#2c0808;color:#e06050;border:3px solid #4c1010;box-shadow:0 3px 0 #0c0404;cursor:pointer"
            title="İşten Çıkar">✕ ÇIKAR</button>
        </template>
      </div>

      <!-- Stat chips row -->
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">
        <div v-if="!employee.hired" style="font-size:6px;padding:4px 7px;background:#1a0808;border:2px solid #401010;color:#c06050">
          🎫 ${{ employee.hiringCost.toLocaleString() }}
        </div>
        <div style="font-size:6px;padding:4px 7px;background:#300a0a;border:2px solid #501818;"
          :style="{color:theme?.empSalary||'#e87060'}">
          💰 ${{ employee.dailyCost.toLocaleString() }}/g
        </div>
        <div style="font-size:6px;padding:4px 7px;background:#0a2808;border:2px solid #184810;"
          :style="{color:theme?.empProd||'#70d050'}">
          ⚡ +{{ employee.productivity }}
        </div>
        <div v-if="employee.overtime && employee.hired"
          style="font-size:6px;padding:4px 7px;background:#301a04;border:2px solid #503008;color:#f09830">
          ×1.25
        </div>
      </div>

      <!-- Desc -->
      <div class="body-text" style="color:#a88860;line-height:1.6;margin-bottom:10px;padding:8px;background:#1a0e06;border:2px solid #301808">
        {{ employee.desc }}
      </div>

      <!-- Energy bar (hired only) -->
      <div v-if="employee.hired">
        <div style="display:flex;justify-content:space-between;font-size:6px;margin-bottom:4px">
          <span style="color:#6a4a28">ENERJİ / MORAL</span>
          <span :style="{color:employee.energy<30?'#e06050':employee.energy<60?'#d0a030':'#70d050',fontWeight:'bold'}">
            {{ employee.energy }}%
          </span>
        </div>
        <div style="height:10px;background:#0c0604;border:2px solid #060402;box-shadow:inset 1px 1px 0 #040302">
          <div :style="{
            width: employee.energy+'%', height:'100%',
            background: employee.energy>60?(theme?.energyFull||'#48c038'):employee.energy>25?(theme?.energyMid||'#c0980a'):(theme?.energyLow||'#d03828'),
            transition:'width 0.5s steps(10)',
            position:'relative',
          }">
            <div style="position:absolute;top:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.25)"></div>
          </div>
        </div>
        <div v-if="employee.energy===0"
          style="font-size:6px;color:#e05050;margin-top:4px;text-align:center;background:#200808;border:2px solid #401010;padding:3px">
          ⚠ TAMAMEN TÜKENDİ!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ employee:Object, canAfford:Boolean, theme:Object })
defineEmits(['hire','fire','overtime'])
</script>