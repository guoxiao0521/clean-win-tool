<script setup lang="ts">
defineProps<{
  isRunning: boolean
  isComplete: boolean
  freedSpace: string
}>()
</script>

<template>
  <footer class="statusbar">
    <span v-if="!isRunning && !isComplete">就绪 - 等待开始清理</span>
    <span v-else-if="isRunning" class="status-running">正在执行清理脚本...</span>
    <span v-else class="status-complete">
      清理完成{{ freedSpace ? ' - 释放 ' + freedSpace : '' }}
    </span>
  </footer>
</template>

<style scoped>
.statusbar {
  padding: 6px 16px;
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-statusbar);
  border-top: 1px solid var(--border);
}

.status-running {
  color: var(--accent);
}

.status-complete {
  color: var(--success);
}
</style>
