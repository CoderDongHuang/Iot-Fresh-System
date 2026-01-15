<template>
  <el-header class="top-menu">
    <el-menu :default-active="activeMenu" class="el-menu-horizontal" mode="horizontal" router>
      <el-menu-item index="/dashboard">
        <el-icon><HomeFilled /></el-icon>
        <span>仪表盘</span>
      </el-menu-item>
      <el-menu-item index="/device/list">
        <el-icon><Cpu /></el-icon>
        <span>设备管理</span>
      </el-menu-item>
      <el-menu-item index="/monitor">
        <el-icon><Monitor /></el-icon>
        <span>实时监控</span>
      </el-menu-item>
      <el-menu-item index="/control">
        <el-icon><SwitchButton /></el-icon>
        <span>设备控制</span>
      </el-menu-item>
      <el-menu-item index="/alarm">
        <el-icon><Bell /></el-icon>
        <span>报警管理</span>
      </el-menu-item>
      <el-menu-item index="/data/history">
        <el-icon><DataLine /></el-icon>
        <span>数据查询</span>
      </el-menu-item>
      <el-menu-item index="/settings/profile">
        <el-icon><Setting /></el-icon>
        <span>系统设置</span>
      </el-menu-item>
    </el-menu>
  </el-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, Cpu, Monitor, SwitchButton, Bell, DataLine, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.top-menu {
  background: var(--card-bg) !important;
  border-bottom: 1px solid var(--el-border-color-light) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 0 20px !important;
  height: 60px !important;
  z-index: 1000;
}

.el-menu-horizontal {
  border: none !important;
  background: transparent !important;
  height: 60px !important;
  line-height: 60px !important;
  
  .el-menu-item {
    color: var(--text-color-secondary) !important;
    height: 60px !important;
    line-height: 60px !important;
    border-bottom: 2px solid transparent !important;
    
    &:hover {
      color: var(--text-color-primary) !important;
      background: var(--el-fill-color-light) !important;
    }
    
    &.is-active {
      color: var(--color-accent-blue) !important;
      background: var(--el-fill-color-light) !important;
      border-bottom: 2px solid var(--color-accent-blue) !important;
    }
  }
}
</style>
