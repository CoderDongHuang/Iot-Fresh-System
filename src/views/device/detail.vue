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
        <el-descriptions-item label="设备类型">{{ deviceInfo.deviceType }}</el-descriptions-item>
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
      timeRange: timeRange.value
    }
    const response: any = await getDeviceHistoryData(vid, params)
    
    // 处理响应数据，兼容不同格式
    let responseData = response
    if (response && response.code !== undefined) {
      // 如果响应遵循标准格式 { code, msg, data }
      responseData = response.data
    }
    
    // 检查返回的数据格式并设置到historyData
    if (Array.isArray(responseData)) {
      // 如果直接返回数组
      historyData.value = responseData
    } else if (responseData && responseData.list && Array.isArray(responseData.list)) {
      // 如果返回的是包含list的对象
      historyData.value = responseData.list
    } else {
      // 其他情况，直接赋值（可能为空数组）
      historyData.value = []
    }
  } catch (error) {
    console.error('获取历史数据失败:', error)
    ElMessage.error('获取历史数据失败')
    historyData.value = [] // 错误时清空历史数据
  } finally {
    loadingHistoryData.value = false
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
.device-detail-view {
  padding: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
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