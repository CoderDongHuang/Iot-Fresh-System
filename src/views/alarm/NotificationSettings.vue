<template>
  <div class="notification-settings">
    <el-card class="settings-card" header="报警通知设置">
      <el-form label-width="120px" class="settings-form">
        <!-- 邮件通知设置 -->
        <el-form-item label="邮件通知">
          <el-switch v-model="emailSettings.enabled" @change="handleEmailChange" />
          <span class="setting-desc">开启后，高优先级报警将自动发送邮件</span>
        </el-form-item>
        
        <el-form-item v-if="emailSettings.enabled" label="接收邮箱">
          <el-input 
            v-model="emailAddressesInput" 
            placeholder="请输入邮箱地址，多个用逗号分隔"
            style="width: 300px;"
            @blur="updateEmailAddresses"
          />
          <el-button type="primary" size="small" @click="testEmail" style="margin-left: 10px;">
            测试邮件
          </el-button>
        </el-form-item>
        
        <!-- 钉钉机器人通知设置 -->
        <el-form-item label="钉钉机器人通知">
          <el-switch v-model="dingTalkSettings.enabled" />
          <span class="setting-desc">开启后，高优先级报警将发送到钉钉群</span>
        </el-form-item>
        
        <el-form-item v-if="dingTalkSettings.enabled" label="Webhook地址">
          <el-input 
            v-model="dingTalkSettings.webhookUrl" 
            placeholder="请输入钉钉机器人Webhook地址"
            style="width: 400px;"
          />
        </el-form-item>
        
        <el-form-item v-if="dingTalkSettings.enabled" label="加签密钥">
          <el-input 
            v-model="dingTalkSettings.secret" 
            placeholder="请输入钉钉机器人加签密钥"
            style="width: 300px;"
            type="password"
            show-password
          />
          <el-button type="primary" size="small" @click="testDingTalk" style="margin-left: 10px;">
            测试机器人
          </el-button>
        </el-form-item>
        
        <!-- 声音提醒设置 -->
        <el-form-item label="声音提醒">
          <el-switch v-model="otherSettings.soundEnabled" />
          <span class="setting-desc">收到优先报警时播放提示音</span>
        </el-form-item>
        
        <!-- 震动提醒设置 -->
        <el-form-item label="震动提醒">
          <el-switch v-model="otherSettings.vibrationEnabled" />
          <span class="setting-desc">移动端收到报警时震动提醒</span>
        </el-form-item>
        
        <!-- 弹窗通知设置 -->
        <el-form-item label="弹窗通知">
          <el-switch v-model="otherSettings.popupEnabled" />
          <span class="setting-desc">优先报警显示弹窗通知</span>
        </el-form-item>
        
        <!-- 通知级别设置 -->
        <el-form-item label="通知级别">
          <el-checkbox-group v-model="settings.notifyLevels">
            <el-checkbox value="high">高优先级</el-checkbox>
            <el-checkbox value="medium">中优先级</el-checkbox>
            <el-checkbox value="low">低优先级</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <!-- 推送频率设置 -->
        <el-form-item label="推送频率">
          <el-radio-group v-model="settings.pushFrequency">
            <el-radio value="immediate">实时推送</el-radio>
            <el-radio value="batch">批量推送（5分钟）</el-radio>
            <el-radio value="summary">摘要推送（每小时）</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 免打扰时段 -->
        <el-form-item label="免打扰时段">
          <el-time-picker
            v-model="settings.quietHours"
            is-range
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择时间范围"
            format="HH:mm"
            value-format="HH:mm"
          />
          <span class="setting-desc">此时间段内不发送声音和弹窗通知</span>
        </el-form-item>
        
        <!-- 保存按钮 -->
        <el-form-item>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
          <el-button @click="resetSettings">恢复默认</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 邮件模板设置 -->
    <el-card class="template-card" header="邮件模板设置">
      <el-form :model="emailTemplates" label-width="100px">
        <el-form-item label="高优先级">
          <el-input 
            v-model="emailTemplates.high" 
            type="textarea" 
            :rows="2"
            placeholder="【IoT系统】紧急报警！设备：{device}，级别：{level}，内容：{content}"
          />
        </el-form-item>
        
        <el-form-item label="中优先级">
          <el-input 
            v-model="emailTemplates.medium" 
            type="textarea" 
            :rows="2"
            placeholder="【IoT系统】重要报警！设备：{device}，内容：{content}"
          />
        </el-form-item>
        
        <el-form-item label="低优先级">
          <el-input 
            v-model="emailTemplates.low" 
            type="textarea" 
            :rows="2"
            placeholder="【IoT系统】一般报警！设备：{device}，内容：{content}"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveTemplates">保存模板</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getEmailSettings, 
  saveEmailSettings, 
  testEmail as testEmailApi,
  getEmailTemplates,
  saveEmailTemplates,
  type EmailSettings as EmailSettingsType,
  type EmailTemplates as EmailTemplatesType
} from '@/api/email'
import {
  getDingTalkSettings,
  saveDingTalkSettings,
  testDingTalk as testDingTalkApi,
  type DingTalkSettings as DingTalkSettingsType
} from '@/api/dingtalk'

