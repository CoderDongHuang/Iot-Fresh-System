<template>
  <div class="device-list-view">
    <h2>设备列表</h2>
    <el-table :data="[]">
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="name" label="设备名称" />
      <el-table-column prop="status" label="状态" />
    </el-table>
  </div>
</template>
<script setup lang="ts">
</script>
<style scoped>
.device-list-view { padding: 24px; }
</style>
