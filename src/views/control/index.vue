<template>
  <div class="device-control-view">
    <el-page-header :title="'返回设备列表'" @back="goBack">
      <template #content>
        <span class="page-title">设备控制</span>
      </template>
    </el-page-header>

    <!-- 设备选择 -->
    <el-card shadow="hover" class="device-selector-card">
      <div class="device-selector">
        <span class="selector-label">选择控制设备：</span>
        <el-select 
          v-model="selectedDeviceId" 
          placeholder="请选择要控制的设备"
          @change="onDeviceSelect"
          style="width: 300px; margin-right: 20px;"
        >
          <el-option
            v-for="device in availableDevices"
            :key="device.vid"
            :label="`${device.deviceName} (${device.vid})`"
            :value="device.vid"
          >
            <div class="device-option">
              <span>{{ device.deviceName }}</span>
              <el-tag 
                :type="getStatusTagType(device.status)" 
                size="small"
                style="margin-left: 10px;"
              >
                {{ getStatusText(device.status) }}
              </el-tag>
            </div>
          </el-option>
        </el-select>
        <el-button 
          type="primary" 
          :disabled="!selectedDeviceId"
          @click="refreshDeviceDetail"
        >
          刷新设备信息
        </el-button>
      </div>
    </el-card>

    <el-card shadow="hover" class="control-card" v-if="selectedDevice.vid">
      <template #header>
        <div class="control-header">
          <div class="device-info">
            <h3>设备控制 - {{ selectedDevice.deviceName }} ({{ selectedDevice.vid }})</h3>
            <div class="device-meta">
              <el-tag :type="getStatusTagType(selectedDevice.status)" size="small">
                {{ getStatusText(selectedDevice.status) }}
              </el-tag>
              <span class="update-time" v-if="currentData.timestamp">
                最后更新: {{ formatTime(currentData.timestamp) }}
              </span>
            </div>
          </div>
          
          <!-- 当前状态数据展示 -->
          <div class="current-data-display" v-if="currentData.vid">
            <el-row :gutter="10">
              <el-col :span="4">
                <div class="data-item">
                  <div class="data-label">内部温度</div>
                  <div class="data-value">{{ currentData.tin !== undefined ? currentData.tin.toFixed(1) : '-' }}℃</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="data-item">
                  <div class="data-label">外部温度</div>
                  <div class="data-value">{{ currentData.tout !== undefined ? currentData.tout.toFixed(1) : '-' }}℃</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="data-item">
                  <div class="data-label">内部湿度</div>
                  <div class="data-value">{{ currentData.hin !== undefined ? currentData.hin : '-' }}%</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="data-item">
                  <div class="data-label">外部湿度</div>
                  <div class="data-value">{{ currentData.hout !== undefined ? currentData.hout : '-' }}%</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="data-item">
                  <div class="data-label">内部光照</div>
                  <div class="data-value">{{ currentData.lxin !== undefined ? currentData.lxin : '-' }}lux</div>
                </div>
              </el-col>
              <el-col :span="4">
                <div class="data-item">
                  <div class="data-label">外部光照</div>
                  <div class="data-value">{{ currentData.lxout !== undefined ? currentData.lxout : '-' }}lux</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </template>

      <el-row :gutter="20">
        <!-- 基础控制 -->
        <el-col :span="6">
          <el-card shadow="hover" class="control-section">
            <template #header>
              <div class="section-header">
                <el-icon><VideoPlay /></el-icon>
                <span>设备控制</span>
              </div>
            </template>
            <div class="control-grid">
              <el-button type="success" size="large" @click="sendCommand('turnOn')" style="width: 100%; height: 70px; font-size: 16px; padding: 0;">
                开启设备
              </el-button>
              <el-button type="danger" size="large" @click="sendCommand('turnOff')" style="width: 100%; height: 70px; font-size: 16px; padding: 0;">
                关闭设备
              </el-button>
              <el-button type="primary" size="large" @click="sendCommand('restart')" style="width: 100%; height: 70px; font-size: 16px; padding: 0;">
                重启设备
              </el-button>
              <el-button type="warning" size="large" @click="sendCommand('reset')" style="width: 100%; height: 70px; font-size: 16px; padding: 0;">
                重置设备
              </el-button>
            </div>
          </el-card>
        </el-col>

        <!-- 温度控制 -->
        <el-col :span="6">
          <el-card shadow="hover" class="control-section">
            <template #header>
              <div class="section-header">
                <el-icon><Sunny /></el-icon>
                <span>温度控制</span>
              </div>
            </template>
            <div class="param-controls">
              <div class="param-item">
                <label>内部温度 (℃)</label>
                <el-input-number 
                  v-model="tinSetting" 
                  :min="-10" 
                  :max="60" 
                  :step="0.5"
                  @change="adjustTin"
                  style="width: 100%; height: 60px;"
                />
              </div>
              <div class="param-item">
                <label>外部温度 (℃)</label>
                <el-input-number 
                  v-model="toutSetting" 
                  :min="-10" 
                  :max="60" 
                  :step="0.5"
                  @change="adjustTout"
                  style="width: 100%; height: 60px;"
                />
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 湿度控制 -->
        <el-col :span="6">
          <el-card shadow="hover" class="control-section">
            <template #header>
              <div class="section-header">
                <el-icon><Cloudy /></el-icon>
                <span>湿度控制</span>
              </div>
            </template>
            <div class="param-controls">
              <div class="param-item">
                <label>内部湿度 (%)</label>
                <el-slider 
                  v-model="hinSetting" 
                  :min="0" 
                  :max="100"
                  @change="adjustHin"
                  style="height: 60px;"
                />
              </div>
              <div class="param-item">
                <label>外部湿度 (%)</label>
                <el-slider 
                  v-model="houtSetting" 
                  :min="0" 
                  :max="100"
                  @change="adjustHout"
                  style="height: 60px;"
                />
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 光照控制 -->
        <el-col :span="6">
          <el-card shadow="hover" class="control-section">
            <template #header>
              <div class="section-header">
                <el-icon><Lightning /></el-icon>
                <span>光照控制</span>
              </div>
            </template>
            <div class="param-controls">
                <div class="param-item">
                  <label>内部光照 (lux)</label>
                  <el-input-number 
                    v-model="lxinSetting" 
                    :min="0" 
                    :max="2000"
                    @change="adjustLxin"
                    style="width: 100%; height: 60px;"
                  />
                </div>
                <div class="param-item">
                  <label>外部光照 (lux)</label>
                  <el-input-number 
                    v-model="lxoutSetting" 
                    :min="0" 
                    :max="2000"
                    @change="adjustLxout"
                    style="width: 100%; height: 60px;"
                  />
                </div>
                <div class="param-item">
                  <label>亮度调节 (%)</label>
                  <el-slider 
                    v-model="brightnessSetting" 
                    :min="0" 
                    :max="100"
                    @change="adjustBrightness"
                    style="height: 60px;"
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
import { VideoPlay, VideoPause, Refresh, RefreshLeft, Sunny, Cloudy, Lightning } from '@element-plus/icons-vue'
import { controlDevice as sendControlCommand, getDeviceDetail, getDeviceList, getDeviceRealTimeData, getAllDevicesRealTimeData } from '@/api/device'
import type { DeviceInfo } from '@/types/api'

