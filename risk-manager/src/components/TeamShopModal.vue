<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80 p-4">
    <div class="pixel-panel p-0 overflow-hidden w-[700px] max-h-[90vh] flex flex-col border-4 shadow-lg"
         :style="{ borderColor: theme.titleText, backgroundColor: theme.panelBg }">
      
      <!-- Header -->
      <div class="px-4 py-3 flex justify-between items-center"
           :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
        <div class="flex items-center gap-2">
          <span class="text-xl">💼</span>
          <span class="text-sm tracking-widest">EKİP VE YÖNETİM MERKEZİ</span>
        </div>
        <button @click="$emit('close')" class="hover:text-red-400 text-lg">✖</button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b-2" :style="{ borderColor: theme.titleBarBg }">
        <button v-for="tab in ['EKİP','YÜKSELTME']" :key="tab"
                @click="activeTab = tab"
                class="flex-1 py-3 text-xs transition-colors"
                :style="activeTab === tab ? { backgroundColor: theme.tabActiveBg, color: theme.tabActiveText } : { color: theme.riskDescText }">
          {{ tab }}
        </button>
      </div>

      <!-- Content Area -->
      <div class="p-4 overflow-y-auto pixel-scrollbar flex-1 bg-black/20">
        <div v-if="activeTab === 'EKİP'" class="flex flex-col gap-3">
          <EmployeePanel v-for="emp in employees" :key="emp.id"
            :employee="emp" :canAfford="money >= emp.hiringCost" :theme="theme"
            :synergyPartners="getSynergyPartners(emp.id)"
            @hire="e => $emit('hire', e)"
            @fire="e => $emit('fire', e)"
            @overtime="e => $emit('overtime', e)" />
        </div>
        
        <div v-else class="flex flex-col gap-3">
          <UpgradeShop :upgrades="upgrades" :money="money" @buy="u => $emit('buy', u)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EmployeePanel from './EmployeePanel.vue'
import UpgradeShop from './UpgradeShop.vue'

const props = defineProps({
  employees: Array,
  upgrades: Array,
  money: Number,
  theme: Object,
  getSynergyPartners: Function
})

defineEmits(['close', 'hire', 'fire', 'overtime', 'buy'])

const activeTab = ref('EKİP')
</script>
