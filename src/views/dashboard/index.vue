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
            <TemperatureChart 
              ref="tempChartRef" 
              :time-range="tempTimeRange"
              @click="handleChartClick('temperature')"
              class="chart-item"
            />
          </el-card>
        </el-col>
        
        <el-col :xs="24" :lg="8">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>设备状态分布</span>
              </div>
            </template>
            <DevicePieChart 
              ref="deviceChartRef" 
              :data="statistics.deviceStatusDistribution"
              @click="handleChartClick('device')"
              class="chart-item"
            />
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :xs="24" :lg="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>光照强度监控</span>
                <el-select v-model="selectedDevice" size="small" placeholder="选择设备" style="width: 150px;">
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
              @click="handleChartClick('light')"
              class="chart-item"
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
              @click="handleChartClick('alarm')"
              class="chart-item"
            />
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 放大图表弹窗 -->
    <el-dialog 
      v-model="showZoomedChart" 
      :title="zoomedChartTitle" 
      width="98%"
      top="1vh"
      :show-close="true"
      custom-class="chart-dialog"
      @close="closeZoomedChart"
    >
      
      <div class="zoomed-chart-container">
        <TemperatureChart 
          v-if="zoomedChart === 'temperature'"
          :time-range="tempTimeRange"
          class="zoomed-chart"
        />
        <DevicePieChart 
          v-if="zoomedChart === 'device'"
          :data="statistics.deviceStatusDistribution"
          class="zoomed-chart"
        />
        <LightChart 
          v-if="zoomedChart === 'light'"
          :time-range="tempTimeRange"
          :device-vid="selectedDevice"
          class="zoomed-chart"
        />
        <AlarmBarChart 
          v-if="zoomedChart === 'alarm'"
          :data="alarmChartData"
          :date-range="alarmDateRange"
          class="zoomed-chart"
        />
      </div>
    </el-dialog>
    
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
        
        <!-- 分页组件 -->
        <div class="pagination-container" style="margin-top: 20px; text-align: center;">
          <el-pagination
            v-model:current-page="deviceCurrentPage"
            v-model:page-size="devicePageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="deviceTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleDeviceSizeChange"
            @current-change="handleDeviceCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
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

// 设备列表分页相关
const deviceCurrentPage = ref(1)
const devicePageSize = ref(10)
const deviceTotal = ref(0)

// 报警统计图表数据
const alarmChartData = ref<{ type: string; count: number; level: 'low' | 'medium' | 'high' | 'critical' }[]>([])

// 图表放大功能
const zoomedChart = ref<string>('')
const zoomedChartTitle = ref<string>('')
const showZoomedChart = ref<boolean>(false)

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

