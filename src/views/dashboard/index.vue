<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-card shadow="hover" class="card-item">
            <div class="card-content">
              <div class="card-icon" style="background: #409EFF;">
                <el-icon><Platform /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">在线设备</div>
                <div class="card-value">{{ statistics.onlineDevices }}</div>
              </div>
            </div>
            <div class="card-footer">
              <span>总计 {{ statistics.totalDevices }} 台</span>
              <el-progress 
                :percentage="onlinePercentage" 
                :color="onlinePercentage > 80 ? '#67c23a' : '#e6a23c'"
                :stroke-width="6"
                :show-text="false"
              />
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-card shadow="hover" class="card-item">
            <div class="card-content">
              <div class="card-icon" style="background: #67C23A;">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">今日数据</div>
                <div class="card-value">{{ statistics.todayData }}</div>
              </div>
            </div>
            <div class="card-footer">
              <span>环比 {{ statistics.dataGrowth }}%</span>
              <el-icon :color="statistics.dataGrowth >= 0 ? '#67c23a' : '#f56c6c'">
                <CaretTop v-if="statistics.dataGrowth >= 0" />
                <CaretBottom v-else />
              </el-icon>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-card shadow="hover" class="card-item">
            <div class="card-content">
              <div class="card-icon" style="background: #E6A23C;">
                <el-icon><Bell /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">未处理报警</div>
                <div class="card-value">{{ statistics.unresolvedAlarms }}</div>
              </div>
            </div>
            <div class="card-footer">
              <span>今日新增 {{ statistics.todayAlarms }} 条</span>
              <el-tag 
                v-if="statistics.unresolvedAlarms > 0"
                size="small" 
                type="danger"
              >
                紧急
              </el-tag>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <el-card shadow="hover" class="card-item">
            <div class="card-content">
              <div class="card-icon" style="background: #909399;">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">系统状态</div>
                <div class="card-value">{{ statistics.systemStatus }}</div>
              </div>
            </div>
            <div class="card-footer">
              <span>CPU {{ statistics.cpuUsage }}%</span>
              <el-tag 
                size="small" 
                :type="systemStatusType"
              >
                {{ systemStatusText }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 中间图表区域 -->
    <div class="chart-area">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="16">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>温度实时监控</span>
                <div class="chart-controls">
                  <el-radio-group v-model="tempTimeRange" size="small">
                    <el-radio-button value="1h">1小时</el-radio-button>
                    <el-radio-button value="6h">6小时</el-radio-button>
                    <el-radio-button value="24h">24小时</el-radio-button>
                  </el-radio-group>
                  <el-button 
                    type="primary" 
                    size="small" 
                    text
                    @click="refreshChart('temperature')"
                  >
                    <el-icon><Refresh /></el-icon>
                    刷新
                  </el-button>
                </div>
              </div>
            </template>
            <TemperatureChart ref="tempChartRef" :time-range="tempTimeRange" />
          </el-card>
        </el-col>
        
        <el-col :xs="24" :lg="8">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>设备状态分布</span>
              </div>
            </template>
            <DevicePieChart ref="deviceChartRef" :data="statistics.deviceStatusDistribution" />
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :xs="24" :lg="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>光照强度监控</span>
                <el-select v-model="selectedDevice" size="small" placeholder="选择设备">
                  <el-option
                    v-for="device in deviceList"
                    :key="device.vid"
                    :label="device.deviceName"
                    :value="device.vid"
                  />
                </el-select>
              </div>
            </template>
            <LightChart 
              ref="lightChartRef" 
              :time-range="tempTimeRange"
              :device-vid="selectedDevice" 
            />
          </el-card>
        </el-col>
        
        <el-col :xs="24" :lg="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>报警类型统计</span>
                <el-date-picker
                  v-model="alarmDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  size="small"
                  @change="handleAlarmDateChange"
                />
              </div>
            </template>
            <AlarmBarChart 
              ref="alarmChartRef" 
              :data="alarmChartData"
              :date-range="alarmDateRange" 
            />
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 底部设备列表 -->
    <div class="device-table">
      <el-card shadow="hover">
        <template #header>
          <div class="table-header">
            <span>设备实时状态</span>
            <div class="table-controls">
              <el-button type="primary" size="small" @click="refreshDeviceList">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
              <el-button type="success" size="small" @click="handleExport">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>
          </div>
        </template>
        <DeviceStatusTable 
          ref="deviceTableRef" 
          :data="deviceList"
          @device-click="handleDeviceClick"
          @view-detail="handleViewDetail"
          @control-device="handleControlDevice"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDashboardStatistics } from '@/api/dashboard'
