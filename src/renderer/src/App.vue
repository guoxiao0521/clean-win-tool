<script setup lang="ts">
import { useCleanup } from './composables/useCleanup'
import TitleBar from './components/TitleBar.vue'
import CleanItemList from './components/CleanItemList.vue'
import ActionPanel from './components/ActionPanel.vue'
import StatusBar from './components/StatusBar.vue'

const { cleanItems, isRunning, isComplete, logs, freedSpace, startCleanup } = useCleanup()
</script>

<template>
  <div class="app-container">
    <TitleBar />

    <main class="content">
      <CleanItemList :items="cleanItems" />
      <ActionPanel
        :is-running="isRunning"
        :is-complete="isComplete"
        :freed-space="freedSpace"
        :logs="logs"
        @start="startCleanup"
      />
    </main>

    <StatusBar :is-running="isRunning" :is-complete="isComplete" :freed-space="freedSpace" />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 1px;
  background: var(--border);
}
</style>
