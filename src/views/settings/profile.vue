<template>
  <div class="profile-settings-view">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人资料设置</span>
        </div>
      </template>
      
      <el-row :gutter="30">
        <el-col :span="8">
          <div class="avatar-container">
            <el-avatar :size="120" :src="userInfo.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f4c99b3a30486abba70jpeg.jpeg'" :key="userInfo.avatar" />
            <div class="upload-btn">
              <el-upload
                class="avatar-uploader"
                ref="uploadRef"
                action="#"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleFileChange"
              >
                <el-button type="primary" size="small" circle class="upload-icon">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-upload>
            </div>
          </div>
        </el-col>
        
        <el-col :span="16">
          <el-form :model="userInfo" label-width="100px" style="max-width: 500px;">
            <el-form-item label="用户名">
              <el-input v-model="userInfo.username" placeholder="请输入用户名" />
            </el-form-item>
            
            <el-form-item label="真实姓名">
              <el-input v-model="userInfo.realName" placeholder="请输入真实姓名" />
            </el-form-item>
            
            <el-form-item label="邮箱">
              <el-input v-model="userInfo.email" placeholder="请输入邮箱地址" />
            </el-form-item>
            
            <el-form-item label="手机号">
              <el-input v-model="userInfo.phone" placeholder="请输入手机号码" />
            </el-form-item>
            
            <el-form-item label="部门">
              <el-select v-model="userInfo.department" placeholder="请选择部门" style="width: 100%;">
                <el-option label="技术部" value="tech" />
                <el-option label="运营部" value="operation" />
                <el-option label="销售部" value="sales" />
                <el-option label="管理层" value="management" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="职位">
              <el-input v-model="userInfo.position" placeholder="请输入职位" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveProfile">保存资料</el-button>
              <el-button @click="resetProfile">重置</el-button>
              <el-button @click="fetchUserInfo">刷新用户信息</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>
    
    <el-card class="password-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>密码修改</span>
        </div>
      </template>
      
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px" style="max-width: 500px;">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入当前密码" />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="changePassword">修改密码</el-button>
          <el-button @click="resetPasswordForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="preferences-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>偏好设置</span>
        </div>
      </template>
      
      <el-form :model="preferences" label-width="120px" style="max-width: 600px;">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主题风格">
              <el-radio-group v-model="preferences.theme">
                <el-radio value="light">明亮</el-radio>
                <el-radio value="dark">暗黑</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="语言设置">
              <el-select v-model="preferences.language" placeholder="选择显示语言">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="时间格式">
              <el-radio-group v-model="preferences.timeFormat">
                <el-radio value="12h">12小时制</el-radio>
                <el-radio value="24h">24小时制</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="日期格式">
              <el-select v-model="preferences.dateFormat" placeholder="选择日期格式">
                <el-option label="YYYY-MM-DD" value="yyyy-mm-dd" />
                <el-option label="YYYY/MM/DD" value="yyyy/mm/dd" />
                <el-option label="DD/MM/YYYY" value="dd/mm/yyyy" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="接收通知">
          <el-switch v-model="preferences.receiveNotifications" />
        </el-form-item>
        
        <el-form-item label="桌面提醒">
          <el-switch v-model="preferences.desktopAlerts" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="savePreferences">保存偏好设置</el-button>
          <el-button @click="resetPreferences">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 图像裁剪对话框 -->
    <el-dialog
      v-model="showCropperDialog"
      title="裁剪头像"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="cancelCrop"
      destroy-on-close
    >
      <div v-if="objectUrl" class="image-cropper-container">
        <div class="image-preview-wrapper">
          <img 
            ref="previewImageRef" 
            :src="objectUrl" 
            alt="头像预览" 
            class="preview-image"
            :style="{ 
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }"
            @load="initCropper"
            @error="onImageError"
            @mouseenter="onImageMouseEnter"
          />
          <div>
            class="crop-area" 
            :style="cropAreaStyle"
          ></div>
        </div>
        <div class="controls">
          <el-slider 
            v-model="scale" 
            :min="0.1" 
            :max="2" 
            :step="0.01" 
            show-input
            style="width: 300px; margin-right: 20px;"
          />
          <span>缩放: {{ scale.toFixed(2) }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="rotateImage">旋转</el-button>
        <el-button @click="cancelCrop">取消</el-button>
        <el-button type="primary" @click="confirmCrop">确认裁剪</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import service from '@/api/http'




// 用户信息
const userInfo = reactive({
  username: '',
  realName: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  avatar: ''
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单引用
const passwordFormRef = ref()

// 密码规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 偏好设置
const preferences = reactive({
  theme: 'light',
  language: 'zh-CN',
  timeFormat: '24h',
  dateFormat: 'yyyy-mm-dd',
  receiveNotifications: true,
  desktopAlerts: true
})

import { updateUserProfile, updatePassword, getUserInfo } from '@/api/user'

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    console.log('正在获取用户信息...')
    const response: any = await getUserInfo()
    console.log('原始响应:', response)
    
    // 根据实际API响应结构调整（根据store/user.ts的逻辑）
    let userData;
    if (response && typeof response === 'object') {
      // 检查是否是包含用户信息的对象
      if (response.user && typeof response.user === 'object') {
        // 响应格式为 {user: {...}, roles: [...], permissions: [...]}
        userData = response.user;
        console.log('从response.user提取数据:', userData)
      } else if (response.data && typeof response.data === 'object') {
        // 响应格式为 {code: 200, msg: "success", data: {user: {...}}}
        if (response.data.user && typeof response.data.user === 'object') {
          userData = response.data.user;
          console.log('从response.data.user提取数据:', userData)
        } else {
          // 响应格式为 {code: 200, msg: "success", data: {...}}
          userData = response.data;
          console.log('从response.data提取数据:', userData)
        }
      } else {
        // 直接使用响应对象
        userData = response;
        console.log('使用直接响应数据:', userData)
      }
    } else {
      console.error('用户信息响应格式不正确', response);
      ElMessage.error('用户信息响应格式不正确');
      return;
    }
    
    userInfo.username = userData.username || userData.name || userData.nickname || userData.userName || ''
    userInfo.realName = userData.realName || userData.fullname || userData.real_name || userData.fullName || ''
    userInfo.email = userData.email || ''
    userInfo.phone = userData.phone || userData.phoneNumber || userData.phone_number || ''
    userInfo.department = userData.department || userData.dept || ''
    userInfo.position = userData.position || userData.jobTitle || ''
    // 处理头像URL，区分不同类型的URL
    let avatarUrl = userData.avatar || userData.headImg || userData.head_img || userData.avatarUrl || userData.avatar_url
    console.log('原始头像URL:', avatarUrl)
    console.log('从userData中获取的avatar字段:', userData.avatar)
    
    if (avatarUrl) {
      if (avatarUrl.startsWith('data:image')) {
        // 如果是base64格式，直接使用
        userInfo.avatar = avatarUrl;
        console.log('使用base64头像')
      } else if (avatarUrl.startsWith('/')) {
        // 如果是根路径开头的相对路径，加上基础API URL
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        userInfo.avatar = `${baseUrl}${avatarUrl}`;
        console.log('使用处理后的相对路径头像:', userInfo.avatar)
      } else if (!avatarUrl.startsWith('http') && !avatarUrl.startsWith('//')) {
        // 如果是其他相对路径，加上基础API URL
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        userInfo.avatar = `${baseUrl}/${avatarUrl}`;
        console.log('使用处理后的其他相对路径头像:', userInfo.avatar)
      } else {
        // 绝对路径，直接使用
        userInfo.avatar = avatarUrl;
        console.log('使用绝对路径头像')
      }
    } else {
      // 默认头像
      userInfo.avatar = 'https://cube.elemecdn.com/0/88/03b0d39583f4c99b3a30486abba70jpeg.jpeg';
      console.log('使用默认头像')
    }
    
    console.log('最终设置的头像URL:', userInfo.avatar)
    console.log('用户信息已更新:', userInfo)
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    console.error('错误详情:', error.message || error)
    ElMessage.error(`获取用户信息失败: ${error.message || '未知错误'}`)
  }
}

// 保存个人资料
const saveProfile = async () => {
  try {
    // 检查头像是否为base64格式，如果是，则需要特殊处理
    if (userInfo.avatar && userInfo.avatar.startsWith('data:image')) {
      // 对于base64格式的头像，尝试将其转换为文件并上传
      try {
        // 将base64转换为Blob
        const arr = userInfo.avatar.split(',')
        const mimeMatch = arr[0].match(/:(.*?);/)
        if (!mimeMatch) {
          throw new Error('无法解析头像MIME类型')
        }
        const mime = mimeMatch[1]
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        const avatarFile = new File([u8arr], `avatar_${Date.now()}.${mime.split('/')[1]}`, { type: mime })
        
        // 创建FormData来发送文件
        const formData = new FormData()
        formData.append('avatar', avatarFile)
        
        // 尝试上传头像
        const avatarResponse = await service.post('/api/user/upload-avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        // 从响应中获取上传后的头像URL
        const avatarUrl = avatarResponse.data?.data?.url || avatarResponse.data?.avatarUrl
        
        // 然后更新其他用户信息（包含新的头像URL）
        const profileData = {
          username: userInfo.username,
          realName: userInfo.realName,
          email: userInfo.email,
          phone: userInfo.phone,
          department: userInfo.department,
          position: userInfo.position,
          avatar: avatarUrl
        }
        
        await updateUserProfile(profileData)
      } catch (uploadError) {
        console.error('头像上传失败，尝试直接保存用户信息:', uploadError)
        // 如果头像上传失败，尝试直接保存其他用户信息，不包含头像字段以避免覆盖现有头像
        const profileData = {
          username: userInfo.username,
          realName: userInfo.realName,
          email: userInfo.email,
          phone: userInfo.phone,
          department: userInfo.department,
          position: userInfo.position
          // 注意：不包含avatar字段，这样后端可以选择性地更新字段而不改变头像
        }
        
        await updateUserProfile(profileData)
      }
    } else {
      // 如果头像不是base64格式（即URL），则按常规方式更新
      // 动态构建请求对象，只包含有值的字段
      const profileData: any = {
        username: userInfo.username,
        realName: userInfo.realName,
        email: userInfo.email,
        phone: userInfo.phone,
        department: userInfo.department,
        position: userInfo.position
      }
      
      // 只有当头像有有效值时才包含它
      if (userInfo.avatar && userInfo.avatar.trim() !== '' && !userInfo.avatar.startsWith('data:image')) {
        profileData.avatar = userInfo.avatar
      }
      
      await updateUserProfile(profileData)
    }
    
    ElMessage.success('个人资料保存成功')
  } catch (error) {
    console.error('保存个人资料失败:', error)
    ElMessage.error('保存个人资料失败，请重试')
  }
}

// 重置个人资料
const resetProfile = () => {
  Object.assign(userInfo, {
    username: 'admin',
    realName: '管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    department: 'tech',
    position: '系统管理员',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f4c99b3a30486abba70jpeg.jpeg'
  })
  ElMessage.info('个人资料已重置')
}

// 修改密码
const changePassword = async () => {
  passwordFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        ElMessage.error('两次输入密码不一致')
        return
      }
      try {
        await updatePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        ElMessage.success('密码修改成功')
        // 重置表单
        passwordForm.oldPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
      } catch (error) {
        console.error('修改密码失败:', error)
        ElMessage.error('修改密码失败，请重试')
      }
    } else {
      ElMessage.error('请填写正确的表单信息')
    }
  })
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value.clearValidate()
}

