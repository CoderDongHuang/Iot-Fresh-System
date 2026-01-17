<template>
  <div class="system-settings-view">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane name="general" label="常规设置">
        <el-card class="setting-card">
          <template #header>
            <div class="card-header">
              <span>常规设置</span>
            </div>
          </template>
          
          <el-form :model="generalSettings" label-width="120px" style="max-width: 600px;">
            <el-form-item label="系统名称">
              <el-input v-model="generalSettings.systemName" placeholder="输入系统名称" />
            </el-form-item>
            
            <el-form-item label="系统描述">
              <el-input 
                v-model="generalSettings.description" 
                type="textarea" 
                :rows="3"
                placeholder="输入系统描述" 
              />
            </el-form-item>
            
            <el-form-item label="默认语言">
              <el-select v-model="generalSettings.defaultLanguage" placeholder="选择默认语言" style="width: 200px;">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="时区设置">
              <el-select v-model="generalSettings.timezone" placeholder="选择时区" style="width: 200px;">
                <el-option label="中国标准时间 (UTC+8)" value="Asia/Shanghai" />
                <el-option label="美国东部时间 (UTC-5)" value="America/New_York" />
                <el-option label="格林威治标准时间 (UTC+0)" value="Europe/London" />
              </el-select>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveGeneralSettings">保存设置</el-button>
              <el-button @click="resetGeneralSettings">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane name="security" label="安全设置">
        <el-card class="setting-card">
          <template #header>
            <div class="card-header">
              <span>安全设置</span>
            </div>
          </template>
          
          <el-form :model="securitySettings" label-width="120px" style="max-width: 600px;">
            <el-form-item label="密码最小长度">
              <el-input-number v-model="securitySettings.passwordMinLength" :min="6" :max="20" />
            </el-form-item>
            
            <el-form-item label="密码复杂度">
              <el-checkbox-group v-model="securitySettings.passwordComplexity">
                <el-checkbox value="uppercase">大写字母</el-checkbox>
                <el-checkbox value="lowercase">小写字母</el-checkbox>
                <el-checkbox value="numbers">数字</el-checkbox>
                <el-checkbox value="symbols">特殊符号</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="登录失败锁定">
              <el-switch v-model="securitySettings.loginLockEnabled" />
              <span style="margin-left: 10px;">启用登录失败锁定机制</span>
            </el-form-item>
            
            <el-form-item v-if="securitySettings.loginLockEnabled" label="锁定时间(分钟)">
              <el-input-number v-model="securitySettings.lockDuration" :min="1" :max="60" />
            </el-form-item>
            
            <el-form-item label="会话超时(分钟)">
              <el-slider v-model="securitySettings.sessionTimeout" :min="5" :max="120" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveSecuritySettings">保存设置</el-button>
              <el-button @click="resetSecuritySettings">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane name="notification" label="通知设置">
        <el-card class="setting-card">
          <template #header>
            <div class="card-header">
              <span>通知设置</span>
            </div>
          </template>
          
          <el-form :model="notificationSettings" label-width="120px" style="max-width: 600px;">
            <el-form-item label="邮件通知">
              <el-switch v-model="notificationSettings.emailEnabled" />
              <span style="margin-left: 10px;">启用邮件通知</span>
            </el-form-item>
            
            <el-form-item label="短信通知">
              <el-switch v-model="notificationSettings.smsEnabled" />
              <span style="margin-left: 10px;">启用短信通知</span>
            </el-form-item>
            
            <el-form-item label="推送通知">
              <el-switch v-model="notificationSettings.pushEnabled" />
              <span style="margin-left: 10px;">启用推送通知</span>
            </el-form-item>
            
            <el-divider content-position="left">通知类型</el-divider>
            
            <el-form-item label="设备报警">
              <el-checkbox-group v-model="notificationSettings.deviceAlarmChannels">
                <el-checkbox value="email">邮件</el-checkbox>
                <el-checkbox value="sms">短信</el-checkbox>
                <el-checkbox value="push">推送</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="系统维护">
              <el-checkbox-group v-model="notificationSettings.maintenanceChannels">
                <el-checkbox value="email">邮件</el-checkbox>
                <el-checkbox value="sms">短信</el-checkbox>
                <el-checkbox value="push">推送</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="数据异常">
              <el-checkbox-group v-model="notificationSettings.dataAnomalyChannels">
                <el-checkbox value="email">邮件</el-checkbox>
                <el-checkbox value="sms">短信</el-checkbox>
                <el-checkbox value="push">推送</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
              <el-button @click="resetNotificationSettings">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane name="backup" label="备份设置">
        <el-card class="setting-card">
          <template #header>
            <div class="card-header">
              <span>备份设置</span>
            </div>
          </template>
          
          <el-form :model="backupSettings" label-width="120px" style="max-width: 600px;">
            <el-form-item label="自动备份">
              <el-switch v-model="backupSettings.autoBackupEnabled" />
              <span style="margin-left: 10px;">启用自动备份</span>
            </el-form-item>
            
            <el-form-item v-if="backupSettings.autoBackupEnabled" label="备份频率">
              <el-radio-group v-model="backupSettings.backupFrequency">
                <el-radio value="daily">每天</el-radio>
                <el-radio value="weekly">每周</el-radio>
                <el-radio value="monthly">每月</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item v-if="backupSettings.autoBackupEnabled" label="备份时间">
              <el-time-select
                v-model="backupSettings.backupTime"
                start="00:00"
                step="01:00"
                end="23:00"
                placeholder="选择备份时间">
              </el-time-select>
            </el-form-item>
            
            <el-form-item label="保留份数">
              <el-input-number v-model="backupSettings.retentionCount" :min="1" :max="100" />
            </el-form-item>
            
            <el-form-item label="备份路径">
              <el-input v-model="backupSettings.backupPath" placeholder="输入备份存储路径" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveBackupSettings">保存设置</el-button>
              <el-button @click="performManualBackup">立即备份</el-button>
              <el-button @click="resetBackupSettings">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 激活的标签页