// 邮件通知设置
const emailSettings = reactive<EmailSettingsType>({
  enabled: false,
  emailAddresses: [],
  notifyLevels: ['high', 'medium'],
  pushFrequency: 'immediate',
  quietHours: ['22:00', '07:00']
})

// 钉钉机器人设置
const dingTalkSettings = reactive<DingTalkSettingsType>({
  enabled: false,
  webhookUrl: 'https://oapi.dingtalk.com/robot/send?access_token=6bcee6966a2900452463499e8ed74b44bfaab5612c95a2e6ff1c594efc81c6d6',
  secret: 'SECe483d14820a3d1e4e93338ac2aaa860852bcbc4f8eb81f928daab259722fcdb1',
  notifyLevels: ['high', 'medium'],
  quietHours: ['22:00', '07:00']
})

// 其他通知设置
const otherSettings = reactive({
  soundEnabled: true,
  vibrationEnabled: true,
  popupEnabled: true
})

// 统一设置变量（兼容旧代码）
const settings = emailSettings

// 邮件模板
const emailTemplates = reactive<EmailTemplatesType>({
  high: '【IoT系统】紧急报警！设备：{device}，级别：{level}，内容：{content}',
  medium: '【IoT系统】重要报警！设备：{device}，内容：{content}',
  low: '【IoT系统】一般报警！设备：{device}，内容：{content}'
})

// 邮箱地址输入框的临时值
const emailAddressesInput = ref('')

// 更新邮箱地址列表
const updateEmailAddresses = () => {
  if (emailAddressesInput.value.trim()) {
    settings.emailAddresses = emailAddressesInput.value
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0 && email.includes('@'))
  }
}

