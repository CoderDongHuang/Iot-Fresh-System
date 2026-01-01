<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/images/logo.png" class="logo" alt="logo">
        <h1>{{ appTitle }}</h1>
        <p>基于物联网的生鲜品储运系统</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="code" v-if="captchaEnabled">
          <div class="captcha-input">
            <el-input
              v-model="loginForm.code"
              placeholder="请输入验证码"
              size="large"
              prefix-icon="Key"
            />
            <img :src="captchaImage" class="captcha-image" @click="getCaptcha">
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
          <el-link type="primary" :underline="false" @click="showForget = true">
            忘记密码?
          </el-link>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
        
        <div class="login-footer">
          <p>提示：请联系管理员获取账号</p>
        </div>
      </el-form>
      
      <!-- 忘记密码对话框 -->
      <el-dialog
        v-model="showForget"
        title="忘记密码"
        width="400px"
        :close-on-click-modal="false"
      >
        <el-form :model="forgetForm" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="forgetForm.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="forgetForm.email" placeholder="请输入注册邮箱" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showForget = false">取消</el-button>
          <el-button type="primary" @click="handleForget">发送重置邮件</el-button>
        </template>
      </el-dialog>
    </div>
    
    <!-- 背景动画 -->
    <div class="login-bg">
      <canvas ref="canvasRef" class="bg-canvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/store/user'
import { encryptPassword } from '@/utils/crypto'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const appTitle = import.meta.env.VITE_APP_TITLE || '物联网系统'

// 表单相关
const loginFormRef = ref<FormInstance>()
const loginForm = reactive({
  username: '',
  password: '',
  code: '',
})
const loading = ref(false)
const rememberMe = ref(false)
const captchaEnabled = ref(false)
const captchaImage = ref('')
const showForget = ref(false)
const forgetForm = reactive({
  username: '',
  email: '',
})

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    const encryptedPassword = encryptPassword(loginForm.password)
    
    await userStore.login({
      username: loginForm.username,
      password: encryptedPassword,
    })
    
    // 跳转到首页或重定向页面
    const redirect = route.query.redirect as string
    router.push({ path: redirect || '/' })
    
    ElMessage.success('登录成功')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取验证码
const getCaptcha = () => {
  // TODO: 实现验证码获取逻辑
  captchaImage.value = 'data:image/svg+xml;base64,...'
}

// 处理忘记密码
const handleForget = () => {
  // TODO: 实现忘记密码逻辑
  ElMessage.success('重置邮件已发送，请查收')
  showForget.value = false
}

// 背景动画
const canvasRef = ref<HTMLCanvasElement>()
let animationId: number

const initBackground = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  const particles: Array<{
    x: number
    y: number
    size: number
    speedX: number
    speedY: number
    color: string
  }> = []
  
  // 创建粒子
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedX: Math.random() * 0.5 - 0.25,
      speedY: Math.random() * 0.5 - 0.25,
      color: `rgba(64, 158, 255, ${Math.random() * 0.5 + 0.2})`,
    })
  }
  
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    particles.forEach(particle => {
      particle.x += particle.speedX
      particle.y += particle.speedY
      
      // 边界检测
      if (particle.x > canvas.width) particle.x = 0
      if (particle.x < 0) particle.x = canvas.width
      if (particle.y > canvas.height) particle.y = 0
      if (particle.y < 0) particle.y = canvas.height
      
      // 绘制粒子
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = particle.color
      ctx.fill()
      
      // 绘制连线
      particles.forEach(otherParticle => {
        const dx = particle.x - otherParticle.x
        const dy = particle.y - otherParticle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 100) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(64, 158, 255, ${0.1 * (1 - distance / 100)})`
          ctx.lineWidth = 0.5
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(otherParticle.x, otherParticle.y)
          ctx.stroke()
        }
      })
    })
    
    animationId = requestAnimationFrame(animate)
  }
  
  animate()
}

onMounted(() => {
  // 初始化背景动画
  initBackground()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    const canvas = canvasRef.value
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
  })
  
  // 尝试读取保存的用户名密码
  const savedUsername = localStorage.getItem('username')
  const savedPassword = localStorage.getItem('password')
  if (savedUsername && savedPassword) {
    loginForm.username = savedUsername
    loginForm.password = savedPassword
    rememberMe.value = true
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.bg-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.login-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  
  .logo {
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
  }
  
  h1 {
    margin: 0 0 10px;
    font-size: 24px;
    color: #333;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: #666;
  }
}

.login-form {
  .captcha-input {
    display: flex;
    gap: 10px;
    
    .captcha-image {
      width: 120px;
      height: 40px;
      cursor: pointer;
      border-radius: 4px;
    }
  }
  
  .login-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
  }
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #999;
  
  p {
    margin: 5px 0;
  }
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8);
}

:deep(.el-checkbox__label) {
  color: #666;
}
</style>