const activeTab = ref('general')

// 常规设置
const generalSettings = reactive({
  systemName: '物联网生鲜品储运系统',
  description: '用于监控和管理物联网设备的综合平台',
  defaultLanguage: 'zh-CN',
  timezone: 'Asia/Shanghai'
})

// 安全设置
const securitySettings = reactive({
  passwordMinLength: 8,
  passwordComplexity: ['uppercase', 'lowercase', 'numbers'],
  loginLockEnabled: true,
  lockDuration: 30,
  sessionTimeout: 30
})

// 通知设置
const notificationSettings = reactive({
  emailEnabled: true,
  smsEnabled: false,
  pushEnabled: true,
  deviceAlarmChannels: ['email', 'push'],
  maintenanceChannels: ['email'],
  dataAnomalyChannels: ['email', 'sms']
})

// 备份设置
const backupSettings = reactive({
  autoBackupEnabled: true,
  backupFrequency: 'daily',
  backupTime: '02:00',
  retentionCount: 7,
  backupPath: '/var/backups/iot-system'
})

// 保存常规设置
const saveGeneralSettings = () => {
  ElMessage.success('常规设置保存成功')
}

// 重置常规设置
const resetGeneralSettings = () => {
  Object.assign(generalSettings, {
    systemName: '物联网生鲜品储运系统',
    description: '用于监控和管理物联网设备的综合平台',
    defaultLanguage: 'zh-CN',
    timezone: 'Asia/Shanghai'
  })
  ElMessage.info('常规设置已重置')
}

// 保存安全设置
const saveSecuritySettings = () => {
  ElMessage.success('安全设置保存成功')
}

// 重置安全设置
const resetSecuritySettings = () => {
  Object.assign(securitySettings, {
    passwordMinLength: 8,
    passwordComplexity: ['uppercase', 'lowercase', 'numbers'],
    loginLockEnabled: true,
    lockDuration: 30,
    sessionTimeout: 30
  })
  ElMessage.info('安全设置已重置')
}

// 保存通知设置
const saveNotificationSettings = () => {
  ElMessage.success('通知设置保存成功')
}

// 重置通知设置
const resetNotificationSettings = () => {
  Object.assign(notificationSettings, {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    deviceAlarmChannels: ['email', 'push'],
    maintenanceChannels: ['email'],
    dataAnomalyChannels: ['email', 'sms']
  })
  ElMessage.info('通知设置已重置')
}

// 保存备份设置
const saveBackupSettings = () => {
  ElMessage.success('备份设置保存成功')
}

// 立即备份
const performManualBackup = () => {
  ElMessage.info('正在执行手动备份...')
  // 这里可以添加实际的备份逻辑
  setTimeout(() => {
    ElMessage.success('备份完成')
  }, 2000)
}

// 重置备份设置
const resetBackupSettings = () => {
  Object.assign(backupSettings, {
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionCount: 7,
    backupPath: '/var/backups/iot-system'
  })
  ElMessage.info('备份设置已重置')
}
</script>

<style scoped>
.system-settings-view {
  padding: 20px;
  background: var(--color-primary-medium);
  min-height: 100vh;
}

.setting-card {
  background: var(--card-bg) !important;
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 8px !important;
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-form {
  padding: 20px 0;
}
</style>
