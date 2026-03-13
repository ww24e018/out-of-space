<script setup lang="ts">
import { usePaletteStore } from './stores/palette'

const paletteStore = usePaletteStore()
</script>

<template>
  <div id="app-shell">
    <header>
      <h1>Out Of Space</h1>
      <select
        :value="paletteStore.currentPaletteId"
        @change="paletteStore.setPalette(($event.target as HTMLSelectElement).value)"
        class="palette-select"
      >
        <option
          v-for="p in paletteStore.availablePalettes"
          :key="p.id"
          :value="p.id"
        >
          {{ p.name }}
        </option>
      </select>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--c-bg);
  color: var(--c-text);
}

#app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

header {
  padding: 12px 20px;
  background: var(--c-header-bg);
  border-bottom: 1px solid var(--c-header-border);
  display: flex;
  align-items: center;
  gap: 16px;
}

header h1 {
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text);
}

.palette-select {
  font-size: 12px;
  padding: 3px 6px;
  border: 1px solid var(--c-header-border);
  border-radius: 4px;
  background: var(--c-bg);
  color: var(--c-text);
  cursor: pointer;
}

main {
  flex: 1;
  overflow: hidden;
}
</style>
