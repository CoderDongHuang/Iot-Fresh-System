<template>
  <div class="device-detail-view">
    <el-page-header :title="'返回设备列表'" @back="goBack">
      <template #content>
        <span class="page-title">设备详情</span>
      </template>
    </el-page-header>
    
    <el-card shadow="hover" class="detail-card">
      <template #header>
        <div class="detail-header">
          <div class="device-info">
            <h3>{{ deviceInfo.deviceName }}</h3>
            <div class="device-meta">
              <span class="vid">VID: {{ deviceInfo.vid }}</span>
              <el-tag :type="getStatusTagType(deviceInfo.status)" size="small">
                {{ getStatusText(deviceInfo.status) }}
              </el-tag>
            </div>
          </div>
          <div class="device-actions">
            <el-button type="primary" @click="refreshDetail">刷新</el-button>
            <el-button @click="controlDevice">设备控制</el-button>
          </div>
        </div>
      </template>
      
      <!-- 基本信息 -->
      <el-descriptions :column="2" :border="true">
        <el-descriptions-item label="设备名称">{{ deviceInfo.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="设备VID">{{ deviceInfo.vid }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">{{ getDeviceTypeName(deviceInfo.deviceType) }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ deviceInfo.location }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(deviceInfo.status)" size="small">
            {{ getStatusText(deviceInfo.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最后在线时间">{{ deviceInfo.lastOnlineTime ? formatDate(deviceInfo.lastOnlineTime) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ deviceInfo.createTime ? formatDate(deviceInfo.createTime) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ deviceInfo.remarks || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <!-- 实时数据 -->
    <el-card shadow="hover" class="realtime-card" v-if="deviceInfo.currentData">
      <template #header>
        <div class="card-header">
          <span>实时数据</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="data-item">
            <div class="data-label">内部温度</div>
            <div class="data-value">{{ deviceInfo.currentData?.tin }}℃</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="data-item">
            <div class="data-label">外部温度</div>
            <div class="data-value">{{ deviceInfo.currentData?.tout }}℃</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="data-item">
            <div class="data-label">光照强度</div>
            <div class="data-value">{{ deviceInfo.currentData?.lxin }} lux</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="data-item">
            <div class="data-label">设备状态</div>
            <div class="data-value">
              <el-tag :type="deviceInfo.currentData?.vStatus === 0 ? 'success' : 'warning'">
                {{ deviceInfo.currentData?.vStatus === 0 ? '正常' : '异常' }}
              </el-tag>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 历史数据表格 -->
    <el-card shadow="hover" class="history-table-card">
      <template #header>
        <div class="card-header">
          <span>历史数据记录</span>
          <div class="chart-controls">
            <el-radio-group v-model="timeRange" @change="fetchHistoryData">
              <el-radio-button value="1h">1小时</el-radio-button>
              <el-radio-button value="6h">6小时</el-radio-button>
              <el-radio-button value="24h">24小时</el-radio-button>
              <el-radio-button value="7d">7天</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>
      
      <el-table v-loading="loadingHistoryData" :data="historyData" style="width: 100%" stripe>
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }">
            {{ row.timestamp ? formatDate(row.timestamp) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="tin" label="厢内温度(℃)" width="120" />
        <el-table-column prop="tout" label="厢外温度(℃)" width="120" />
        <el-table-column prop="lxin" label="光照强度(lux)" width="130" />
        <el-table-column prop="vStatus" label="设备状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.vStatus === 0 ? 'success' : 'warning'">
              {{ row.vStatus === 0 ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getDeviceDetail, getDeviceHistoryData } from '@/api/device'
import type { DeviceInfo } from '@/types/api'
import { formatDate } from '@/utils/date'

const router = useRouter()
const route = useRoute()

// 响应式数据
const deviceInfo = ref<DeviceInfo>({
  vid: '',
  deviceName: '',
  deviceType: '',
  location: '',
  status: 'offline', // 可以是 string 或 number
  lastOnlineTime: '',
  createTime: '',
  remarks: '',
  currentData: undefined
})
const timeRange = ref('1h')
const historyData = ref<any[]>([])
const loadingHistoryData = ref(false)

// 获取设备详情
const fetchDeviceDetail = async () => {
  try {
    const vid = route.params.vid as string
    const response: any = await getDeviceDetail(vid)
    
    // 处理响应数据，兼容不同格式
    let deviceData = response
    if (response && response.code !== undefined) {
      // 如果响应遵循标准格式 { code, msg, data }
      deviceData = response.data
    }
    
    // 数据标准化：确保使用正确的字段名
    deviceInfo.value = {
      ...deviceData,
      // 确保时间字段存在
      lastOnlineTime: deviceData.lastOnlineTime || deviceData.lastOnline_time || deviceData.last_online_time || deviceData.lastHeartbeat || '-',
      createTime: deviceData.createTime || deviceData.create_time || deviceData.create_time || '-',
      // 确保其他可能的字段映射正确
      deviceName: deviceData.deviceName || deviceData.device_name || deviceData.name,
      deviceType: deviceData.deviceType || deviceData.device_type || deviceData.type,
      location: deviceData.location || deviceData.loc || deviceData.place || '-',
      remarks: deviceData.remarks || deviceData.remark || deviceData.description || '-'
    }
  } catch (error) {
    console.error('获取设备详情失败:', error)
    ElMessage.error('获取设备详情失败')
  }
}

// 获取历史数据
const fetchHistoryData = async () => {
  loadingHistoryData.value = true
  try {
    const vid = route.params.vid as string
    const params = {
      vid: vid,
      timeRange: timeRange.value,
      pageSize: 100,    // 请求100条数据
      pageNum: 1        // 第一页
    }
    
    console.log('🔍 查询历史数据参数:', params)
    const response: any = await getDeviceHistoryData(params)
    console.log('🔍 历史数据API原始响应:', response)
    
    // 处理响应数据，兼容不同格式
    let responseData = response
    if (response && response.code !== undefined) {
      // 如果响应遵循标准格式 { code, msg, data }
      responseData = response.data
      console.log('🔍 提取后的数据data字段:', responseData)
    }
    
    // 检查返回的数据格式并设置到historyData
    if (Array.isArray(responseData)) {
      // 如果直接返回数组
      historyData.value = responseData
      console.log('✅ 历史数据加载成功，数组长度:', responseData.length)
    } else if (responseData && responseData.list && Array.isArray(responseData.list)) {
      // 如果返回的是包含list的对象
      historyData.value = responseData.list
      console.log('✅ 历史数据加载成功，list长度:', responseData.list.length)
    } else {
      // 其他情况，直接赋值（可能为空数组）
      historyData.value = []
      console.log('⚠️ 历史数据格式异常，设置为空数组')
    }
    
    console.log('📊 最终设置的历史数据:', historyData.value)
    
    // 如果数据量少，自动测试其他时间范围
    if (historyData.value.length <= 1) {
      console.log('⚠️ 数据量较少，测试其他时间范围...')
      await testOtherTimeRanges(vid)
    }
  } catch (error) {
    console.error('获取历史数据失败:', error)
    ElMessage.error('获取历史数据失败')
    historyData.value = [] // 错误时清空历史数据
  } finally {
    loadingHistoryData.value = false
  }
}

// 测试其他时间范围
const testOtherTimeRanges = async (vid: string) => {
  const timeRanges = ['12h', '24h', '7d', '30d']
  
  for (let range of timeRanges) {
    try {
      const testParams = {
        vid: vid,
        timeRange: range,
        pageSize: 10  // 只查询少量数据测试
      }
      
      console.log(`🔍 测试时间范围 ${range}:`, testParams)
      const response: any = await getDeviceHistoryData(testParams)
      
      // 处理响应数据，兼容不同格式
      let responseData = response
      if (response && response.code !== undefined) {
        // 如果响应遵循标准格式 { code, msg, data }
        responseData = response.data
      }
      
      // 获取数据长度
      let dataLength = 0
      if (Array.isArray(responseData)) {
        dataLength = responseData.length
      } else if (responseData && responseData.list && Array.isArray(responseData.list)) {
        dataLength = responseData.list.length
      } else if (responseData && responseData.total !== undefined) {
        dataLength = responseData.total
      }
      
      console.log(`📊 时间范围 ${range} 的数据量:`, dataLength)
    } catch (error) {
      console.log(`❌ 时间范围 ${range} 查询失败:`, error)
    }
  }
}

// 返回设备列表
const goBack = () => {
  router.push('/device/list')
}

// 刷新详情
const refreshDetail = () => {
  fetchDeviceDetail()
}

// 控制设备
const controlDevice = () => {
  router.push(`/control?device=${deviceInfo.value.vid}`)
}

// 设备类型映射
const deviceTypeMap: Record<string, string> = {
  'storage': '存储设备',
  'transport': '运输设备',
  'display': '展示设备',
  'processing': '加工设备',
  'quality': '质检设备',
  'monitoring': '监控设备',
  'warehouse': '仓储设备',
  'temperature': '温控设备',
  'humidity': '湿度设备',
  'light': '光照设备',
  'control': '控制设备',
  'other': '其他设备'
}

// 获取设备类型中文名称
const getDeviceTypeName = (type: string | undefined) => {
  if (!type) return '未知'
  return deviceTypeMap[type.toLowerCase()] || type
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
    case '3':
      return 'warning'
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
    case '3':
      return '维护'
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
.device-detail-view {
  padding: 20px;
}

/* 修复页面头部样式 */
:deep(.el-page-header) {
  color: #ffffff !important;
}

:deep(.el-page-header__title) {
  color: #ffffff !important;
  font-weight: 500;
}

:deep(.el-page-header__content) {
  color: #ffffff !important;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.detail-card {
  margin-top: 20px;
}

.detail-header {
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

.vid {
  color: #666;
}

.realtime-card {
  margin-top: 20px;
}

.data-item {
  text-align: center;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: var(--card-bg);
}

.data-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.data-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-card {
  margin-top: 20px;
}


</style>