import { getDeviceList } from '@/api/device'
import { getAlarmStatistics } from '@/api/alarm'
import { exportToCSV } from '@/utils/export'
import TemperatureChart from '@/components/charts/TemperatureChart.vue'
import DevicePieChart from '@/components/charts/DevicePieChart.vue'
import LightChart from '@/components/charts/LightChart.vue'
import AlarmBarChart from '@/components/charts/AlarmBarChart.vue'
import DeviceStatusTable from '@/components/device/DeviceStatusTable.vue'
import type { DeviceInfo } from '@/types/api'

const router = useRouter()

// 统计数据显示
const statistics = reactive({
  onlineDevices: 0,
  totalDevices: 0,
  todayData: 0,
  dataGrowth: 0,
  unresolvedAlarms: 0,
  todayAlarms: 0,
  alarmCount: 0,
  alarmTrend: 0,
  systemStatus: '正常',
  cpuUsage: 0,
  deviceStatusDistribution: {
    online: 0,
    offline: 0,
    fault: 0,
    maintenance: 0
  },
  recentAlarms: []
})

// 图表相关
const tempChartRef = ref()
const deviceChartRef = ref()
const lightChartRef = ref()
const alarmChartRef = ref()

const tempTimeRange = ref('1h')
const selectedDevice = ref('')
const deviceList = ref<DeviceInfo[]>([])
const alarmDateRange = ref<[Date, Date]>()

// 报警统计图表数据
const alarmChartData = ref<{ type: string; count: number; level: 'low' | 'medium' | 'high' | 'critical' }[]>([])

// 计算属性
const onlinePercentage = computed(() => {
  if (statistics.totalDevices === 0) return 0
  return Math.round((statistics.onlineDevices / statistics.totalDevices) * 100)
})

const systemStatusType = computed(() => {
  const status = statistics.systemStatus
  if (status === '正常') return 'success'
  if (status === '警告') return 'warning'
  if (status === '异常') return 'danger'
  return 'info'
})

const systemStatusText = computed(() => {
  return statistics.systemStatus
})

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const data = await getDashboardStatistics()
    Object.assign(statistics, data)
    
    // 获取报警统计数据并更新图表
    await fetchAlarmStatistics()
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取报警统计数据
const fetchAlarmStatistics = async () => {
  try {
    const response = await getAlarmStatistics()
    
    // 检查响应结构并提取统计数据
    let stats: any = null
    
    // 情况1: 响应遵循标准格式，数据在data字段中
    if (response && response.data && typeof response.data === 'object') {
      stats = response.data
    } 
    // 情况2: 响应直接包含统计数据字段
    else if (response && typeof response === 'object') {
      stats = response
    }
    
    if (stats) {
      // 将统计数据转换为图表需要的格式
      alarmChartData.value = [
        { type: '紧急', count: stats.critical || 0, level: 'critical' },
        { type: '重要', count: stats.high || 0, level: 'high' },
        { type: '一般', count: stats.medium || 0, level: 'medium' },
        { type: '提示', count: stats.low || 0, level: 'low' }
      ]
    } else {
      console.warn('报警统计数据格式不正确:', response)
      alarmChartData.value = []
    }
  } catch (error) {
    console.error('获取报警统计数据失败:', error)
    // 设置默认数据
    alarmChartData.value = []
  }
}

// 验证并标准化报警级别
const validateAlarmLevel = (level: string): 'low' | 'medium' | 'high' | 'critical' => {
  const validLevels: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical']
  if (validLevels.includes(level as any)) {
    return level as 'low' | 'medium' | 'high' | 'critical'
  }
  // 如果后端使用其他格式，尝试映射
  if (level === '紧急' || level === 'critical') return 'critical'
  if (level === '高' || level === 'high') return 'high'
  if (level === '中' || level === 'medium') return 'medium'
  if (level === '低' || level === 'low') return 'low'
  // 默认返回中等级别
  return 'medium'
}

// 获取设备列表
const fetchDeviceList = async () => {
  try {
    const data = await getDeviceList({ pageNum: 1, pageSize: 10 })
    deviceList.value = data.list
    if (deviceList.value.length > 0 && !selectedDevice.value) {
      selectedDevice.value = deviceList.value[0].vid
    }
  } catch (error) {
    console.error('获取设备列表失败:', error)
  }
}

// 刷新图表
const refreshChart = (type: string) => {
  switch (type) {
    case 'temperature':
      // 重新获取数据以实现刷新效果
      fetchStatistics()
      break
    case 'device':
      // 重新获取数据以实现刷新效果
      fetchDeviceList()
      break
    case 'light':
      // 重新获取数据以实现刷新效果
      if (lightChartRef.value && typeof lightChartRef.value.refresh === 'function') {
        lightChartRef.value.refresh()
      }
      break
    case 'alarm':
      // 重新获取数据以实现刷新效果
      fetchStatistics()
      break
  }
}

