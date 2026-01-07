
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
  background: linear-gradient(135deg, #050e1a, #0a192f);
}

// Element Plus 全局样式覆盖
.el-message-box {
  min-width: 300px;
  background: rgba(25, 40, 70, 0.9) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(41, 121, 255, 0.4) !important;
}
</style>
