<template>
  <el-aside width="200px" class="sidebar">
    <el-menu :default-active="activeMenu" class="el-menu-vertical-demo" router>
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
  </el-aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, Cpu, Monitor, SwitchButton, Bell, DataLine, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.sidebar {
  height: 100vh;
  background: #fff;
  border-right: 1px solid #ebeef5;
  box-shadow: 2px 0 8px 0 rgba(0,0,0,0.03);
}
</style>
