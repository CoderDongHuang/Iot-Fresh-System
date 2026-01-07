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
  background: rgba(15, 30, 55, 0.8) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(41, 121, 255, 0.3) !important;
  height: 60px;
  padding: 0 24px;
  box-shadow: 
    0 4px 20px rgba(5, 20, 45, 0.5),
    0 0 0 1px rgba(41, 121, 255, 0.2) inset;
  z-index: 1001;
  position: relative;
}
.logo {
  width: 32px;
  height: 32px;
  margin-right: 12px;
  filter: drop-shadow(0 0 5px rgba(41, 121, 255, 0.5));
}
.title {
  font-size: 18px;
  font-weight: bold;
  color: #00e676; /* 荧光绿 */
  text-shadow: 0 0 10px rgba(0, 230, 118, 0.5);
}
.navbar-right {
  display: flex;
  align-items: center;
}
.el-dropdown-link {
  color: #e6f0ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(41, 121, 255, 0.2);
  }
}
</style>
