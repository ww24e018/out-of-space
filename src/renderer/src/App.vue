<script setup lang="ts">
</script>

<template>
  <div id="app-shell">
    <header>
      <h1>Out Of Space</h1>
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
}

header h1 {
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text);
}

main {
  flex: 1;
  overflow: hidden;
}
</style>
