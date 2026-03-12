<script setup lang="ts">
import { useScanStore } from '@/stores/scan'

const scanStore = useScanStore()
</script>

<template>
  <div class="home">
    <div v-if="!scanStore.rootNode" class="welcome">
      <p>Select a folder to visualise its disk usage.</p>
      <button @click="scanStore.selectAndScan()">Open Folder</button>
    </div>
    <div v-else class="viz-container">
      <!-- Visualisation component will be mounted here -->
      <p>Scanned: {{ scanStore.rootNode.path }} ({{ scanStore.rootNode.children?.length ?? 0 }} direct children)</p>
    </div>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.welcome {
  text-align: center;
}

.welcome p {
  margin-bottom: 16px;
  font-size: 16px;
  color: #a0a0b0;
}

.welcome button {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: #e94560;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.welcome button:hover {
  background: #c73650;
}
</style>
