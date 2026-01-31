<template>
  <div class="notification-settings">
    <el-card class="settings-card" header="报警通知设置">
      <el-form :model="settings" label-width="120px" class="settings-form">
        <!-- 短信通知设置 -->
        <el-form-item label="短信通知">
          <el-switch v-model="settings.smsEnabled" @change="handleSmsChange" />
          <span class="setting-desc">开启后，高优先级报警将自动发送短信</span>
        </el-form-item>
        
        <el-form-item v-if="settings.smsEnabled" label="接收手机号">
          <el-input 
            v-model="settings.phoneNumbers" 
            placeholder="请输入手机号，多个用逗号分隔"
            style="width: 300px;"
          />
          <el-button type="primary" size="small" @click="testSms" style="margin-left: 10px;">
            测试短信
          </el-button>
        </el-form-item>
        
        <!-- 声音提醒设置 -->
        <el-form-item label="声音提醒">
          <el-switch v-model="settings.soundEnabled" />
          <span class="setting-desc">收到优先报警时播放提示音</span>
        </el-form-item>
        
        <!-- 震动提醒设置 -->
        <el-form-item label="震动提醒">
          <el-switch v-model="settings.vibrationEnabled" />
          <span class="setting-desc">移动端收到报警时震动提醒</span>
        </el-form-item>
        
        <!-- 弹窗通知设置 -->
        <el-form-item label="弹窗通知">
          <el-switch v-model="settings.popupEnabled" />
          <span class="setting-desc">优先报警显示弹窗通知</span>
        </el-form-item>
        
        <!-- 通知级别设置 -->
        <el-form-item label="通知级别">
          <el-checkbox-group v-model="settings.notifyLevels">
            <el-checkbox label="high">高优先级</el-checkbox>
            <el-checkbox label="medium">中优先级</el-checkbox>
            <el-checkbox label="low">低优先级</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <!-- 推送频率设置 -->
        <el-form-item label="推送频率">
          <el-radio-group v-model="settings.pushFrequency">
            <el-radio label="immediate">实时推送</el-radio>
            <el-radio label="batch">批量推送（5分钟）</el-radio>
            <el-radio label="summary">摘要推送（每小时）</el-radio>
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
    
    <!-- 短信模板设置 -->
    <el-card class="template-card" header="短信模板设置">
      <el-form :model="smsTemplates" label-width="100px">
        <el-form-item label="高优先级">
          <el-input 
            v-model="smsTemplates.high" 
            type="textarea" 
            :rows="2"
            placeholder="【IoT系统】紧急报警！设备：{device}，级别：{level}，内容：{content}"
          />
        </el-form-item>
        
        <el-form-item label="中优先级">
          <el-input 
            v-model="smsTemplates.medium" 
            type="textarea" 
            :rows="2"
            placeholder="【IoT系统】重要报警！设备：{device}，内容：{content}"
          />
        </el-form-item>
        
        <el-form-item label="低优先级">
          <el-input 
            v-model="smsTemplates.low" 
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

// 通知设置
const settings = reactive({
  smsEnabled: false,
  phoneNumbers: '',
  soundEnabled: true,
  vibrationEnabled: true,
  popupEnabled: true,
  notifyLevels: ['high', 'medium'],
  pushFrequency: 'immediate',
  quietHours: ['22:00', '07:00']
})

// 短信模板
const smsTemplates = reactive({
  high: '【IoT系统】紧急报警！设备：{device}，级别：{level}，内容：{content}',
  medium: '【IoT系统】重要报警！设备：{device}，内容：{content}',
  low: '【IoT系统】一般报警！设备：{device}，内容：{content}'
})

// 加载设置
const loadSettings = async () => {
  try {
    // 这里应该从后端API加载用户设置
    const savedSettings = localStorage.getItem('alarmNotificationSettings')
    if (savedSettings) {
      Object.assign(settings, JSON.parse(savedSettings))
    }
    
    const savedTemplates = localStorage.getItem('smsTemplates')
    if (savedTemplates) {
      Object.assign(smsTemplates, JSON.parse(savedTemplates))
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 保存设置
const saveSettings = async () => {
  try {
    localStorage.setItem('alarmNotificationSettings', JSON.stringify(settings))
    ElMessage.success('设置保存成功')
  } catch (error) {
    ElMessage.error('保存设置失败')
  }
}

// 保存模板
const saveTemplates = async () => {
  try {
    localStorage.setItem('smsTemplates', JSON.stringify(smsTemplates))
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
      smsEnabled: false,
      phoneNumbers: '',
      soundEnabled: true,
      vibrationEnabled: true,
      popupEnabled: true,
      notifyLevels: ['high', 'medium'],
      pushFrequency: 'immediate',
      quietHours: ['22:00', '07:00']
    })
    ElMessage.success('设置已恢复默认')
  })
}

// 测试短信
const testSms = async () => {
  if (!settings.phoneNumbers) {
    ElMessage.warning('请先输入手机号')
    return
  }
  
  try {
    // 这里应该调用后端API发送测试短信
    ElMessage.success('测试短信发送成功')
  } catch (error) {
    ElMessage.error('测试短信发送失败')
  }
}

// 短信开关变化
const handleSmsChange = (enabled: boolean) => {
  if (enabled && !settings.phoneNumbers) {
    ElMessage.info('请设置接收手机号')
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