<template>
  <el-header class="navbar">
    <div class="navbar-left">
      <img src="/iot-logo.svg" class="logo" alt="logo" />
      <span class="title">物联网生鲜品储运系统</span>
    </div>
    <div class="navbar-right">
      <el-dropdown @command="handleUserCommand">
        <span class="el-dropdown-link">
          <el-icon><User /></el-icon> {{ userInfo?.username || '用户' }} <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><UserFilled /></el-icon> 个人中心
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon> 退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { User, ArrowDown, UserFilled, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

// 获取用户信息
const userInfo = userStore.getUserInfo

// 处理用户命令
const handleUserCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      // 跳转到个人中心页面
      router.push('/settings/profile')
      break
    case 'logout':
      // 退出登录
      await handleLogout()
      break
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 调用退出登录API
    await userStore.logout()
    
    // 跳转到登录页面
    router.push('/login')
    ElMessage.success('退出登录成功')
  } catch (error) {
    // 用户取消退出
    if (error !== 'cancel') {
      console.error('退出登录失败:', error)
      ElMessage.error('退出登录失败')
    }
  }
}
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