const router = useRouter()
const route = useRoute()

// 响应式数据
const selectedDeviceId = ref<string>('')
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
const availableDevices = ref<DeviceInfo[]>([])

// 温度设置
const tinSetting = ref(25)
const toutSetting = ref(23)

// 湿度设置
const hinSetting = ref(50)
const houtSetting = ref(45)

// 光照设置
const lxinSetting = ref(500)
const lxoutSetting = ref(300)

// 亮度设置
const brightnessSetting = ref(80)

// 当前设备数据
const currentData = ref<any>({})

// 命令历史
const commandHistory = ref([
  { command: 'turnOn', params: '{}', timestamp: '2024-12-19 10:30:00', status: 'success' },
  { command: 'setTemp', params: '{"temp": 25}', timestamp: '2024-12-19 10:25:00', status: 'success' }
])

// 获取设备列表
const fetchDeviceList = async () => {
  try {
    const response: any = await getDeviceList({ pageNum: 1, pageSize: 100 }) // 获取所有设备
    
    // 处理响应数据，兼容不同格式
    let resultData = null
    if (response && response.data) {
      // 标准格式: { code: 200, msg: 'success', data: { list: [], total: 100 } }
      resultData = response.data
    } else if (response && response.list) {
      // 直接格式: { list: [], total: 100 }
      resultData = response
    }
    
    if (resultData && resultData.list) {
      // 数据标准化：适配数据库字段名
      availableDevices.value = resultData.list.map((device: any) => ({
        ...device,
        // 使用数据库字段名
        vid: device.vid,
        deviceName: device.device_name || device.deviceName,
        deviceType: device.device_type || device.deviceType,
        status: device.status,
        location: device.location,
        lastOnlineTime: device.last_online_time || device.lastOnlineTime
      }))
      
      // 如果路由中有设备ID参数，选择该设备
      const deviceIdFromRoute = route.query.device as string
      if (deviceIdFromRoute) {
        selectedDeviceId.value = deviceIdFromRoute
        await fetchDeviceDetail(deviceIdFromRoute)
      } else if (availableDevices.value.length > 0) {
        // 如果没有指定设备，选择第一个设备
        selectedDeviceId.value = availableDevices.value[0].vid
        await fetchDeviceDetail(availableDevices.value[0].vid)
      }
    } else {
      console.warn('设备列表数据格式不正确:', response)
      availableDevices.value = []
    }
  } catch (error) {
    console.error('获取设备列表失败:', error)
    ElMessage.error('获取设备列表失败')
  }
}

