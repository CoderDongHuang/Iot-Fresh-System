
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

// Element Plus 全局样式覆盖
.el-message-box {
  min-width: 300px;
}
</style>
