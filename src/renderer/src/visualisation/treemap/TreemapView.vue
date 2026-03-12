<script setup lang="ts">
import type { VisualisationProps } from '../types'

defineProps<VisualisationProps>()
defineEmits<{
  select: [node: VisualisationProps['data']]
  drillDown: [node: VisualisationProps['data']]
}>()
</script>

<template>
  <div class="treemap-container">
    <p>Treemap visualisation — {{ data.name }} ({{ data.children?.length ?? 0 }} children)</p>
    <!-- D3 treemap will be rendered here -->
  </div>
</template>

<style scoped>
.treemap-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0a0b0;
}
</style>