// 加载设置
const loadSettings = async () => {
  try {
    console.log('开始加载通知设置...')
    
    // 从后端API加载用户设置
    const [emailSettingsResponse, emailTemplatesResponse, dingTalkSettingsResponse] = await Promise.all([
      getEmailSettings(),
      getEmailTemplates(),
      getDingTalkSettings()
    ])
    
    console.log('🔍 邮件设置API原始响应:', emailSettingsResponse)
    console.log('🔍 邮件模板API原始响应:', emailTemplatesResponse)
    console.log('🔍 钉钉设置API原始响应:', dingTalkSettingsResponse)
    
    // 详细检查响应结构
    console.log('🔍 邮件设置响应类型:', typeof emailSettingsResponse)
    console.log('🔍 邮件设置响应内容:', JSON.stringify(emailSettingsResponse, null, 2))
    
    // 加载邮件设置
    if (emailSettingsResponse && emailSettingsResponse.data) {
      console.log('✅ 邮件设置data字段存在:', emailSettingsResponse.data)
      Object.assign(settings, emailSettingsResponse.data)
      
      // 检查邮箱数组是否存在
      if (settings.emailAddresses && Array.isArray(settings.emailAddresses)) {
        emailAddressesInput.value = settings.emailAddresses.join(', ')
        console.log('✅ 邮箱回显成功:', emailAddressesInput.value)
      } else {
        console.warn('⚠️ 邮箱数组不存在或格式错误，使用默认邮箱')
        settings.emailAddresses = ['1218798773@qq.com']
        emailAddressesInput.value = settings.emailAddresses.join(', ')
      }
      
      console.log('✅ 邮件设置加载成功:', settings)
    } else {
      console.warn('⚠️ 邮件设置data字段不存在，使用默认设置')
      // 使用默认设置确保界面有数据显示
      settings.enabled = true
      settings.emailAddresses = ['1218798773@qq.com']
      settings.notifyLevels = ['high', 'medium', 'low']
      settings.pushFrequency = 'immediate'
      settings.quietHours = ['22:00', '07:00']
      emailAddressesInput.value = settings.emailAddresses.join(', ')
      console.log('✅ 使用默认设置:', settings)
    }
    
    // 加载邮件模板
    if (emailTemplatesResponse && emailTemplatesResponse.data) {
      Object.assign(emailTemplates, emailTemplatesResponse.data)
      console.log('✅ 邮件模板加载成功:', emailTemplates)
    }
    
    // 加载钉钉设置
    if (dingTalkSettingsResponse && dingTalkSettingsResponse.data) {
      console.log('✅ 钉钉设置data字段存在:', dingTalkSettingsResponse.data)
      Object.assign(dingTalkSettings, dingTalkSettingsResponse.data)
      console.log('✅ 钉钉设置加载成功:', dingTalkSettings)
    } else {
      console.warn('⚠️ 钉钉设置data字段不存在，使用默认设置')
      // 使用默认设置确保界面有数据显示
      dingTalkSettings.enabled = false
      dingTalkSettings.webhookUrl = ''
      dingTalkSettings.secret = ''
      dingTalkSettings.notifyLevels = ['high', 'medium']
      dingTalkSettings.quietHours = ['22:00', '07:00']
      console.log('✅ 使用钉钉默认设置:', dingTalkSettings)
    }
    
    // 加载其他设置（本地存储）
    const savedOtherSettings = localStorage.getItem('alarmNotificationOtherSettings')
    if (savedOtherSettings) {
      Object.assign(otherSettings, JSON.parse(savedOtherSettings))
    }
    
    console.log('✅ 设置加载完成，界面应该可以正常显示')
  } catch (error: any) {
    console.error('❌ 加载设置失败:', error)
    console.error('❌ 错误详情:', error.response || error)
    
    // 即使出错，也确保界面有数据显示
    settings.enabled = true
    settings.emailAddresses = ['1218798773@qq.com']
    settings.notifyLevels = ['high', 'medium', 'low']
    emailAddressesInput.value = settings.emailAddresses.join(', ')
    console.log('✅ 使用默认设置确保界面显示:', settings)
  }
}

// 保存设置
const saveSettings = async () => {
  try {
    updateEmailAddresses()
    
    console.log('保存邮件设置:', settings)
    console.log('保存钉钉设置:', dingTalkSettings)
    
    // 同时保存邮件设置和钉钉设置到后端
    const [emailResponse, dingTalkResponse] = await Promise.all([
      saveEmailSettings(settings),
      saveDingTalkSettings(dingTalkSettings)
    ])
    
    console.log('保存邮件设置API响应:', emailResponse)
    console.log('保存钉钉设置API响应:', dingTalkResponse)
    
    // 保存其他设置到本地存储
    localStorage.setItem('alarmNotificationOtherSettings', JSON.stringify(otherSettings))
    
    ElMessage.success('设置保存成功')
  } catch (error: any) {
    console.error('保存设置失败 - 完整错误:', error)
    console.error('保存设置失败 - 响应数据:', error.response?.data)
    console.error('保存设置失败 - 状态码:', error.response?.status)
    console.error('保存设置失败 - 请求URL:', error.config?.url)
    
    let errorMessage = '保存设置失败'
    if (error.response?.status === 404) {
      errorMessage = '设置API接口不存在，请检查后端实现'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请检查后端日志'
    } else if (error.message) {
      errorMessage = `保存设置失败: ${error.message}`
    }
    
    ElMessage.error(errorMessage)
  }
}

