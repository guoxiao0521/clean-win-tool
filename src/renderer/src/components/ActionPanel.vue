<script setup lang="ts">
import LogOutput from './LogOutput.vue'

const props = defineProps<{
  isRunning: boolean
  isComplete: boolean
  freedSpace: string
  logs: string[]
}>()

const emit = defineEmits<{
  start: []
}>()
</script>

<template>
  <section class="panel right-panel">
    <div class="action-area">
      <button
        class="cleanup-btn"
        :class="{ running: props.isRunning, complete: props.isComplete }"
        :disabled="props.isRunning"
        @click="emit('start')"
      >
        <span v-if="!props.isRunning && !props.isComplete" class="btn-content">
          <span class="btn-icon">▶</span>
          开始清理
        </span>
        <span v-else-if="props.isRunning" class="btn-content">
          <span class="btn-spinner"></span>
          清理中...
        </span>
        <span v-else class="btn-content">
          <span class="btn-icon">✓</span>
          清理完成
        </span>
      </button>
      <div v-if="props.isComplete && props.freedSpace" class="freed-space">
        释放了 <strong>{{ props.freedSpace }}</strong> 磁盘空间
      </div>
    </div>

    <LogOutput :logs="props.logs" />
  </section>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.right-panel {
  flex: 1;
  min-width: 0;
}

.action-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  border-bottom: 1px solid var(--border);
}

.cleanup-btn {
  padding: 12px 40px;
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.3);
}

.cleanup-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.cleanup-btn:active:not(:disabled) {
  transform: translateY(0);
}

.cleanup-btn:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.cleanup-btn.running {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  box-shadow: 0 2px 12px rgba(99, 102, 241, 0.3);
}

.cleanup-btn.complete {
  background: linear-gradient(135deg, #34d399, #059669);
  box-shadow: 0 2px 12px rgba(52, 211, 153, 0.3);
  cursor: pointer;
  opacity: 1;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  font-size: 14px;
}

.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.freed-space {
  font-size: 14px;
  color: var(--success);
  font-weight: 500;
}

.freed-space strong {
  font-weight: 700;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
