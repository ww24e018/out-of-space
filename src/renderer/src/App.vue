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
  background: #1a1a2e;
  color: #e0e0e0;
}

#app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

header {
  padding: 12px 20px;
  background: #16213e;
  border-bottom: 1px solid #0f3460;
}

header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #e94560;
}

main {
  flex: 1;
  overflow: hidden;
}
</style>
