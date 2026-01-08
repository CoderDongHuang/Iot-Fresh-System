<template>
  <div class="device-control-view">
    <el-page-header :title="'返回设备列表'" @back="goBack">
      <template #content>
        <span class="page-title">设备控制</span>
      </template>
    </el-page-header>

    <el-card shadow="hover" class="control-card">
      <template #header>
        <div class="control-header">
          <div class="device-info">
            <h3>设备控制 - {{ selectedDevice.vid }}</h3>
            <div class="device-meta">
              <el-tag :type="getStatusTagType(selectedDevice.status)" size="small">
                {{ getStatusText(selectedDevice.status) }}
              </el-tag>
            </div>
          </div>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="never" class="control-section">
            <template #header>
              <div class="section-header">
                <span>基础控制</span>
              </div>
            </template>

            <div class="control-grid">
              <el-button type="success" size="large" @click="sendCommand('turnOn')">
                <el-icon><VideoPlay /></el-icon>
                开启设备
              </el-button>
              <el-button type="danger" size="large" @click="sendCommand('turnOff')">
                <el-icon><VideoPause /></el-icon>
                关闭设备
              </el-button>
              <el-button type="warning" size="large" @click="sendCommand('restart')">
                <el-icon><Refresh /></el-icon>
                重启设备
              </el-button>
              <el-button type="info" size="large" @click="sendCommand('reset')">
                <el-icon><RefreshLeft /></el-icon>
                重置设备
              </el-button>
            </div>

            <div class="advanced-controls">
              <h4>高级控制</h4>
              <div class="control-row">
                <el-button @click="sendCommand('calibrate')">校准设备</el-button>
                <el-button @click="sendCommand('selfCheck')">自检</el-button>
                <el-button @click="sendCommand('updateFirmware')">固件升级</el-button>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card shadow="never" class="control-section">
            <template #header>
              <div class="section-header">
                <span>参数调节</span>
              </div>
            </template>

            <div class="param-controls">
              <div class="param-item">
                <label>温度设置 (℃)</label>
                <el-input-number 
                  v-model="tempSetting" 
                  :min="-10" 
                  :max="60" 
                  :step="0.5"
                  @change="adjustTemp"
                />
              </div>
              <div class="param-item">
                <label>亮度调节 (%)</label>
                <el-slider 
                  v-model="brightnessSetting" 
                  :min="0" 
                  :max="100"
                  @change="adjustBrightness"
                />
              </div>
              <div class="param-item">
                <label>速度调节</label>
                <el-slider 
                  v-model="speedSetting" 
                  :min="0" 
                  :max="2000"
                  @change="adjustSpeed"
                />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card shadow="never" class="control-section">
            <template #header>
              <div class="section-header">
                <span>命令历史</span>
              </div>
            </template>

            <el-table :data="commandHistory" style="width: 100%">
              <el-table-column prop="command" label="命令" width="200" />
              <el-table-column prop="params" label="参数" width="200" />
              <el-table-column prop="timestamp" label="时间" width="200" />
              <el-table-column prop="status" label="状态">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { VideoPlay, VideoPause, Refresh, RefreshLeft } from '@element-plus/icons-vue'
import { controlDevice as sendControlCommand, getDeviceDetail } from '@/api/device'
import type { DeviceInfo } from '@/types/api'

const router = useRouter()
const route = useRoute()

// 响应式数据
const selectedDevice = ref<DeviceInfo>({
  vid: '',
  deviceName: '',
  deviceType: '',
  location: '',
  status: 'offline',
  lastOnlineTime: '',
  createTime: '',
  remarks: '',
  currentData: undefined
})

const tempSetting = ref(25)
const brightnessSetting = ref(80)
const speedSetting = ref(1200)

// 命令历史
const commandHistory = ref([
  { command: 'turnOn', params: '{}', timestamp: '2024-12-19 10:30:00', status: 'success' },
  { command: 'setTemp', params: '{"temp": 25}', timestamp: '2024-12-19 10:25:00', status: 'success' }
])

// 获取路由参数中的设备ID
const deviceId = route.query.device as string

// 获取设备详情
const fetchDeviceDetail = async () => {
  try {
    if (!deviceId) {
      ElMessage.error('未指定设备')
      return
    }
    
    const response = await getDeviceDetail(deviceId)
    selectedDevice.value = response
  } catch (error) {
    console.error('获取设备详情失败:', error)
    ElMessage.error('获取设备详情失败')
  }
}

// 发送控制命令
const sendCommand = async (command: string, params: Record<string, any> = {}) => {
  try {
    if (!deviceId) {
      ElMessage.error('未指定设备')
      return
    }

    const payload = {
      command,
      params
    }

    const response = await sendControlCommand(deviceId, payload)
    
    // 添加到命令历史
    commandHistory.value.unshift({
      command,
      params: JSON.stringify(params),
      timestamp: new Date().toLocaleString(),
      status: 'success'
    })

    ElMessage.success(`${getCommandName(command)}命令发送成功`)
  } catch (error) {
    console.error('发送控制命令失败:', error)
    ElMessage.error(`${getCommandName(command)}命令发送失败`)
  }
}

// 获取命令名称
const getCommandName = (command: string) => {
  const commandNames: Record<string, string> = {
    'turnOn': '开启',
    'turnOff': '关闭',
    'restart': '重启',
    'reset': '重置',
    'calibrate': '校准',
    'selfCheck': '自检',
    'updateFirmware': '固件升级',
    'setTemp': '温度设置',
    'setBrightness': '亮度调节',
    'setSpeed': '速度调节'
  }
  
  return commandNames[command] || command
}

// 调整温度
const adjustTemp = async () => {
  await sendCommand('setTemp', { temp: tempSetting.value })
}

// 调整亮度
const adjustBrightness = async () => {
  await sendCommand('setBrightness', { brightness: brightnessSetting.value })
}

// 调整速度
const adjustSpeed = async () => {
  await sendCommand('setSpeed', { speed: speedSetting.value })
}

// 返回设备列表
const goBack = () => {
  router.push('/device/list')
}

// 状态相关函数
const getStatusTagType = (status: string | number) => {
  const statusStr = String(status).toLowerCase();
  switch (statusStr) {
    case 'online':
    case '1':
      return 'success'
    case 'offline':
    case '0':
      return 'info'
    case 'fault':
    case '2':
      return 'danger'
    default:
      return 'info'
  }
}

const getStatusText = (status: string | number) => {
  const statusStr = String(status).toLowerCase();
  switch (statusStr) {
    case 'online':
    case '1':
      return '在线'
    case 'offline':
    case '0':
      return '离线'
    case 'fault':
    case '2':
      return '故障'
    default:
      return '未知'
  }
}

// 初始化
onMounted(() => {
  fetchDeviceDetail()
})
</script>

<style scoped>
.device-control-view {
  padding: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
}

.control-card {
  margin-top: 20px;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-info h3 {
  margin: 0 0 5px 0;
}

.device-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.control-section {
  margin-bottom: 20px;
}

.section-header {
  font-weight: bold;
  font-size: 16px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.param-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-item label {
  font-weight: bold;
  color: #666;
}

.advanced-controls {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.advanced-controls h4 {
  margin: 0 0 15px 0;
  color: #666;
}

.control-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-slider) {
  width: 100%;
}
</style>