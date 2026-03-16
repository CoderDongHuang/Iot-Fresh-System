<template>
  <div class="monitor-view">
    <div class="monitor-header">
      <h2>实时监控</h2>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button @click="toggleAutoRefresh">
          <el-icon><SwitchButton /></el-icon>
          {{ autoRefresh ? '停止自动刷新' : '开启自动刷新' }}
        </el-button>
        <el-select v-model="refreshInterval" placeholder="刷新间隔" @change="handleIntervalChange" style="width: 120px;">
          <el-option label="5秒" :value="5000" />
          <el-option label="10秒" :value="10000" />
          <el-option label="30秒" :value="30000" />
          <el-option label="1分钟" :value="60000" />
        </el-select>
      </div>
    </div>
    
    <el-card shadow="never" class="monitor-card">
      <template #header>
        <div class="card-header">
          <span>设备实时状态</span>
          <div class="status-summary">
            <el-tag type="success" class="status-item">在线: {{ onlineCount }}</el-tag>
            <el-tag type="info" class="status-item">离线: {{ offlineCount }}</el-tag>
            <el-tag type="warning" class="status-item">异常: {{ faultCount }}</el-tag>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="realTimeData" 
        style="width: 100%" 
        stripe 
        v-loading="loading"
        :default-sort="{ prop: 'timestamp', order: 'descending' }"
      >
        <el-table-column prop="vid" label="设备VID" width="150" sortable />
        <el-table-column prop="deviceName" label="设备名称" width="150" sortable />
        <el-table-column prop="deviceType" label="设备类型" width="120" sortable>
          <template #default="{ row }">
            {{ deviceTypeMap[row.deviceType] || row.deviceType }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" width="150" sortable />
        <el-table-column label="内部温度(℃)" width="130" sortable prop="tin">
          <template #default="{ row }">
            <span :class="getTempClass(row.tin)">
              {{ row.tin !== undefined ? row.tin.toFixed(1) : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="外部温度(℃)" width="130" sortable prop="tout">
          <template #default="{ row }">
            <span :class="getTempClass(row.tout)">
              {{ row.tout !== undefined ? row.tout.toFixed(1) : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="lxin" label="光照强度(lux)" width="140" sortable />
        <el-table-column prop="brightness" label="亮度" width="120" sortable />
        <el-table-column label="设备状态" width="100" sortable prop="vStatus">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.vStatus)">
              {{ getStatusText(row.vStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="更新时间" width="180" sortable>
          <template #default="{ row }">
            {{ row.timestamp ? formatDate(row.timestamp) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
            <el-button size="small" type="primary" @click="controlDevice(row)">控制</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, SwitchButton } from '@element-plus/icons-vue'
import { getAllDevicesRealTimeData } from '@/api/device'
import type { DeviceData } from '@/types/api'
import { formatDate } from '@/utils/date'

// 设备类型映射
const deviceTypeMap: Record<string, string> = {
  'storage': '存储设备',
  'transport': '运输设备',
  'display': '展示设备',
  'processing': '加工设备',
  'quality': '质检设备',
  'monitoring': '监控设备',
  'warehouse': '仓储设备'
}

const router = useRouter()

// 响应式数据
const realTimeData = ref<DeviceData[]>([])
const loading = ref(false)
const autoRefresh = ref(false)
const refreshInterval = ref(30000) // 调整为30秒，减少请求频率
let refreshTimer: NodeJS.Timeout | null = null
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 5000 // 最小请求间隔5秒

// 获取实时数据
const fetchRealTimeData = async () => {
  // 节流控制：避免过于频繁的请求
  const now = Date.now()
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    console.log('请求过于频繁，跳过本次请求')
    return
  }
  
  // 如果已经在加载中，跳过本次请求
  if (loading.value) {
    return
  }
  
  loading.value = true
  lastRequestTime = now
  const startTime = Date.now()
  
  try {
    // 添加超时控制（5秒超时）
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), 5000)
    })
    
    const dataPromise = getAllDevicesRealTimeData()
    const response = await Promise.race([dataPromise, timeoutPromise])
    
    // 处理响应数据格式 - 使用类型断言处理可能的响应对象
    let deviceData = []
    const resp = response as any
    
    if (resp && resp.code === 200) {
      // 标准响应格式：response.data 包含设备数据
      deviceData = Array.isArray(resp.data) ? resp.data : []
    } else if (Array.isArray(resp)) {
      // 直接返回数组格式
      deviceData = resp
    } else if (resp && Array.isArray(resp.list)) {
      // 兼容 list 字段格式
      deviceData = resp.list
    } else if (resp && Array.isArray(resp.total)) {
      // 兼容 total 字段格式
      deviceData = resp.total
    }
    
    realTimeData.value = deviceData
    
    const endTime = Date.now()
    const duration = endTime - startTime
    console.log(`数据获取耗时: ${duration}ms`)
    
    // 如果请求耗时过长，建议调整刷新频率
    if (duration > 1000) {
      console.warn('数据请求耗时过长，建议增加刷新间隔')
    }
    
  } catch (error) {
    console.error('获取实时数据失败:', error)
    // 只在第一次失败时显示错误提示，避免频繁弹窗
    if (!realTimeData.value.length) {
      ElMessage.error('获取实时数据失败')
    }
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  fetchRealTimeData()
}

// 开启/停止自动刷新
const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

// 开始自动刷新
const startAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  refreshTimer = setInterval(fetchRealTimeData, refreshInterval.value)
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 处理刷新间隔变化
const handleIntervalChange = () => {
  if (autoRefresh.value) {
    stopAutoRefresh()
    startAutoRefresh()
  }
}

// 查看设备详情
const viewDetail = (device: DeviceData) => {
  if (device.vid) {
    router.push(`/device/detail/${device.vid}`)
  }
}

// 控制设备
const controlDevice = (device: DeviceData) => {
  if (device.vid) {
    router.push(`/control?device=${device.vid}`)
  }
}

// 获取温度状态类
const getTempClass = (temp: number) => {
  if (temp === undefined || temp === null) return ''
  // 这里可以根据实际业务逻辑判断温度是否异常
  // 暂时使用固定阈值作为示例
  if (temp > 30 || temp < 0) {
    return 'temp-warning'
  }
  return 'temp-normal'
}

// 获取状态标签类型
const getStatusTagType = (status: number) => {
  switch (status) {
    case 1: return 'success' // 在线 - 绿色
    case 0: return 'info'    // 离线 - 灰色
    case 2: return 'danger'  // 故障 - 红色
    case 3: return 'warning' // 维护 - 橙色
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 1: return '在线'
    case 0: return '离线'
    case 2: return '故障'
    case 3: return '维护'
    default: return '未知'
  }
}

// 状态统计 (计算属性)
const onlineCount = computed(() => realTimeData.value.filter(d => d.vStatus === 0).length)
const offlineCount = computed(() => realTimeData.value.filter(d => d.vStatus === 1).length)
const faultCount = computed(() => realTimeData.value.filter(d => d.vStatus === 2).length)

// 初始化
onMounted(() => {
  fetchRealTimeData()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.monitor-view {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.monitor-card {
  background: white;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-summary {
  display: flex;
  gap: 8px;
}

.status-item {
  margin-right: 0;
}

.temp-normal {
  color: #67c23a;
}

.temp-warning {
  color: #f56c6c;
  font-weight: bold;
}

:deep(.el-table) {
  font-size: 14px;
}
</style>
