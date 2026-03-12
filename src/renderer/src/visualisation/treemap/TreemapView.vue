<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { VisualisationProps } from '../types'
import type { FileNode } from '@shared/types'
import { computeTreemapLayout, type LayoutNode } from './layout'
import { colorForNode } from './colorScale'
import { formatBytes } from '@shared/format'

const props = defineProps<VisualisationProps>()
const emit = defineEmits<{
  select: [node: FileNode]
  drillDown: [node: FileNode]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const width = ref(0)
const height = ref(0)

const tooltip = ref<{ x: number; y: number; name: string; size: string } | null>(null)

const visibleNodes = computed(() =>
  computeTreemapLayout(props.data, width.value, height.value).map((node, index) => ({
    node,
    clipId: `clip-${index}`
  }))
)

function nodeWidth(node: LayoutNode): number {
  return node.x1 - node.x0
}

function nodeHeight(node: LayoutNode): number {
  return node.y1 - node.y0
}

function showLabel(node: LayoutNode): boolean {
  return nodeWidth(node) > 40 && nodeHeight(node) > 16
}

function onNodeClick(node: LayoutNode): void {
  emit('select', node.data)
}

function onNodeDblClick(node: LayoutNode): void {
  if (node.data.type === 'directory') {
    emit('drillDown', node.data)
  }
}

function onNodeEnter(event: MouseEvent, node: LayoutNode): void {
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  tooltip.value = {
    x: event.clientX - rect.left + 12,
    y: event.clientY - rect.top + 12,
    name: node.data.name,
    size: formatBytes(node.data.size)
  }
}

function onNodeMove(event: MouseEvent): void {
  if (!tooltip.value) return
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  tooltip.value.x = event.clientX - rect.left + 12
  tooltip.value.y = event.clientY - rect.top + 12
}

function onNodeLeave(): void {
  tooltip.value = null
}

let resizeObserver: ResizeObserver | null = null
let resizeTimer: ReturnType<typeof setTimeout> | null = null

function updateSize(): void {
  if (!containerRef.value) return
  width.value = containerRef.value.clientWidth
  height.value = containerRef.value.clientHeight
}

onMounted(() => {
  updateSize()
  resizeObserver = new ResizeObserver(() => {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(updateSize, 150)
  })
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  if (resizeTimer) clearTimeout(resizeTimer)
})

watch(() => props.data, updateSize)
</script>

<template>
  <div ref="containerRef" class="treemap-container">
    <svg :width="width" :height="height" class="treemap-svg">
      <g
        v-for="{ node, clipId } in visibleNodes"
        :key="node.data.path"
        :transform="`translate(${node.x0},${node.y0})`"
        class="treemap-node"
        :class="{ selected: selectedNode?.path === node.data.path }"
        @click.stop="onNodeClick(node)"
        @dblclick.stop="onNodeDblClick(node)"
        @mouseenter="onNodeEnter($event, node)"
        @mousemove="onNodeMove"
        @mouseleave="onNodeLeave"
      >
        <rect
          :width="nodeWidth(node)"
          :height="nodeHeight(node)"
          :fill="colorForNode(node)"
          stroke="#1a1a2e"
          stroke-width="1"
        />
        <clipPath :id="clipId">
          <rect :width="nodeWidth(node) - 4" :height="nodeHeight(node) - 2" />
        </clipPath>
        <text
          v-if="showLabel(node)"
          :clip-path="`url(#${clipId})`"
          x="4"
          y="13"
          class="treemap-label"
        >
          {{ node.data.name }}
        </text>
      </g>
    </svg>
    <div v-if="tooltip" class="treemap-tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      <strong>{{ tooltip.name }}</strong>
      <span>{{ tooltip.size }}</span>
    </div>
  </div>
</template>

<style scoped>
.treemap-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.treemap-svg {
  display: block;
}

.treemap-node {
  cursor: pointer;
}

.treemap-node rect {
  transition: opacity 0.15s;
}

.treemap-node:hover rect {
  opacity: 0.8;
}

.treemap-node.selected rect {
  stroke: #e94560;
  stroke-width: 2;
}

.treemap-label {
  fill: rgba(255, 255, 255, 0.95);
  font-size: 11px;
  pointer-events: none;
  user-select: none;
  paint-order: stroke;
  stroke: rgba(0, 0, 0, 0.6);
  stroke-width: 2.5px;
  stroke-linejoin: round;
}

.treemap-tooltip {
  position: absolute;
  pointer-events: none;
  background: rgba(20, 20, 40, 0.95);
  border: 1px solid #3a3a5a;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  color: #e0e0f0;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 10;
}
</style>