// 保存偏好设置
const savePreferences = () => {
  ElMessage.success('偏好设置保存成功')
}

// 重置偏好设置
const resetPreferences = () => {
  Object.assign(preferences, {
    theme: 'light',
    language: 'zh-CN',
    timeFormat: '24h',
    dateFormat: 'yyyy-mm-dd',
    receiveNotifications: true,
    desktopAlerts: true
  })
  ElMessage.info('偏好设置已重置')
}

// 裁剪相关状态
const showCropperDialog = ref(false)
let tempFile: File | null = null
const objectUrl = ref<string | null>(null)
const uploadRef = ref()

// 新增裁剪功能所需的状态
const previewImageRef = ref<HTMLImageElement>()
const scale = ref(1) // 图像缩放比例
const rotation = ref(0) // 图像旋转角度
const cropSize = ref(200) // 裁剪区域大小 (像素)
const imgNaturalWidth = ref(0)
const imgNaturalHeight = ref(0)



// 处理文件变化
const handleFileChange = (file: any) => {
  console.log('handleFileChange 被调用', file)
  const rawFile = file.raw || file
  
  if (!rawFile) {
    console.error('未找到原始文件', file)
    ElMessage.error('未找到原始文件')
    return
  }
  
  console.log('获取到原始文件:', rawFile)
  
  // 验证文件类型和大小
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const isImage = allowedTypes.includes(rawFile.type)
  const isLt2M = rawFile.size / 1024 / 1024 < 2

  if (!isImage) {
    console.error('文件类型不支持:', rawFile.type)
    ElMessage.error('只能上传 JPG/PNG/GIF/WEBP 格式的图片!')
    return
  }
  if (!isLt2M) {
    console.error('文件太大:', rawFile.size)
    ElMessage.error('图片大小不能超过 2MB!')
    return
  }
  
  console.log('文件验证通过，准备打开裁剪对话框')
  
  // 保存临时文件并创建对象URL用于预览
  tempFile = rawFile
  objectUrl.value = URL.createObjectURL(rawFile)
  console.log('创建对象URL:', objectUrl.value)
  
  // 清除上传组件中的文件列表，避免显示文件名
  nextTick(() => {
    if (uploadRef.value) {
      uploadRef.value!.clearFiles()
      console.log('已清除上传文件列表')
    }
    
    // 显示对话框
     showCropperDialog.value = true
     console.log('裁剪对话框已打开，objectUrl:', objectUrl.value)
     // 使用 nextTick 等待 DOM 更新，然后初始化裁剪器
     nextTick(() => {
       // 使用强制初始化函数来确保裁剪器正确初始化
       setTimeout(() => {
         forceInitCropper()
       }, 300) // 给图像和对话框一些时间来渲染
     })
  })
}

