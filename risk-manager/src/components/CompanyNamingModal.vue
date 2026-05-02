<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0" style="background:rgba(0,0,0,0.85)"></div>
    <div class="relative z-10 pixel-panel p-0 overflow-hidden" style="width:450px">
      <div class="pixel-title-bar px-4 py-2 text-center" style="font-size:8px;color:#fff;letter-spacing:2px">🏢 ŞİRKET AYARLARI</div>
      <div class="p-6 flex flex-col gap-6">
        
        <div class="text-center" style="font-size:7px;color:#f0d060;line-height:2.5">
          <div style="font-size:18px;margin-bottom:8px">🏢</div>
          Şirket ve proje adınızı özelleştirin
        </div>

        <!-- Company Name -->
        <div class="flex flex-col gap-2">
          <label style="font-size:6px;color:#ffe4a0">Şirket Adı:</label>
          <input 
            v-model="localCompanyName" 
            type="text" 
            maxlength="25"
            class="pixel-inset p-3 text-center" 
            style="font-size:8px;color:#ffe4a0;background:#2a1808;border:2px solid #4a3018;outline:none"
            placeholder="ANTHROPIC VENTURES"
          />
        </div>

        <!-- Project Name -->
        <div class="flex flex-col gap-2">
          <label style="font-size:6px;color:#ffe4a0">Proje Adı:</label>
          <input 
            v-model="localProjectName" 
            type="text" 
            maxlength="20"
            class="pixel-inset p-3 text-center" 
            style="font-size:8px;color:#ffe4a0;background:#2a1808;border:2px solid #4a3018;outline:none"
            placeholder="PROJECT: NEON"
          />
        </div>

        <!-- Preview -->
        <div class="pixel-inset p-4 text-center" style="font-size:6px;color:#c0a878;line-height:2.4">
          <div style="font-size:12px;color:#ffe4a0;margin-bottom:4px">{{ localCompanyName }}</div>
          <div style="font-size:8px;color:#f0b040">{{ localProjectName }}</div>
        </div>

        <div class="flex gap-3">
          <button @click="$emit('save', { companyName: localCompanyName, projectName: localProjectName })" 
                  class="pixel-btn-green flex-1 py-3" style="font-size:8px;letter-spacing:2px">
            💾 KAYDET
          </button>
          <button @click="$emit('cancel')" 
                  class="pixel-btn flex-1 py-3" style="font-size:8px;letter-spacing:2px">
            ❌ İPTAL
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  companyName: String,
  projectName: String,
})

const localCompanyName = ref(props.companyName || 'ANTHROPIC VENTURES')
const localProjectName = ref(props.projectName || 'PROJECT: NEON')

onMounted(() => {
  localCompanyName.value = props.companyName || 'ANTHROPIC VENTURES'
  localProjectName.value = props.projectName || 'PROJECT: NEON'
})
</script>

<style scoped>
input:focus {
  border-color: #ffe4a0;
  box-shadow: inset 0 0 4px rgba(255,228,160,0.3);
}
</style>
