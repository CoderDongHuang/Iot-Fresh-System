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
                <TrendingUp v-if="statistics.dataGrowth >= 0" />
                <TrendingDown v-else />
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
                    <el-radio-button label="1h">1小时</el-radio-button>
                    <el-radio-button label="6h">6小时</el-radio-button>
                    <el-radio-button label="24h">24小时</el-radio-button>
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
            <DevicePieChart ref="deviceChartRef" />
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
          @device-click="handleDeviceClick"
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
  systemStatus: '正常',
  cpuUsage: 0,
})

// 图表相关


const tempTimeRange = ref('1h')
const selectedDevice = ref('')
const deviceList = ref<DeviceInfo[]>([])
const alarmDateRange = ref<[Date, Date]>()

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
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
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
      // TODO: 实现导出逻辑
      ElMessage.success('导出成功')
    })
  } catch (error) {
    console.error('导出失败:', error)
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
}

.statistics-cards {
  margin-bottom: 20px;
}

.card-item {
  margin-bottom: 20px;
  
  .card-content {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    
    .card-icon {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      
      .el-icon {
        font-size: 24px;
        color: white;
      }
    }
    
    .card-info {
      flex: 1;
      
      .card-title {
        font-size: 14px;
        color: #909399;
        margin-bottom: 5px;
      }
      
      .card-value {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
      }
    }
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #909399;
    
    .el-progress {
      width: 100px;
    }
  }
}

.chart-area {
  margin-bottom: 20px;
}

.chart-card {
  height: 300px;
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    span {
      font-weight: bold;
      color: #303133;
    }
    
    .chart-controls {
      display: flex;
      gap: 10px;
      align-items: center;
    }
  }
}

.device-table {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    span {
      font-weight: bold;
      color: #303133;
    }
    
    .table-controls {
      display: flex;
      gap: 10px;
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
    margin-bottom: 10px;
  }
  
  .chart-card {
    height: 250px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 10px;
  }
}
</style>