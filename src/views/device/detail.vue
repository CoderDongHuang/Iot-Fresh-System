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
    
    <!-- 历史数据图表和表格 -->
    <el-row :gutter="20">
      <!-- 历史数据图表 -->
      <el-col :span="12">
        <el-card shadow="hover" class="history-chart-card">
          <template #header>
            <div class="card-header">
              <span>历史数据趋势图</span>
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
          
          <div ref="historyChartRef" style="width: 100%; height: 400px;"></div>
        </el-card>
      </el-col>
      
      <!-- 历史数据表格 -->
      <el-col :span="12">
        <el-card shadow="hover" class="history-table-card">
          <template #header>
            <div class="card-header">
              <span>历史数据记录</span>
              <el-button size="small" @click="toggleTableExpand" :icon="tableExpanded ? 'el-icon-Fold' : 'el-icon-Expand'">
                {{ tableExpanded ? '收起' : '展开' }}
              </el-button>
            </div>
          </template>
          
          <el-table v-loading="loadingHistoryData" :data="historyData" style="width: 100%" stripe 
                    :max-height="tableExpanded ? 400 : 200">
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
                <el-tag :type="getStatusTagType(row.vStatus)" size="small">
                  {{ getStatusText(row.vStatus) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
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
const tableExpanded = ref(false)
const historyChartRef = ref<HTMLElement>()
let historyChart: echarts.ECharts | null = null

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

// 表格展开/收起切换
const toggleTableExpand = () => {
  tableExpanded.value = !tableExpanded.value
}

// 初始化图表
const initHistoryChart = () => {
  if (!historyChartRef.value) return
  
  historyChart = echarts.init(historyChartRef.value)
  
  // 设置默认图表配置
   const option = {
     title: {
       text: '设备数据趋势图',
       left: 'center',
       top: 10,
       textStyle: {
         color: '#333',
         fontSize: 16
       }
     },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
       data: ['箱内温度', '箱外温度', '光照强度'],
       top: 40
     },
    grid: {
       left: '3%',
       right: '4%',
       bottom: '3%',
       top: '20%',
       containLabel: true
     },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: []
    },
    yAxis: [
      {
        type: 'value',
        name: '温度(℃)',
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#5470C6'
          }
        },
        axisLabel: {
          formatter: '{value}℃'
        }
      },
      {
        type: 'value',
        name: '光照强度(lux)',
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#91CC75'
          }
        },
        axisLabel: {
          formatter: '{value} lux'
        }
      }
    ],
    series: [
      {
        name: '箱内温度',
        type: 'line',
        yAxisIndex: 0,
        data: [],
        itemStyle: {
          color: '#5470C6'
        },
        lineStyle: {
          width: 2
        }
      },
      {
        name: '箱外温度',
        type: 'line',
        yAxisIndex: 0,
        data: [],
        itemStyle: {
          color: '#EE6666'
        },
        lineStyle: {
          width: 2
        }
      },
      {
        name: '光照强度',
        type: 'line',
        yAxisIndex: 1,
        data: [],
        itemStyle: {
          color: '#91CC75'
        },
        lineStyle: {
          width: 2
        }
      }
    ]
  }
  
  historyChart.setOption(option)
}

// 数据字段映射函数
const mapDataFields = (data: any) => {
  // 根据后端实际返回的字段名称进行映射（注意：后端返回的是大写字母开头的字段）
  return {
    timestamp: data.timestamp || data.update_at || data.time || data.create_time || data.update_time || data.createdAt,
    tin: data.tin || data.Tin || data.Hin || data.t_in || data.temperature_in || data.temp_internal || 0,
    tout: data.tout || data.Tout || data.Hout || data.t_out || data.temperature_out || data.temp_external || 0,
    lxin: data.lxin || data.LXin || data.lx_in || data.light_intensity || data.light || 0,
    vStatus: data.vStatus || data.vstatus || data.v_status || data.status || data.device_status || 0
  }
}

// 更新图表数据
const updateChartData = (data: any[]) => {
  if (!historyChart) return
  
  // 处理数据：按时间排序，最新的在前
  const mappedData = data.map(mapDataFields)
  const sortedData = [...mappedData].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  
  const timeData = sortedData.map(item => {
    const date = new Date(item.timestamp)
    // 根据时间范围显示不同的时间格式
    if (timeRange.value === '1h' || timeRange.value === '6h') {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    } else if (timeRange.value === '24h') {
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:00`
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`
    }
  })
  
  const tinData = sortedData.map(item => item.tin || 0)
  const toutData = sortedData.map(item => item.tout || 0)
  const lxinData = sortedData.map(item => item.lxin || 0)
  
  const option = {
    xAxis: {
      data: timeData
    },
    series: [
      {
        data: tinData
      },
      {
        data: toutData
      },
      {
        data: lxinData
      }
    ]
  }
  
  historyChart.setOption(option)
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
    let rawData = []
    if (Array.isArray(responseData)) {
      // 如果直接返回数组
      rawData = responseData
      console.log('✅ 历史数据加载成功，数组长度:', responseData.length)
    } else if (responseData && responseData.list && Array.isArray(responseData.list)) {
      // 如果返回的是包含list的对象
      rawData = responseData.list
      console.log('✅ 历史数据加载成功，list长度:', responseData.list.length)
    } else {
      // 其他情况，直接赋值（可能为空数组）
      rawData = []
      console.log('⚠️ 历史数据格式异常，设置为空数组')
    }
    
    // 对数据进行字段映射
    historyData.value = rawData.map(mapDataFields)
    console.log('📊 原始数据:', rawData)
    console.log('📊 映射后的历史数据:', historyData.value)
    
    // 更新图表数据
    if (historyData.value.length > 0) {
      await nextTick()
      updateChartData(historyData.value)
    }
    
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
  if (deviceInfo.value.vid) {
    router.push(`/control?device=${deviceInfo.value.vid}`)
  }
}

// 组件挂载时初始化
onMounted(async () => {
  await fetchDeviceDetail()
  await nextTick()
  initHistoryChart()
  await fetchHistoryData()
})

// 组件卸载时清理
onUnmounted(() => {
  if (historyChart) {
    historyChart.dispose()
    historyChart = null
  }
})

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
      return 'success' // 在线 - 绿色
    case 'offline':
    case '0':
      return 'info'    // 离线 - 灰色
    case 'fault':
    case '2':
      return 'danger'  // 故障 - 红色
    case '3':
      return 'warning' // 维护 - 橙色
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

.history-chart-card {
  margin-top: 20px;
  height: 500px;
}

.history-table-card {
  margin-top: 20px;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 图表容器样式 */
.history-chart-card .el-card__body {
  padding: 15px 15px 5px 15px;
}

/* 表格容器样式 */
.history-table-card .el-card__body {
  padding: 10px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .el-row {
    flex-direction: column;
  }
  
  .el-col {
    width: 100%;
    max-width: 100%;
  }
  
  .history-chart-card,
  .history-table-card {
    margin-top: 10px;
  }
}


</style>