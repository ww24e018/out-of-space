<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import type { FileNode } from '@shared/types'

const props = defineProps<{
  x: number
  y: number
  node: FileNode
}>()

const emit = defineEmits<{
  showInFinder: []
  openInTerminal: []
  close: []
}>()

const menuRef = ref<HTMLDivElement | null>(null)
const adjustedX = ref(props.x)
const adjustedY = ref(props.y)

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') emit('close')
}

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)
  await nextTick()
  if (menuRef.value) {
    const rect = menuRef.value.getBoundingClientRect()
    if (props.x + rect.width > window.innerWidth) {
      adjustedX.value = props.x - rect.width
    }
    if (props.y + rect.height > window.innerHeight) {
      adjustedY.value = props.y - rect.height
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="context-backdrop" @click="emit('close')" @contextmenu.prevent="emit('close')">
    <div
      ref="menuRef"
      class="context-menu"
      :style="{ left: adjustedX + 'px', top: adjustedY + 'px' }"
      @click.stop
    >
      <button class="context-item" @click="emit('showInFinder')">Show in Finder</button>
      <button
        v-if="node.type === 'directory'"
        class="context-item"
        @click="emit('openInTerminal')"
      >
        Open in Terminal
      </button>
    </div>
  </div>
</template>

<style scoped>
.context-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
}

.context-menu {
  position: fixed;
  z-index: 100;
  background: rgba(20, 20, 40, 0.95);
  border: 1px solid #3a3a5a;
  border-radius: 4px;
  padding: 4px 0;
  min-width: 160px;
}

.context-item {
  display: block;
  width: 100%;
  padding: 6px 12px;
  font-size: 12px;
  color: #e0e0f0;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
}

.context-item:hover {
  background: rgba(233, 69, 96, 0.3);
}
</style>