// 计算属性：裁剪区域样式
const cropAreaStyle = computed(() => {
  // 固定裁剪框在容器中央
  const containerSize = 400 // 预览容器尺寸
  const left = (containerSize - cropSize.value) / 2
  const top = (containerSize - cropSize.value) / 2
  
  return {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    width: `${cropSize.value}px`,
    height: `${cropSize.value}px`,
    border: '2px solid #fff',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
    zIndex: 10,
    'pointer-events': 'none' // 禁用鼠标事件，因为我们不需要拖动
  }
})

// 初始化裁剪器
const initCropper = () => {
  console.log('initCropper 被调用')
  const img = previewImageRef.value
  if (img) {
    console.log('图像元素:', img)
    console.log('图像自然尺寸:', img.naturalWidth, 'x', img.naturalHeight)
    imgNaturalWidth.value = img.naturalWidth
    imgNaturalHeight.value = img.naturalHeight
    
    // 根据图片尺寸调整初始缩放
    const containerSize = 400
    const scaleX = containerSize / imgNaturalWidth.value
    const scaleY = containerSize / imgNaturalHeight.value
    scale.value = Math.min(scaleX, scaleY) * 0.9 // 留一点边距
    console.log('设置初始缩放:', scale.value)
  } else {
    console.error('无法获取图像元素')
  }
}

