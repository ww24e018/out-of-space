<script setup lang="ts">
import { computed } from 'vue'
import type { FileNode } from '@shared/types'
import { useScanStore } from '@/stores/scan'
import { collectAncestors } from '@/utils/tree'

const props = defineProps<{
  viewRoot: FileNode
}>()

const emit = defineEmits<{
  'select-node': [node: FileNode]
  'drill-into': []
  'show-in-finder': []
  'open-in-terminal': []
  'select-parent': []
  'status-hint': [hint: string | null]
}>()

const scanStore = useScanStore()

const hasSelection = computed(() => scanStore.selectedNode !== null)

const isSelectedDirectory = computed(() =>
  scanStore.selectedNode?.type === 'directory'
)

const canDrillIn = computed(() =>
  scanStore.selectedNode?.type === 'directory'
)

const canSelectParent = computed(() =>
  scanStore.selectedNode !== null && scanStore.rootNode !== null && scanStore.selectedNode.path !== scanStore.rootNode.path
)

const segments = computed(() => {
  if (!scanStore.selectedNode) return []
  const chain = collectAncestors(scanStore.selectedNode, props.viewRoot, (n) => scanStore.parentOf(n))
  // Remove the first element (viewRoot) — it's represented by the ▸ prefix
  return chain.slice(1)
})
</script>

<template>
  <div class="viz-toolbar">
    <span v-if="hasSelection" class="toolbar-breadcrumbs">
      <span class="toolbar-prefix">&#x25B8;</span>
      <template v-for="(seg, i) in segments" :key="seg.path">
        <span class="toolbar-sep">&#x203A;</span>
        <span
          v-if="i < segments.length - 1"
          class="toolbar-pill"
          @click="emit('select-node', seg)"
          @mouseenter="emit('status-hint', `Select ${seg.name}`)"
          @mouseleave="emit('status-hint', null)"
        >{{ seg.name }}</span>
        <span v-else class="toolbar-pill toolbar-pill--current">{{ seg.name }}</span>
      </template>
    </span>
    <span v-else class="toolbar-empty">No selection</span>

    <button
      class="toolbar-button"
      :disabled="!hasSelection"
      @click="emit('show-in-finder')"
      @mouseenter="emit('status-hint', 'Reveal the selected item in the system file manager')"
      @mouseleave="emit('status-hint', null)"
    >Reveal</button>
    <button
      v-if="isSelectedDirectory"
      class="toolbar-button"
      @click="emit('open-in-terminal')"
      @mouseenter="emit('status-hint', 'Open a terminal at the selected directory')"
      @mouseleave="emit('status-hint', null)"
    >Terminal</button>
    <button
      v-if="canDrillIn"
      class="toolbar-button"
      @click="emit('drill-into')"
      @mouseenter="emit('status-hint', 'Drill into the selected directory')"
      @mouseleave="emit('status-hint', null)"
    >Drill Into</button>
    <button
      v-if="canSelectParent"
      class="toolbar-button"
      @click="emit('select-parent')"
      @mouseenter="emit('status-hint', 'Select the parent of the current selection')"
      @mouseleave="emit('status-hint', null)"
    >Select Parent</button>
  </div>
</template>

<style scoped>
.viz-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--c-surface-alt);
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
}

.toolbar-breadcrumbs {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 2px;
  overflow: hidden;
}

.toolbar-prefix {
  color: var(--c-text-muted);
  font-size: 12px;
  flex-shrink: 0;
}

.toolbar-sep {
  color: var(--c-text-muted);
  font-size: 12px;
  flex-shrink: 0;
}

.toolbar-pill {
  font-size: 12px;
  color: var(--c-btn-text);
  background: var(--c-btn-bg);
  border-radius: 3px;
  padding: 1px 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}

.toolbar-pill:hover {
  background: var(--c-btn-hover);
}

.toolbar-pill--current {
  font-weight: 600;
  cursor: default;
}

.toolbar-pill--current:hover {
  background: var(--c-btn-bg);
}

.toolbar-empty {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: var(--c-text-muted);
}

.toolbar-button {
  flex-shrink: 0;
  white-space: nowrap;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-btn-text);
  background: var(--c-btn-bg);
  border: 1px solid var(--c-btn-border);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}

.toolbar-button:hover:not(:disabled) {
  background: var(--c-btn-hover);
}

.toolbar-button:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>
