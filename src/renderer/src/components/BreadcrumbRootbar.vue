<script setup lang="ts">
import { computed } from 'vue'
import type { FileNode } from '@shared/types'
import { useScanStore } from '@/stores/scan'
import { collectAncestors } from '@/utils/tree'

const props = defineProps<{
  viewRoot: FileNode
  rootNode: FileNode
  isScanning: boolean
  isDrilledIn: boolean
}>()

const emit = defineEmits<{
  'scan-other': []
  'rescan': []
  'go-up': []
  'navigate': [node: FileNode]
  'status-hint': [hint: string | null]
}>()

const scanStore = useScanStore()

const segments = computed(() => {
  if (!props.isDrilledIn) return []
  const chain = collectAncestors(props.viewRoot, props.rootNode, (n) => scanStore.parentOf(n))
  // Remove the first element (rootNode) — it's shown as the dimmed prefix
  return chain.slice(1)
})
</script>

<template>
  <div class="viz-rootbar">
    <button
      class="toolbar-button"
      :disabled="isScanning"
      @click="emit('scan-other')"
      @mouseenter="emit('status-hint', 'Open a different folder to scan')"
      @mouseleave="emit('status-hint', null)"
    >Open</button>
    <button
      class="toolbar-button"
      :disabled="isScanning"
      @click="emit('rescan')"
      @mouseenter="emit('status-hint', 'Rescan the current root directory')"
      @mouseleave="emit('status-hint', null)"
    >Rescan</button>
    <button
      v-if="isDrilledIn"
      class="toolbar-button"
      @click="emit('go-up')"
      @mouseenter="emit('status-hint', 'Navigate up to the parent directory')"
      @mouseleave="emit('status-hint', null)"
    >Up</button>

    <span class="rootbar-path">
      <span class="rootbar-prefix">{{ rootNode.path }}</span>
      <template v-for="(seg, i) in segments" :key="seg.path">
        <span class="rootbar-separator">/</span>
        <span
          v-if="i < segments.length - 1"
          class="rootbar-segment"
          @click="emit('navigate', seg)"
          @mouseenter="emit('status-hint', `Navigate to ${seg.name}`)"
          @mouseleave="emit('status-hint', null)"
        >{{ seg.name }}</span>
        <span v-else class="rootbar-segment rootbar-segment--current">{{ seg.name }}</span>
      </template>
    </span>
  </div>
</template>

<style scoped>
.viz-rootbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
}

.rootbar-path {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rootbar-prefix {
  color: var(--c-text-muted);
}

.rootbar-separator {
  color: var(--c-text-muted);
  margin: 0 1px;
}

.rootbar-segment {
  color: var(--c-text);
  cursor: pointer;
}

.rootbar-segment:hover {
  text-decoration: underline;
}

.rootbar-segment--current {
  font-weight: 600;
  cursor: default;
}

.rootbar-segment--current:hover {
  text-decoration: none;
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