// 强制初始化裁剪器（如果图像加载事件没有触发）
const forceInitCropper = () => {
  console.log('强制初始化裁剪器')
  // 使用 nextTick 确保 DOM 更新完成
  nextTick(() => {
    const img = previewImageRef.value
    if (img) {
      console.log('图像元素存在，complete状态:', img.complete, 'naturalWidth:', img.naturalWidth, 'naturalHeight:', img.naturalHeight)
      if (img.complete) {
        // 图像已经加载完成
        console.log('图像已加载完成，初始化裁剪器')
        imgNaturalWidth.value = img.naturalWidth
        imgNaturalHeight.value = img.naturalHeight
        
        // 根据图片尺寸调整初始缩放
        const containerSize = 400
        const scaleX = containerSize / imgNaturalWidth.value
        const scaleY = containerSize / imgNaturalHeight.value
        scale.value = Math.min(scaleX, scaleY) * 0.9 // 留一点边距
        console.log('设置初始缩放:', scale.value)
      } else {
        // 图像还在加载，设置定时器继续检查
        console.log('图像仍在加载中，等待...')
        setTimeout(forceInitCropper, 100)
      }
    } else {
      console.log('图像元素不存在，可能DOM还未更新')
      // 再次尝试
      setTimeout(forceInitCropper, 100)
    }
  })
}

