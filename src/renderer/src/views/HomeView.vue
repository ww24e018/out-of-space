<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useScanStore } from '@/stores/scan'
import TreemapView from '@/visualisation/treemap/TreemapView.vue'
import ContextMenu from '@/components/ContextMenu.vue'
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

function drillIntoSelection(): void {
  if (scanStore.selectedNode?.type === 'directory') {
    viewRoot.value = scanStore.selectedNode
  }
}

function goUp(): void {
  if (!viewRoot.value || !scanStore.rootNode) return
  const parent = findParent(scanStore.rootNode, viewRoot.value.path)
  viewRoot.value = parent ?? scanStore.rootNode
}

function selectParent(): void {
  if (!scanStore.selectedNode || !scanStore.rootNode) return
  const parent = findParent(scanStore.rootNode, scanStore.selectedNode.path)
  if (parent) scanStore.selectNode(parent)
}

// DFS to locate the parent of targetPath — O(n) worst case over the full tree.
// Acceptable for Phase 1 (typical trees < 50k nodes, sub-10ms). If this becomes
// a bottleneck, consider storing parent refs on FileNode or tracking a breadcrumb
// path during navigation.
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

const isDrilledIn = computed(() =>
  viewRoot.value !== null && scanStore.rootNode !== null && viewRoot.value.path !== scanStore.rootNode.path
)

const canSelectParent = computed(() =>
  scanStore.selectedNode !== null && scanStore.rootNode !== null && scanStore.selectedNode.path !== scanStore.rootNode.path
)

const canDrillIn = computed(() =>
  scanStore.selectedNode?.type === 'directory'
)

const hasSelection = computed(() => scanStore.selectedNode !== null)

const isSelectedDirectory = computed(() =>
  scanStore.selectedNode?.type === 'directory'
)

const contextMenu = ref<{ node: FileNode; x: number; y: number } | null>(null)

function onContextMenu(payload: { node: FileNode; x: number; y: number }): void {
  contextMenu.value = payload
}

async function showInFinder(node?: FileNode): Promise<void> {
  const target = node ?? contextMenu.value?.node ?? scanStore.selectedNode
  if (!target) return
  try {
    await window.api.showInFinder(target.path)
  } catch {
    // Path may no longer exist
  }
  contextMenu.value = null
}

async function openInTerminal(node?: FileNode): Promise<void> {
  const target = node ?? contextMenu.value?.node ?? scanStore.selectedNode
  if (!target) return
  try {
    await window.api.openInTerminal(target.path)
  } catch {
    // Path may no longer exist or is not a directory
  }
  contextMenu.value = null
}
</script>

<template>
  <div class="home">
    <div v-if="!scanStore.rootNode" class="welcome">
      <p>Select a folder to visualise its disk usage.</p>
      <button @click="scanStore.selectAndScan()">Open Folder</button>
    </div>
    <div v-else-if="viewRoot" class="viz-container">
      <div class="viz-rootbar">
        <button v-if="isDrilledIn" class="toolbar-button" @click="goUp">Up</button>
        <span class="viz-path">{{ viewRoot.path }}</span>
      </div>
      <div v-if="hasSelection" class="viz-toolbar">
        <span class="selection-path">{{ scanStore.selectedNode!.path }}</span>
        <button class="toolbar-button" @click="showInFinder()">Finder</button>
        <button v-if="isSelectedDirectory" class="toolbar-button" @click="openInTerminal()">Terminal</button>
        <button v-if="canDrillIn" class="toolbar-button toolbar-button--primary" @click="drillIntoSelection">Drill Into</button>
        <button v-if="canSelectParent" class="toolbar-button" @click="selectParent">Select Parent</button>
      </div>
      <TreemapView
        :data="viewRoot"
        :selected-node="scanStore.selectedNode"
        @select="scanStore.selectNode"
        @drill-down="onDrillDown"
        @hover="onHover"
        @context-menu="onContextMenu"
      />
      <div class="status-bar">
        <span v-if="hoveredPath" class="status-path">{{ hoveredPath }}</span>
      </div>
    </div>
    <ContextMenu
      v-if="contextMenu"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :node="contextMenu.node"
      @show-in-finder="showInFinder"
      @open-in-terminal="openInTerminal"
      @close="contextMenu = null"
    />
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

.viz-rootbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #16162a;
  border-bottom: 1px solid #2a2a4a;
  flex-shrink: 0;
}

.viz-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #1a1a32;
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

.selection-path {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: #a0a0b0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  direction: rtl;
}

.toolbar-button {
  flex-shrink: 0;
  white-space: nowrap;
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

.toolbar-button:hover {
  background: #3a3a5a;
}

.toolbar-button--primary {
  background: #e94560;
  border-color: #e94560;
}

.toolbar-button--primary:hover {
  background: #c73650;
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
