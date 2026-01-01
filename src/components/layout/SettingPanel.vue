<template>
  <el-drawer v-model="visible" title="系统设置" direction="rtl" size="300px">
    <div class="setting-panel">
      <el-switch v-model="darkMode" active-text="暗黑模式" inactive-text="明亮模式" />
      <el-divider />
      <el-switch v-model="showTags" active-text="显示标签栏" />
      <el-switch v-model="showFooter" active-text="显示页脚" />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const visible = ref(false)
const darkMode = ref(false)
const showTags = ref(true)
const showFooter = ref(true)
</script>

<style scoped>
.setting-panel {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
