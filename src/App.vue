
<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

// 应用浅色主题
document.documentElement.className = 'light'
</script>

<style lang="scss">
#app {
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-primary-dark);
  color: var(--text-color-primary);
}
</style>
