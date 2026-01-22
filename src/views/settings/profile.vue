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
            <el-avatar :size="120" :src="getDefaultAvatar()" />
            <div class="avatar-info">
              <span class="avatar-text">当前头像</span>
              <el-button type="primary" size="small" @click="showAvatarDialog = true" class="select-btn">
                <el-icon><Edit /></el-icon>
                选择头像
              </el-button>
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
    

    <!-- 头像选择对话框 -->
    <el-dialog
      v-model="showAvatarDialog"
      title="选择头像"
      width="600px"
      :close-on-click-modal="false"
      @close="cancelAvatarSelect"
    >
      <div class="avatar-selector">
        <div class="avatar-grid">
          <div 
            v-for="avatar in avatarList" 
            :key="avatar.id"
            class="avatar-item"
            :class="{ 'avatar-selected': selectedAvatar === avatar.url }"
            @click="selectAvatar(avatar.url)"
          >
            <el-avatar :size="60" :src="avatar.url" />
            <span class="avatar-name">{{ avatar.name }}</span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelAvatarSelect">取消</el-button>
          <el-button type="primary" @click="confirmAvatarSelect">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'




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
    // 使用用户选择的头像，如果数据库中有则使用，否则使用默认头像
    const avatarUrl = userData.avatar || userData.headImg || userData.head_img || userData.avatarUrl || userData.avatar_url
    if (avatarUrl && avatarList.some(avatar => avatar.url === avatarUrl)) {
      userInfo.avatar = avatarUrl
      selectedAvatar.value = avatarUrl
      console.log('使用用户选择的头像:', avatarUrl)
    } else {
      userInfo.avatar = getDefaultAvatar()
      console.log('使用默认头像')
    }
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    console.error('错误详情:', error.message || error)
    ElMessage.error(`获取用户信息失败: ${error.message || '未知错误'}`)
  }
}

// 保存个人资料
const saveProfile = async () => {
  try {
    // 保存用户信息，包含选择的头像URL
    const profileData = {
      username: userInfo.username,
      realName: userInfo.realName,
      email: userInfo.email,
      phone: userInfo.phone,
      department: userInfo.department,
      position: userInfo.position,
      avatar: userInfo.avatar || avatarList[0].url  // 保存头像URL到数据库
    }
    
    console.log('保存个人资料，发送的数据:', profileData)
    
    await updateUserProfile(profileData)
    ElMessage.success('个人资料保存成功')
  } catch (error: any) {
    console.error('保存个人资料失败:', error)
    ElMessage.error(`保存个人资料失败: ${error.message || '未知错误'}`)
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

// 默认头像列表 - 使用真实可用的头像图片
const avatarList = [
  // 人物头像（使用可靠的彩色头像）
  { id: 1, url: 'https://img.icons8.com/color/96/000000/user-male.png', name: '男生头像' },
  { id: 2, url: 'https://img.icons8.com/color/96/000000/user-female.png', name: '女生头像1' },
  { id: 3, url: 'https://img.icons8.com/color/96/000000/student-female.png', name: '女生头像2' },
  { id: 4, url: 'https://img.icons8.com/color/96/000000/businessman.png', name: '商务头像' },
  
  // 动物头像（使用知名网站的动物头像）
  { id: 5, url: 'https://img.icons8.com/color/96/000000/cat.png', name: '猫咪' },
  { id: 6, url: 'https://img.icons8.com/color/96/000000/dog.png', name: '狗狗' },
  { id: 7, url: 'https://img.icons8.com/color/96/000000/rabbit.png', name: '兔子' },
  { id: 8, url: 'https://img.icons8.com/color/96/000000/panda.png', name: '熊猫' },
  
  // 其他头像（使用知名图标库）
  { id: 9, url: 'https://img.icons8.com/color/96/000000/user-male-circle.png', name: '圆形头像1' },
  { id: 10, url: 'https://img.icons8.com/color/96/000000/user-female-circle.png', name: '圆形头像2' },
  { id: 11, url: 'https://img.icons8.com/color/96/000000/administrator-male.png', name: '管理员' },
  { id: 12, url: 'https://img.icons8.com/color/96/000000/guest-male.png', name: '访客' }
]

// 头像选择对话框状态
const showAvatarDialog = ref(false)
const selectedAvatar = ref('')

// 获取默认头像
const getDefaultAvatar = () => {
  return selectedAvatar.value || avatarList[0].url
}

// 选择头像
const selectAvatar = (avatarUrl: string) => {
  selectedAvatar.value = avatarUrl
}

// 确认头像选择
const confirmAvatarSelect = () => {
  if (selectedAvatar.value) {
    userInfo.avatar = selectedAvatar.value
    console.log('已选择头像:', selectedAvatar.value)
    ElMessage.success('头像选择成功')
  }
  showAvatarDialog.value = false
}

// 取消头像选择
const cancelAvatarSelect = () => {
  selectedAvatar.value = userInfo.avatar || ''
  showAvatarDialog.value = false
}









// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-settings-view {
  padding: 20px;
  background: var(--color-primary-medium);
  min-height: 100vh;
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

/* 头像容器样式 */
.avatar-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.avatar-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-text {
  font-size: 14px;
  color: #606266;
}

.select-btn {
  display: flex;
  align-items: center;
  gap: 5px;
}

.el-form-item {
  margin-bottom: 20px;
}

/* 头像选择器样式 */
.avatar-selector {
  padding: 20px 0;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.avatar-item:hover {
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.avatar-item.avatar-selected {
  border-color: #409eff;
  background: #f0f7ff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.avatar-name {
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
  text-align: center;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .avatar-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }
  
  .avatar-item {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .avatar-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
</style>
