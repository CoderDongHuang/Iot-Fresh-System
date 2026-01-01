<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <Sidebar v-if="!isMobile" />
    
    <!-- 移动端菜单按钮 -->
    <div v-else class="mobile-menu-btn" @click="drawerVisible = true">
      <el-icon><Menu /></el-icon>
    </div>
    
    <!-- 移动端侧边栏抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      size="200px"
      :with-header="false"
    >
      <MobileSidebar />
    </el-drawer>
    
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <Navbar />
      
      <!-- 标签页 -->
      <TagsView v-if="showTagsView" />
      
      <!-- 主内容区域 -->
      <div class="app-main">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
      
      <!-- 页脚 -->
      <Footer v-if="showFooter" />
    </div>
    
    <!-- 设置面板 -->
    <SettingPanel />
    
    <!-- 回到顶部 -->
    <el-backtop :bottom="100" :right="20" :visibility-height="300" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 响应式
const isMobile = ref(false)
const drawerVisible = ref(false)

// 计算属性（如需 appStore，可在此处补充实现）
const showTagsView = ref(false)
const showFooter = ref(false)
const cachedViews = ref([])

// 检查设备类型
const checkDevice = () => {
  isMobile.value = window.innerWidth < 768
}

// 监听路由变化
watch(() => route.path, () => {
  if (isMobile.value) {
    drawerVisible.value = false
  }
})


onMounted(() => {
  checkDevice()
  window.addEventListener('resize', checkDevice)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkDevice)
})
</script>

<style lang="scss" scoped>
.layout-container {
  width: 100%;
  height: 100vh;
  display: flex;
  overflow: hidden;
}

.mobile-menu-btn {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1001;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-main {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background: #f0f2f5;
  
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
}

// 过渡动画
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

// 响应式
@media (max-width: 768px) {
  .app-main {
    padding: 10px;
  }
}
</style>