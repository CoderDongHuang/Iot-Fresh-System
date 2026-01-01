<template>
  <div class="tags-view">
    <el-tag v-for="tag in tags" :key="tag.path" closable @close="removeTag(tag)">
      {{ tag.title }}
    </el-tag>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const tags = ref([
  { path: '/dashboard', title: '仪表盘' },
  { path: '/device/list', title: '设备管理' },
])
function removeTag(tag: any) {
  tags.value = tags.value.filter(t => t.path !== tag.path)
}
</script>

<style scoped>
.tags-view {
  padding: 8px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  gap: 8px;
}
</style>
