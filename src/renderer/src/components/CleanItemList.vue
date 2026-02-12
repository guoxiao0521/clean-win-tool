<script setup lang="ts">
import type { CleanItem, CleanStatus } from '../types'

defineProps<{
  items: CleanItem[]
}>()

function getStatusIcon(status: CleanStatus): string {
  switch (status) {
    case 'pending':
      return '○'
    case 'running':
      return '◌'
    case 'success':
      return '✓'
    case 'skipped':
      return '—'
    case 'warning':
      return '!'
  }
}
</script>

<template>
  <section class="panel items-panel">
    <div class="panel-header">
      <span class="panel-title">清理项目</span>
      <span class="panel-badge">{{ items.length }} 项</span>
    </div>
    <div class="items-list">
      <div v-for="item in items" :key="item.id" class="clean-item" :class="'status-' + item.status">
        <span class="item-icon">{{ item.icon }}</span>
        <div class="item-info">
          <span class="item-label">{{ item.label }}</span>
          <span class="item-detail">{{ item.detail }}</span>
        </div>
        <span class="item-status" :class="'indicator-' + item.status">
          <span v-if="item.status === 'running'" class="spinner"></span>
          <span v-else>{{ getStatusIcon(item.status) }}</span>
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.items-panel {
  width: 320px;
  flex-shrink: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.panel-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.panel-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-muted);
}

.items-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.clean-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
}

.clean-item:hover {
  background: var(--bg-card);
}

.item-icon {
  font-size: 16px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.item-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-detail {
  font-size: 11px;
  color: var(--text-muted);
}

.item-status {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.indicator-pending {
  color: var(--pending);
}

.indicator-running {
  color: var(--accent);
}

.indicator-success {
  color: var(--success);
  background: var(--success-bg);
}

.indicator-skipped {
  color: var(--text-muted);
}

.indicator-warning {
  color: var(--warning);
  background: var(--warning-bg);
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid var(--accent);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
