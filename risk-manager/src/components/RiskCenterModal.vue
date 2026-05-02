<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-80 p-4">
    <div class="pixel-panel p-0 overflow-hidden w-[700px] max-h-[90vh] flex flex-col border-4 shadow-lg"
         :style="{ borderColor: theme.titleText, backgroundColor: theme.panelBg }">
      
      <!-- Header -->
      <div class="px-4 py-3 flex justify-between items-center"
           :style="{ backgroundColor: theme.titleBarBg, color: theme.titleText }">
        <div class="flex items-center gap-2">
          <span class="text-xl">⚠️</span>
          <span class="text-sm tracking-widest">RİSK & OLAY MERKEZİ</span>
        </div>
        <button @click="$emit('close')" class="hover:text-red-400 text-lg">✖</button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b-2" :style="{ borderColor: theme.titleBarBg }">
        <button v-for="tab in ['TEHDİT','GÜNLÜK']" :key="tab"
                @click="activeTab = tab"
                class="flex-1 py-3 text-xs transition-colors relative"
                :style="activeTab === tab ? { backgroundColor: theme.tabActiveBg, color: theme.tabActiveText } : { color: theme.riskDescText }">
          <span v-if="tab === 'TEHDİT' && pendingRisks.length" class="pixel-badge absolute top-1 right-1/4">
            {{ pendingRisks.length }}
          </span>
          {{ tab }}
        </button>
      </div>

      <!-- Content Area -->
      <div class="p-4 overflow-y-auto pixel-scrollbar flex-1 bg-black/20">
        <div v-if="activeTab === 'TEHDİT'" class="flex flex-col gap-3">
          <div v-if="!pendingRisks.length" class="text-center py-10" :style="{ color: theme.riskDescText }">
            <div class="text-4xl mb-4">✅</div>
            <div class="text-sm">Aktif tehdit yok</div>
          </div>
          <TransitionGroup name="list" tag="div" class="flex flex-col gap-3">
            <RiskCard v-for="risk in pendingRisks" :key="risk.id" :risk="risk" :theme="theme"
              @action="(id, type) => $emit('action', id, type)" />
          </TransitionGroup>
        </div>
        
        <div v-else class="flex flex-col gap-3">
          <EventLog :events="eventLog" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import RiskCard from './RiskCard.vue'
import EventLog from './EventLog.vue'

const props = defineProps({
  pendingRisks: Array,
  eventLog: Array,
  theme: Object
})

defineEmits(['close', 'action'])

const activeTab = ref('TEHDİT')
</script>
