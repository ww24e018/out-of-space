<script setup lang="ts">
import { ref, watch } from 'vue'
import { useScanStore } from '@/stores/scan'
import TreemapView from '@/visualisation/treemap/TreemapView.vue'
import type { FileNode } from '@shared/types'

const scanStore = useScanStore()
const viewRoot = ref<FileNode | null>(null)

watch(
  () => scanStore.rootNode,
  (node) => {
    viewRoot.value = node
  }
)

function onDrillDown(node: FileNode): void {
  if (node.type === 'directory') {
    viewRoot.value = node
  }
}

function goUp(): void {
  if (!viewRoot.value || !scanStore.rootNode) return
  // Find the parent of viewRoot by walking from the root
  const parent = findParent(scanStore.rootNode, viewRoot.value.path)
  viewRoot.value = parent ?? scanStore.rootNode
}

function findParent(node: FileNode, targetPath: string): FileNode | null {
  if (!node.children) return null
  for (const child of node.children) {
    if (child.path === targetPath) return node
    const found = findParent(child, targetPath)
    if (found) return found
  }
  return null
}

const hoveredPath = ref<string | null>(null)

function onHover(node: FileNode | null): void {
  hoveredPath.value = node?.path ?? null
}

const isDrilledIn = ref(false)
watch(viewRoot, () => {
  isDrilledIn.value = viewRoot.value !== null && scanStore.rootNode !== null && viewRoot.value.path !== scanStore.rootNode.path
})
</script>

<template>
  <div class="home">
    <div v-if="!scanStore.rootNode" class="welcome">
      <p>Select a folder to visualise its disk usage.</p>
      <button @click="scanStore.selectAndScan()">Open Folder</button>
    </div>
    <div v-else-if="viewRoot" class="viz-container">
      <div class="viz-toolbar">
        <button v-if="isDrilledIn" class="up-button" @click="goUp">Up</button>
        <span class="viz-path">{{ viewRoot.path }}</span>
      </div>
      <TreemapView
        :data="viewRoot"
        :selected-node="scanStore.selectedNode"
        @select="scanStore.selectNode"
        @drill-down="onDrillDown"
        @hover="onHover"
      />
      <div class="status-bar">
        <span v-if="hoveredPath" class="status-path">{{ hoveredPath }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
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

.viz-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.viz-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #16162a;
  border-bottom: 1px solid #2a2a4a;
  flex-shrink: 0;
}

.viz-path {
  font-size: 12px;
  color: #a0a0b0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.up-button {
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #e0e0f0;
  background: #2a2a4a;
  border: 1px solid #3a3a5a;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}

.up-button:hover {
  background: #3a3a5a;
}

.status-bar {
  display: flex;
  align-items: center;
  padding: 4px 12px;
  background: #16162a;
  border-top: 1px solid #2a2a4a;
  flex-shrink: 0;
  min-height: 24px;
}

.status-path {
  font-size: 11px;
  color: #808098;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