// 保存模板
const saveTemplates = async () => {
  try {
    await saveEmailTemplates(emailTemplates)
    ElMessage.success('模板保存成功')
  } catch (error) {
    ElMessage.error('保存模板失败')
  }
}

// 重置设置
const resetSettings = () => {
  ElMessageBox.confirm('确定要恢复默认设置吗？', '确认重置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    Object.assign(settings, {
      enabled: false,
      emailAddresses: [],
      notifyLevels: ['high', 'medium'],
      pushFrequency: 'immediate',
      quietHours: ['22:00', '07:00']
    })
    
    Object.assign(otherSettings, {
      soundEnabled: true,
      vibrationEnabled: true,
      popupEnabled: true
    })
    
    emailAddressesInput.value = ''
    ElMessage.success('设置已恢复默认')
  })
}

// 测试邮件
const testEmail = async () => {
  updateEmailAddresses()
  
  if (!settings.emailAddresses.length) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }
  
  try {
    console.log('测试邮件发送，邮箱:', settings.emailAddresses[0])
    
    // 调用后端API发送测试邮件
    const response = await testEmailApi(settings.emailAddresses[0])
    console.log('测试邮件API响应:', response)
    
    ElMessage.success('测试邮件发送成功')
  } catch (error: any) {
    console.error('测试邮件发送失败 - 完整错误:', error)
    console.error('测试邮件发送失败 - 响应数据:', error.response?.data)
    console.error('测试邮件发送失败 - 状态码:', error.response?.status)
    console.error('测试邮件发送失败 - 请求URL:', error.config?.url)
    
    let errorMessage = '测试邮件发送失败'
    if (error.response?.status === 404) {
      errorMessage = '邮件API接口不存在，请检查后端实现'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请检查后端日志'
    } else if (error.message) {
      errorMessage = `测试邮件发送失败: ${error.message}`
    }
    
    ElMessage.error(errorMessage)
  }
}

// 测试钉钉机器人
const testDingTalk = async () => {
  if (!dingTalkSettings.webhookUrl || !dingTalkSettings.secret) {
    ElMessage.warning('请先输入Webhook地址和加签密钥')
    return
  }
  
  try {
    console.log('测试钉钉机器人，Webhook:', dingTalkSettings.webhookUrl)
    
    // 调用后端API测试钉钉机器人
    const response = await testDingTalkApi({
      webhookUrl: dingTalkSettings.webhookUrl,
      secret: dingTalkSettings.secret
    })
    console.log('测试钉钉机器人API响应:', response)
    
    ElMessage.success('钉钉机器人测试成功')
  } catch (error: any) {
    console.error('测试钉钉机器人失败 - 完整错误:', error)
    console.error('测试钉钉机器人失败 - 响应数据:', error.response?.data)
    console.error('测试钉钉机器人失败 - 状态码:', error.response?.status)
    console.error('测试钉钉机器人失败 - 请求URL:', error.config?.url)
    
    let errorMessage = '测试钉钉机器人失败'
    if (error.response?.status === 404) {
      errorMessage = '钉钉机器人API接口不存在，请检查后端实现'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请检查后端日志'
    } else if (error.message) {
      errorMessage = `测试钉钉机器人失败: ${error.message}`
    }
    
    ElMessage.error(errorMessage)
  }
}

// 邮件开关变化
const handleEmailChange = (enabled: boolean) => {
  if (enabled && !settings.emailAddresses.length) {
    ElMessage.info('请设置接收邮箱')
  }
}

// 组件挂载时加载设置
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.notification-settings {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.settings-card {
  margin-bottom: 20px;
}

.template-card {
  margin-bottom: 20px;
}

.settings-form {
  max-width: 600px;
}

.setting-desc {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>