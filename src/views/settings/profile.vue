<template>
  <div class="profile-view">
    <h2>个人设置</h2>
    <el-form label-width="80px">
      <el-form-item label="用户名">
        <el-input disabled value="admin" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input value="admin@example.com" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
</script>
<style scoped>
.profile-view { padding: 24px; }
</style>
