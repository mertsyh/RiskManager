<template>
  <div>
    <div style="font-size:6px;color:#ffe4a0;letter-spacing:2px;padding:5px 0;border-bottom:2px solid #3a1808;margin-bottom:6px">
      {{ title }}
    </div>
    <div style="display:flex;flex-direction:column;gap:4px">
      <slot />
    </div>
  </div>
</template>
<script setup>
defineProps({ title: String })
</script>