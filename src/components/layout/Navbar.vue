<template>
  <el-header class="navbar">
    <div class="navbar-left">
      <img src="/vite.svg" class="logo" alt="logo" />
      <span class="title">物联网生鲜品储运系统</span>
    </div>
    <div class="navbar-right">
      <el-dropdown>
        <span class="el-dropdown-link">
          <el-icon><User /></el-icon> 用户 <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { User, ArrowDown } from '@element-plus/icons-vue'
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  height: 60px;
  padding: 0 24px;
}
.logo {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}
.title {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}
.navbar-right {
  display: flex;
  align-items: center;
}
</style>