// 获取设备详情
const fetchDeviceDetail = async (deviceId: string) => {
  try {
    if (!deviceId) {
      ElMessage.error('未指定设备')
      return
    }
    
    const response: any = await getDeviceDetail(deviceId)
    // 检查响应格式
    if (response && response.code !== undefined) {
      // 标准格式: { code: 200, msg: 'success', data: DeviceInfo }
      selectedDevice.value = response.data
    } else {
      // 直接格式: DeviceInfo
      selectedDevice.value = response
    }
  } catch (error) {
    console.error('获取设备详情失败:', error)
    ElMessage.error('获取设备详情失败')
  }
}

// 设备选择事件
const onDeviceSelect = async (vid: string) => {
  if (!vid) return
  
  try {
    await fetchDeviceDetail(vid)
    
    // 获取设备实时数据
    await fetchDeviceRealTimeData()
    
    // 重置命令历史
    commandHistory.value = []
  } catch (error) {
    console.error('获取设备详情失败:', error)
    ElMessage.error('获取设备详情失败')
  }
}

// 刷新设备详情
const refreshDeviceDetail = async () => {
  if (!selectedDeviceId.value) return
  
  try {
    const response = await getDeviceDetail(selectedDeviceId.value)
    // 适配ResponseData类型，提取data字段
    const device = (response as any).data || response
    selectedDevice.value = device
    
    // 同时刷新实时数据
    await fetchDeviceRealTimeData()
    
    ElMessage.success('设备信息已刷新')
  } catch (error) {
    console.error('刷新设备信息失败:', error)
    ElMessage.error('刷新设备信息失败')
  }
}

// 发送控制命令
const sendCommand = async (command: string, params: Record<string, any> = {}) => {
  try {
    if (!selectedDeviceId.value) {
      ElMessage.error('未选择设备')
      return
    }

    const payload = {
      command,
      params
    }

    const response = await sendControlCommand(selectedDeviceId.value, payload)
    
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
    'turnOn': '开启设备',
    'turnOff': '关闭设备',
    'restart': '重启设备',
    'reset': '重置设备',
    'setTin': '设置内部温度',
    'setTout': '设置外部温度',
    'setHin': '设置内部湿度',
    'setHout': '设置外部湿度',
    'setLxin': '设置内部光照',
    'setLxout': '设置外部光照',
    'setBrightness': '设置亮度'
  }
  
  return commandNames[command] || command
}

