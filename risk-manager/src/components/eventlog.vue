<template>
  <div style="display:flex;flex-direction:column;gap:4px">
    <div v-if="!events.length" style="text-align:center;padding:20px 0;font-size:6px;color:#7a6040">
      <div style="font-size:20px">📋</div>
      <div style="margin-top:8px">Henüz olay yok</div>
    </div>
    <TransitionGroup name="log" tag="div" style="display:flex;flex-direction:column;gap:6px">
      <div v-for="event in events" :key="event.id" :class="['log-entry body-text', typeClass(event.type)]">
        <div style="display:flex;justify-content:space-between;align-items:start;gap:8px">
          <span style="flex:1">{{ event.msg }}</span>
          <span style="font-size:10px;color:#8a6050;white-space:nowrap;font-family:'Press Start 2P',monospace;">G{{ event.day }}</span>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
defineProps({ events: Array })
function typeClass(t) {
  return {
    success:'log-success',warning:'log-warning',danger:'log-danger',
    milestone:'log-milestone',hire:'log-hire',upgrade:'log-upgrade',info:'log-info',
  }[t] || 'log-info'
}
</script>

<style scoped>
.log-entry { font-size:12px; padding:10px 12px; border:2px solid; line-height:1.5; }
.log-success   { background:#1a3010;color:#80d060;border-color:#2a4818; }
.log-warning   { background:#3a2808;color:#f0a040;border-color:#503810; }
.log-danger    { background:#3a0808;color:#f06060;border-color:#501010; }
.log-milestone { background:#3a3008;color:#f0d040;border-color:#504808;font-size:5px; }
.log-hire      { background:#0a1a30;color:#80a0f0;border-color:#182840; }
.log-upgrade   { background:#1a0a30;color:#a060f0;border-color:#280a40; }
.log-info      { background:#2a1808;color:#c09060;border-color:#3a2810; }

.log-enter-active { transition:all 0.25s ease; }
.log-enter-from   { opacity:0;transform:translateY(-6px); }
</style>