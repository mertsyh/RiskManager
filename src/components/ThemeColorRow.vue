<template>
  <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 6px;background:#1a0c04;border:2px solid #2a1408">
    <span style="font-size:5px;color:#9a7850;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ label }}</span>
    <div style="display:flex;align-items:center;gap:5px;flex-shrink:0">
      <!-- Color preview swatch -->
      <div :style="{
        width:'18px', height:'18px',
        background:value,
        border:'2px solid #4a2810',
        boxShadow:'inset 1px 1px 0 rgba(255,255,255,0.1)',
        cursor:'pointer',
        flexShrink:0,
      }" @click="picker.click()"></div>
      <!-- Hex input -->
      <input
        type="text"
        :value="value"
        @change="handleText($event.target.value)"
        style="font-family:'Press Start 2P',monospace;font-size:5px;width:62px;background:#0c0804;color:#c8a060;border:2px solid #3a1808;padding:3px 4px;outline:none"
        maxlength="7"
      />
      <!-- Hidden color picker -->
      <input
        ref="picker"
        type="color"
        :value="value"
        @input="$emit('input', $event.target.value)"
        style="position:absolute;opacity:0;width:0;height:0;pointer-events:none"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ label: String, value: String })
const emit = defineEmits(['input'])
const picker = ref(null)

function handleText(val) {
  // Validate hex
  if (/^#[0-9a-fA-F]{6}$/.test(val)) emit('input', val)
}
</script>