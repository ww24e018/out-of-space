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
  hover: [node: FileNode | null]
  contextMenu: [payload: { node: FileNode; x: number; y: number }]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const width = ref(0)
const height = ref(0)

const tooltip = ref<{ x: number; y: number; name: string; size: string; type: string } | null>(null)

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
  // Only label leaf nodes (height === 0 in d3 hierarchy) to avoid
  // parent labels bleeding through children on hover opacity change
  return node.height === 0 && nodeWidth(node) > 40 && nodeHeight(node) > 16
}

function onNodeClick(node: LayoutNode): void {
  emit('select', node.data)
}

function onNodeDblClick(node: LayoutNode): void {
  if (node.data.type === 'directory') {
    emit('drillDown', node.data)
  }
}

function clampTooltip(cursorX: number, cursorY: number): { x: number; y: number } {
  const tooltipW = 200 // estimated max width
  const tooltipH = 50 // estimated max height
  const gap = 12
  const x = cursorX + gap + tooltipW > width.value ? cursorX - tooltipW - gap : cursorX + gap
  const y = cursorY + gap + tooltipH > height.value ? cursorY - tooltipH - gap : cursorY + gap
  return { x: Math.max(0, x), y: Math.max(0, y) }
}

function onNodeEnter(event: MouseEvent, node: LayoutNode): void {
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  const pos = clampTooltip(event.clientX - rect.left, event.clientY - rect.top)
  tooltip.value = { ...pos, name: node.data.name, size: formatBytes(node.data.size), type: node.data.type }
  emit('hover', node.data)
}

function onNodeMove(event: MouseEvent): void {
  if (!tooltip.value) return
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  const pos = clampTooltip(event.clientX - rect.left, event.clientY - rect.top)
  tooltip.value.x = pos.x
  tooltip.value.y = pos.y
}

function onNodeContextMenu(event: MouseEvent, node: LayoutNode): void {
  tooltip.value = null
  emit('contextMenu', { node: node.data, x: event.clientX, y: event.clientY })
}

function onNodeLeave(): void {
  tooltip.value = null
  emit('hover', null)
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
        @contextmenu.prevent="onNodeContextMenu($event, node)"
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
      <span>{{ tooltip.type === 'directory' ? 'Directory' : 'File' }} — {{ tooltip.size }}</span>
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