// 刷新设备列表
const refreshDeviceList = () => {
  fetchStatistics()
  fetchDeviceList()
}

// 处理设备点击
const handleDeviceClick = (device: DeviceInfo) => {
  router.push(`/device/detail/${device.vid}`)
}

// 处理查看设备详情
const handleViewDetail = (device: DeviceInfo) => {
  router.push(`/device/detail/${device.vid}`)
}

// 处理设备控制
const handleControlDevice = (device: DeviceInfo) => {
  router.push(`/device/detail/${device.vid}`)
}

// 处理报警日期变化
const handleAlarmDateChange = () => {
  fetchStatistics()
}

// 处理导出
const handleExport = async () => {
  try {
    ElMessageBox.confirm('确定导出设备状态数据吗？', '导出确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }).then(async () => {
      // 导出设备列表数据
      const exportData = deviceList.value.map(item => ({
        vid: item.vid,
        deviceName: item.deviceName || '-',
        deviceType: item.deviceType || '-',
        location: item.location || '-',
        status: item.status ? (typeof item.status === 'number' ? 
          (item.status === 0 ? '离线' : item.status === 1 ? '在线' : '故障') : 
          item.status.toString()) : '未知',
        lastOnlineTime: item.lastOnlineTime || '-',
        createTime: item.createTime || '-',
        remarks: item.remarks || '-'
      }))
      
      const headers = ['设备VID', '设备名称', '设备类型', '位置', '状态', '最后在线时间', '创建时间', '备注']
      const filename = `设备状态数据_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`
      
      exportToCSV(exportData, headers, filename)
      ElMessage.success('数据导出成功')
    })
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 定时刷新
let refreshTimer: number | null = null

const startAutoRefresh = () => {
  refreshTimer = window.setInterval(() => {
    fetchStatistics()
  }, 30000) // 30秒刷新一次
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

onMounted(async () => {
  await Promise.all([
    fetchStatistics(),
    fetchDeviceList(),
  ])
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  height: 100%;
  overflow-y: auto;
  background: var(--color-primary-medium);
  padding: 20px;
  color: var(--text-color-primary);
}

.statistics-cards {
  margin-bottom: 20px;
}

.card-item {
  margin-bottom: 15px;
  background: var(--card-bg) !important;
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--el-border-color) !important;
  }
  
  .card-content {
    display: flex;
    align-items: center;
    padding: 16px;
    
    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
      color: #fff;
      font-size: 20px;
      
      &[style*="background: #409EFF"] {
        background: linear-gradient(135deg, #bbdefb, #64b5f6) !important;
      }
      
      &[style*="background: #67C23A"] {
        background: linear-gradient(135deg, #c8e6c9, #81c784) !important;
      }
      
      &[style*="background: #E6A23C"] {
        background: linear-gradient(135deg, #ffe0b2, #ffb74d) !important;
      }
      
      &[style*="background: #909399"] {
        background: linear-gradient(135deg, #e0e0e0, #bdbdbd) !important;
      }
    }
    
    .card-info {
      flex: 1;
      
      .card-title {
        font-size: 14px;
        color: var(--text-color-secondary);
        margin-bottom: 4px;
      }
      
      .card-value {
        font-size: 20px;
        font-weight: 600;
        color: var(--text-color-primary);
      }
    }
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--text-color-tertiary);
    padding: 0 16px 12px;
    
    .el-progress {
      width: 60px;
    }
  }
}

.chart-area {
  margin-bottom: 20px;
}

.chart-card {
  height: 300px;
  background: var(--card-bg) !important;
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 8px !important;
  padding: 16px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-light);
    
    span {
      font-weight: 600;
      color: var(--text-color-primary);
      font-size: 16px;
    }
    
    .chart-controls {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }
}

.device-table {
  background: var(--card-bg) !important;
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 8px !important;
  padding: 16px;
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-light);
    
    span {
      font-weight: 600;
      color: var(--text-color-primary);
      font-size: 16px;
    }
    
    .table-controls {
      display: flex;
      gap: 8px;
    }
  }
}

// 响应式调整
@media (max-width: 1200px) {
  .chart-card {
    height: 280px;
  }
}

@media (max-width: 768px) {
  .statistics-cards {
    margin-bottom: 15px;
  }
  
  .chart-card {
    height: 260px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 8px;
  }
  
  .dashboard-container {
    padding: 12px;
  }
  
  .card-content {
    padding: 12px !important;
  }
}
</style>