// 图像加载错误处理
const onImageError = (e: Event) => {
  console.error('图像加载失败:', e)
  console.log('当前objectUrl:', objectUrl.value)
}

// 图像鼠标悬停处理（调试用）
const onImageMouseEnter = () => {
  console.log('鼠标悬停在图像上')
  const img = previewImageRef.value
  if (img) {
    console.log('图像状态 - complete:', img.complete, 'width:', img.width, 'height:', img.height, 'naturalWidth:', img.naturalWidth, 'naturalHeight:', img.naturalHeight)
  }
}

// 旋转图像
const rotateImage = () => {
  rotation.value = (rotation.value + 90) % 360
}



// 确认裁剪
const confirmCrop = async () => {
  console.log('确认裁剪被调用')
  try {
    if (previewImageRef.value) {
      // 创建canvas元素进行图像裁剪
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('无法获取canvas上下文')
      }

      // 设置canvas尺寸为头像尺寸
      const targetSize = 200
      canvas.width = targetSize
      canvas.height = targetSize
      
      const img = previewImageRef.value
      
      // 创建临时canvas来处理旋转
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      
      if (!tempCtx) {
        throw new Error('无法获取临时canvas上下文')
      }
      
      // 计算旋转后的图像尺寸
      const angleRad = rotation.value * Math.PI / 180
      const sin = Math.abs(Math.sin(angleRad))
      const cos = Math.abs(Math.cos(angleRad))
      
      // 计算旋转后图像的实际尺寸
      const rotatedWidth = img.naturalWidth * cos + img.naturalHeight * sin
      const rotatedHeight = img.naturalWidth * sin + img.naturalHeight * cos
      
      // 设置临时canvas尺寸
      tempCanvas.width = rotatedWidth
      tempCanvas.height = rotatedHeight
      
      // 在临时canvas上绘制旋转后的图像
      tempCtx.clearRect(0, 0, rotatedWidth, rotatedHeight)
      tempCtx.save()
      tempCtx.translate(rotatedWidth / 2, rotatedHeight / 2)
      tempCtx.rotate(angleRad)
      tempCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
      tempCtx.restore()
      
      // 计算缩放后的尺寸
      const scaledWidth = rotatedWidth * scale.value
      const scaledHeight = rotatedHeight * scale.value
      
      // 确定从旋转后的图像中裁剪的区域
      let sx, sy, sWidth, sHeight // 源图像的裁剪参数
      let dx = 0, dy = 0, dWidth, dHeight // 目标画布的绘制参数
      
      // 根据缩放级别确定裁剪区域
      if (scaledWidth > targetSize || scaledHeight > targetSize) {
        // 图像太大，需要裁剪中心部分
        sx = (rotatedWidth - targetSize / scale.value) / 2
        sy = (rotatedHeight - targetSize / scale.value) / 2
        sWidth = targetSize / scale.value
        sHeight = targetSize / scale.value
        dWidth = targetSize
        dHeight = targetSize
      } else {
        // 图像较小，居中放置
        sx = 0
        sy = 0
        sWidth = rotatedWidth
        sHeight = rotatedHeight
        dWidth = scaledWidth
        dHeight = scaledHeight
        dx = (targetSize - scaledWidth) / 2
        dy = (targetSize - scaledHeight) / 2
      }
      
      // 在目标canvas上绘制裁剪后的图像
      ctx.fillStyle = '#ffffff' // 白色背景
      ctx.fillRect(0, 0, targetSize, targetSize)
      
      // 从旋转后的图像中裁剪并绘制到目标canvas
      ctx.drawImage(
        tempCanvas,
        sx, sy, sWidth, sHeight,  // 源图像区域
        dx, dy, dWidth, dHeight   // 目标画布区域
      )
      
      // 将canvas转换为base64图像数据
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      
      if (dataUrl) {
        console.log('裁剪数据获取成功:', dataUrl.substring(0, 50) + '...')
        userInfo.avatar = dataUrl
        console.log('头像已更新到userInfo:', userInfo.avatar.substring(0, 50) + '...')
        ElMessage.success('头像已更新')
      }
    }
    
    showCropperDialog.value = false
    if (objectUrl.value) {
      URL.revokeObjectURL(objectUrl.value) // 清理对象URL
      objectUrl.value = null
    }
    tempFile = null
  } catch (error) {
    console.error('裁剪过程中发生错误:', error)
    ElMessage.error('裁剪失败，请重试')
    showCropperDialog.value = false
  }
}