// 温度控制
const adjustTin = async () => {
  await sendCommand('setTin', { tin: tinSetting.value })
}

const adjustTout = async () => {
  await sendCommand('setTout', { tout: toutSetting.value })
}

// 湿度控制
const adjustHin = async () => {
  await sendCommand('setHin', { hin: hinSetting.value })
}

const adjustHout = async () => {
  await sendCommand('setHout', { hout: houtSetting.value })
}

// 光照控制
const adjustLxin = async () => {
  await sendCommand('setLxin', { lxin: lxinSetting.value })
}

const adjustLxout = async () => {
  await sendCommand('setLxout', { lxout: lxoutSetting.value })
}

// 亮度控制
const adjustBrightness = async () => {
  await sendCommand('setBrightness', { brightness: brightnessSetting.value })
}

// 格式化时间
const formatTime = (timestamp: string) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// 获取设备实时数据
const fetchDeviceRealTimeData = async () => {
  if (!selectedDeviceId.value) return;
  
  try {
    // 使用单个设备实时数据接口，只获取当前设备的数据
    const response = await getDeviceRealTimeData(selectedDeviceId.value);
    console.log('获取到当前设备实时数据:', response);
    
    // 处理响应数据格式 - 使用类型断言处理可能的响应对象
    let deviceData = null
    const resp = response as any
    
    if (resp && resp.code === 200) {
      // 标准响应格式：response.data 包含设备数据
      deviceData = resp.data
    } else if (resp && typeof resp === 'object') {
      // 直接返回设备数据对象
      deviceData = resp
    }
    
    if (deviceData) {
      currentData.value = deviceData;
      
      // 同步设置控件的当前值
      if (deviceData.tin !== undefined) tinSetting.value = deviceData.tin;
      if (deviceData.tout !== undefined) toutSetting.value = deviceData.tout;
      if (deviceData.hin !== undefined) hinSetting.value = deviceData.hin;
      if (deviceData.hout !== undefined) houtSetting.value = deviceData.hout;
      if (deviceData.lxin !== undefined) lxinSetting.value = deviceData.lxin;
      if (deviceData.lxout !== undefined) lxoutSetting.value = deviceData.lxout;
      if (deviceData.brightness !== undefined) brightnessSetting.value = deviceData.brightness;
    }
  } catch (error) {
    console.error('获取设备实时数据失败:', error);
  }
}

// 返回设备列表
const goBack = () => {
  router.push('/device/list')
}

// 页面加载时初始化状态相关函数
const getStatusTagType = (status: string | number) => {
  const statusNum = typeof status === 'string' ? parseInt(status) : status
  switch (statusNum) {
    case 1:
      return 'success'
    case 0:
      return 'info'
    case 2:
      return 'danger'
    case 3:
      return 'warning'
    default:
      return 'info'
  }
}

const getStatusText = (status: string | number) => {
  const statusNum = typeof status === 'string' ? parseInt(status) : status
  switch (statusNum) {
    case 1:
      return '在线'
    case 0:
      return '离线'
    case 2:
      return '故障'
    case 3:
      return '维护'
    default:
      return '未知'
  }
}

// 初始化
onMounted(() => {
  fetchDeviceList()
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

.device-selector-card {
  margin-bottom: 20px;
}

.device-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.selector-label {
  font-weight: bold;
  color: #606266;
}

.device-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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
  height: 320px;
  display: flex;
  flex-direction: column;
}

.section-header {
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}

.control-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 12px;
}

.param-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 20px;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-item label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

/* 当前状态数据展示样式 */
.current-data-display {
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.data-item {
  text-align: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.data-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
}

.data-value {
  font-size: 16px;
  font-weight: bold;
  color: #495057;
}

.update-time {
  margin-left: 15px;
  font-size: 12px;
  color: #6c757d;
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