// 获取设备列表
const fetchDeviceList = async () => {
  try {
    const params = {
      pageNum: deviceCurrentPage.value,
      pageSize: devicePageSize.value
    }
    
    const response: any = await getDeviceList(params)
    
    // 检查响应格式并提取数据
    let resultData = null
    if (response && response.data) {
      // 标准格式: { code: 200, msg: 'success', data: { list: [], total: 100 } }
      resultData = response.data
    } else if (response && response.list) {
      // 直接格式: { list: [], total: 100 }
      resultData = response
    }
    
    if (resultData && resultData.list) {
      // 数据标准化：适配数据库字段名和设备类型映射
      const normalizedList = resultData.list.map((device: any) => ({
        ...device,
        // 使用数据库字段名
        vid: device.vid,
        deviceName: device.device_name || device.deviceName,
        deviceType: device.device_type || device.deviceType,
        deviceTypeName: getDeviceTypeName(device.device_type || device.deviceType),
        status: device.status,
        location: device.location,
        description: device.description,
        manufacturer: device.manufacturer,
        model: device.model,
        firmwareVersion: device.firmware_version || device.firmwareVersion,
        ipAddress: device.ip_address || device.ipAddress,
        macAddress: device.mac_address || device.macAddress,
        lastOnlineTime: device.last_online_time || device.lastOnlineTime,
        createdAt: device.created_at || device.createTime
      }))
      
      deviceList.value = normalizedList
      deviceTotal.value = resultData.total || resultData.list.length
      
      if (deviceList.value.length > 0 && !selectedDevice.value) {
        selectedDevice.value = deviceList.value[0].vid
      }
    } else {
      console.warn('设备列表数据格式不正确:', response)
      deviceList.value = []
      deviceTotal.value = 0
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

// 设备列表分页处理
const handleDeviceSizeChange = (size: number) => {
  devicePageSize.value = size
  deviceCurrentPage.value = 1
  fetchDeviceList()
}

const handleDeviceCurrentChange = (page: number) => {
  deviceCurrentPage.value = page
  fetchDeviceList()
}

// 刷新设备列表
const refreshDeviceList = () => {
  deviceCurrentPage.value = 1
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

// 处理图表点击放大
const handleChartClick = (chartType: string) => {
  const chartTitles = {
    temperature: '温度监控图表',
    device: '设备状态分布',
    light: '光照强度监控',
    alarm: '报警类型统计'
  }
  
  zoomedChart.value = chartType
  zoomedChartTitle.value = chartTitles[chartType as keyof typeof chartTitles]
  showZoomedChart.value = true
  
  // 延迟触发图表resize，确保弹窗完全打开
  setTimeout(() => {
    const chartRefs = {
      temperature: tempChartRef,
      device: deviceChartRef,
      light: lightChartRef,
      alarm: alarmChartRef
    }
    
    const currentChartRef = chartRefs[chartType as keyof typeof chartRefs]
    if (currentChartRef?.value && typeof currentChartRef.value.resize === 'function') {
      currentChartRef.value.resize()
    }
  }, 300)
}

// 关闭放大图表
const closeZoomedChart = () => {
  zoomedChart.value = ''
  zoomedChartTitle.value = ''
  showZoomedChart.value = false
}

// 处理导出
const handleExport = async () => {
  try {
    ElMessageBox.confirm('确定导出设备状态数据吗？', '导出确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    }).then(async () => {
      // 导出设备列表数据（与表格显示字段保持一致）
      const exportData = deviceList.value.map(item => ({
        vid: item.vid || '-',
        deviceName: item.deviceName || '-',
        deviceType: item.deviceType ? (item.deviceType === 'storage' ? '存储设备' : 
                                      item.deviceType === 'transport' ? '运输设备' : 
                                      item.deviceType === 'monitor' ? '监控设备' : 
                                      item.deviceType === 'control' ? '控制设备' : item.deviceType) : '-',
        status: item.status ? (typeof item.status === 'number' ? 
          (item.status === 0 ? '离线' : item.status === 1 ? '在线' : 
           item.status === 2 ? '故障' : item.status === 3 ? '维护' : '未知') : 
          item.status.toString()) : '未知',
        location: item.location || '-',
        contactPhone: item.contactPhone || '-',
        lastHeartbeat: item.lastHeartbeat ? new Date(item.lastHeartbeat).toLocaleString() : '-',
        description: item.description || '-'
      }))
      
      const headers = ['设备VID', '设备名称', '设备类型', '状态', '位置', '联系电话', '最后心跳', '描述']
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

// 图表点击放大样式
.chart-item {
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.chart-dialog {
    .el-dialog {
      max-width: 90vw !important;
      max-height: 85vh !important;
      margin: 5vh auto !important;
    }
    
    .el-dialog__header {
      padding: 0;
      margin: 0;
    }
    
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--el-border-color-light);
      position: relative;
      
      span {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-color-primary);
      }
      
      .browser-close-btn {
        position: absolute;
        right: 15px;
        top: 15px;
        z-index: 1000;
        margin: 0;
        background: transparent;
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          background: #f56c6c;
          
          .el-icon {
            color: white;
          }
        }
        
        .el-icon {
          font-size: 16px;
          color: #999;
          transition: color 0.2s ease;
        }
      }
    }
  
  .el-dialog__body {
      padding: 0 !important;
      max-height: calc(85vh - 60px) !important;
    }
    
    .zoomed-chart-container {
      height: calc(85vh - 60px);
      padding: 5px;
      overflow: auto;
      
      .zoomed-chart {
        height: 100% !important;
        width: 100% !important;
        min-height: 500px !important;
      }
      
      /* 确保温度和光照图表在放大状态下使用正确的样式 */
      .zoomed-chart .chart-container {
        height: 100% !important;
        width: 100% !important;
        min-height: 500px !important;
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