// 取消裁剪
const cancelCrop = () => {
  showCropperDialog.value = false
  // 确保在下一个tick中清理资源，避免组件仍在使用时就被销毁
  setTimeout(() => {
    if (objectUrl.value) {
      URL.revokeObjectURL(objectUrl.value) // 清理对象URL
      objectUrl.value = null
    }
    tempFile = null
  }, 100)
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})

// 监视 objectUrl 变化，一旦变化就尝试初始化裁剪器
watch(() => objectUrl.value, (newVal) => {
  if (newVal) {
    console.log('objectUrl 发生变化，尝试初始化裁剪器')
    // 等待DOM更新后初始化
    nextTick(() => {
      setTimeout(() => {
        forceInitCropper()
      }, 200)
    })
  }
}, { immediate: false })

// 组件卸载时清理资源
onUnmounted(() => {
  // 清理可能存在的对象URL
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = null
  }
})
</script>

<style scoped>
.profile-settings-view {
  padding: 20px;
  background: var(--color-primary-medium);
  min-height: 100vh;
}

.image-cropper-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.image-preview-wrapper {
  position: relative;
  width: 400px;
  height: 400px;
  overflow: hidden;
  border: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  margin-bottom: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transform-origin: center;
  transition: transform 0.1s ease;
  display: block; /* 确保图像正确显示 */
}

.crop-area {
  box-sizing: border-box;
  pointer-events: auto;
}

.controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-card, .password-card, .preferences-card {
  background: var(--card-bg) !important;
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 8px !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-btn {
  position: absolute;
  margin-left: 80px;
  margin-top: 80px;
}

.upload-icon {
  width: 30px;
  height: 30px;
  padding: 0;
}

.el-form-item {
  margin-bottom: 20px;
}

.cropper-container {
  text-align: center;
}
</style>
