<script setup lang="ts">
import { watch, nextTick, useTemplateRef } from 'vue'

const props = defineProps<{
  logs: string[]
}>()

const logArea = useTemplateRef<HTMLElement>('logArea')

watch(
  () => props.logs.length,
  () => {
    nextTick(() => {
      if (logArea.value) {
        logArea.value.scrollTop = logArea.value.scrollHeight
      }
    })
  }
)
</script>

<template>
  <div class="panel-header">
    <span class="panel-title">输出日志</span>
    <span v-if="logs.length" class="panel-badge">{{ logs.length }} 行</span>
  </div>
  <div ref="logArea" class="log-area">
    <div v-if="!logs.length" class="log-placeholder">点击"开始清理"运行清理脚本...</div>
    <div v-for="(line, idx) in logs" :key="idx" class="log-line" v-text="line"></div>
  </div>
</template>

<style scoped>
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

.log-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  background: var(--bg-terminal);
  font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.7;
}

.log-placeholder {
  color: var(--text-muted);
  font-style: italic;
}

.log-line {
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
