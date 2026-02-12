<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <header class="titlebar">
    <div class="titlebar-icon">🧹</div>
    <h1 class="titlebar-title">{{ title ?? 'Windows 11 磁盘清理工具' }}</h1>
    <div class="titlebar-spacer"></div>
  </header>
</template>

<style scoped>
.titlebar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  -webkit-app-region: drag;
}

.titlebar-icon {
  font-size: 20px;
}

.titlebar-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.titlebar-spacer {
  flex: 1;
}
</style>
