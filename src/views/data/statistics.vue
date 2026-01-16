<template>
  <div class="data-statistics-view">
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="设备VID">
          <el-select v-model="searchForm.vid" placeholder="请选择设备" clearable filterable>
            <el-option 
              v-for="device in deviceList" 
              :key="device.vid" 
              :label="`${device.vid} (${device.deviceName})`" 
              :value="device.vid" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="统计类型">
          <el-select v-model="searchForm.statType" placeholder="请选择统计类型" clearable>
            <el-option label="温度统计" value="temperature" />
            <el-option label="湿度统计" value="humidity" />
            <el-option label="光照统计" value="light" />
            <el-option label="综合统计" value="comprehensive" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计概览卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ stats.totalRecords }}</div>
            <div class="stat-label">总记录数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ stats.avgTemp }}°C</div>
            <div class="stat-label">平均温度</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ stats.maxTemp }}°C</div>
            <div class="stat-label">最高温度</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ stats.minTemp }}°C</div>
            <div class="stat-label">最低温度</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>温度趋势图</span>
            </div>
          </template>
          <div ref="tempChartRef" class="chart-container" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>数据分布图</span>
            </div>
          </template>
          <div ref="distChartRef" class="chart-container" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细统计表格 -->
    <el-card shadow="never" class="data-table-card">
      <template #header>
        <div class="card-header">
          <span>详细统计信息</span>
          <div class="table-controls">
            <el-button type="primary" size="small" @click="refreshData">刷新</el-button>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="statisticsData" 
        style="width: 100%" 
        stripe 
        v-loading="loading"
      >
        <el-table-column prop="deviceName" label="设备名称" width="150" />
        <el-table-column prop="vid" label="设备VID" width="150" />
        <el-table-column prop="avgTemp" label="平均温度(℃)" width="120" />
        <el-table-column prop="maxTemp" label="最高温度(℃)" width="120" />
        <el-table-column prop="minTemp" label="最低温度(℃)" width="120" />
        <el-table-column prop="avgHumidity" label="平均湿度(%)" width="120" />
        <el-table-column prop="avgLight" label="平均光照" width="120" />
        <el-table-column prop="recordCount" label="记录数" width="100" />
        <el-table-column prop="timeRange" label="时间范围" width="200" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { getDeviceList } from '@/api/device'
import { getDataStatistics } from '@/api/dashboard'
import type { DeviceInfo, PageResult } from '@/types/api'
import * as echarts from 'echarts'

// 搜索表单
const searchForm = reactive({
  vid: '',
  statType: '',
  dateRange: [] as string[] | null
})

// 统计数据
const stats = reactive({
  totalRecords: 0,
  avgTemp: 0,
  maxTemp: 0,
  minTemp: 0
})

// 设备列表
const deviceList = ref<DeviceInfo[]>([])
const statisticsData = ref<any[]>([])
const loading = ref(false)

// 图表引用
const tempChartRef = ref<HTMLDivElement>()
const distChartRef = ref<HTMLDivElement>()
let tempChart: echarts.ECharts | null = null
let distChart: echarts.ECharts | null = null

// 搜索处理
const handleSearch = async () => {
  await fetchStatistics()
}

// 重置搜索
const resetSearch = () => {
  searchForm.vid = ''
  searchForm.statType = ''
  searchForm.dateRange = null
  fetchStatistics()
}

// 刷新数据
const refreshData = () => {
  fetchStatistics()
}

// 获取统计信息
const fetchStatistics = async () => {
  loading.value = true
  try {
    // 获取设备列表
    const deviceResponse = await getDeviceList({ pageNum: 1, pageSize: 100 })
    deviceList.value = deviceResponse.list || []
    
    // 构建查询参数
    const params: any = {
      vid: searchForm.vid,
      statType: searchForm.statType
    }
    
    // 添加时间范围参数
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startTime = searchForm.dateRange[0]
      params.endTime = searchForm.dateRange[1]
    }
    
    const response: any = await getDataStatistics(params)
    statisticsData.value = response.detail || []
    
    // 更新概览数据
    stats.totalRecords = response.totalRecords || 0
    stats.avgTemp = parseFloat(response.avgTemp?.toFixed(2) || '0')
    stats.maxTemp = parseFloat(response.maxTemp?.toFixed(2) || '0')
    stats.minTemp = parseFloat(response.minTemp?.toFixed(2) || '0')
    
    // 更新图表
    await nextTick()
    initCharts()
    
  } catch (error) {
    console.error('查询统计信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  // 温度趋势图
  if (tempChartRef.value) {
    tempChart = echarts.init(tempChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: statisticsData.value.map((_, index) => `设备${index + 1}`)
      },
      yAxis: {
        type: 'value',
        name: '温度 (°C)'
      },
      series: [
        {
          name: '平均温度',
          type: 'line',
          data: statisticsData.value.map(item => item.avgTemp),
          itemStyle: { color: '#5cb87a' },
          lineStyle: { color: '#5cb87a' }
        },
        {
          name: '最高温度',
          type: 'line',
          data: statisticsData.value.map(item => item.maxTemp),
          itemStyle: { color: '#f56c6c' },
          lineStyle: { color: '#f56c6c' }
        },
        {
          name: '最低温度',
          type: 'line',
          data: statisticsData.value.map(item => item.minTemp),
          itemStyle: { color: '#409eff' },
          lineStyle: { color: '#409eff' }
        }
      ]
    }
    tempChart.setOption(option)
  }
  
  // 数据分布图
  if (distChartRef.value) {
    distChart = echarts.init(distChartRef.value)
    const option = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'horizontal',
        top: 'top'
      },
      series: [
        {
          name: '数据分布',
          type: 'pie',
          radius: '50%',
          data: [
            { value: stats.avgTemp, name: '平均温度' },
            { value: stats.maxTemp, name: '最高温度' },
            { value: stats.minTemp, name: '最低温度' },
            { value: stats.totalRecords, name: '记录数' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    distChart.setOption(option)
  }
}

// 页面卸载时销毁图表
onMounted(async () => {
  await fetchStatistics()
})

// 销毁图表实例
onUnmounted(() => {
  if (tempChart) {
    tempChart.dispose()
  }
  if (distChart) {
    distChart.dispose()
  }
})
</script>

<style scoped>
.data-statistics-view {
  padding: 20px;
  background: var(--color-primary-medium);
  min-height: 100vh;
}

.search-card {
  margin-bottom: 20px;
  background: var(--card-bg) !important;
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 8px !important;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.search-form .el-form-item {
  margin-bottom: 12px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  background: var(--card-bg) !important;
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 8px !important;
  text-align: center;
}

.stat-item {
  padding: 20px 0;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--color-accent-green);
  margin-bottom: 8px;
}

.stat-label {
  color: var(--text-color-secondary);
  font-size: 14px;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  background: var(--card-bg) !important;
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 8px !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.data-table-card {
  background: var(--card-bg) !important;
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 8px !important;
}

.table-controls {
  display: flex;
  gap: 10px;
}
</style>
