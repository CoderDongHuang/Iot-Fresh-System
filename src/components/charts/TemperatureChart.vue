<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useWebSocket } from '@/composables/useWebSocket'
// import { getTemperatureHistory } from '@/api/data' // TODO: 实现 getTemperatureHistory API

interface Props {
  timeRange: string
}

const props = withDefaults(defineProps<Props>(), {
  timeRange: '1h',
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null
let dataUpdateInterval: ReturnType<typeof setInterval>

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  
  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderWidth: 0,
      textStyle: {
        color: '#333',
      },
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    legend: {
      data: ['厢内温度', '厢外温度', '设定上限', '设定下限'],
      textStyle: {
        color: '#666',
      },
      top: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'time',
      boundaryGap: [0, 0],
      axisLine: {
        lineStyle: {
          color: '#ddd',
        },
      },
      axisLabel: {
        color: '#666',
        formatter: (value: number) => {
          const date = new Date(value)
          return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#ddd',
        },
      },
      axisLabel: {
        color: '#666',
        formatter: '{value}°C',
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
        },
      },
    },
    series: [
      {
        name: '厢内温度',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: '#409EFF',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' },
          ]),
        },
        itemStyle: {
          color: '#409EFF',
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
      {
        name: '厢外温度',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: '#67C23A',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.1)' },
          ]),
        },
        itemStyle: {
          color: '#67C23A',
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
      {
        name: '设定上限',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#F56C6C',
          type: 'dashed',
        },
      },
      {
        name: '设定下限',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: '#E6A23C',
          type: 'dashed',
        },
      },
    ],
  }
  
  chartInstance.setOption(option)
  
  // 响应式
  window.addEventListener('resize', handleResize)
}

// 获取数据
const fetchData = async () => {
  try {
    const endTime = new Date()
    const startTime = new Date()
    switch (props.timeRange) {
      case '1h':
        startTime.setHours(startTime.getHours() - 1)
        break
      case '6h':
        startTime.setHours(startTime.getHours() - 6)
        break
      case '24h':
        startTime.setDate(startTime.getDate() - 1)
        break
    }
    // mock 数据，实际请替换为后端接口
    const data = Array.from({ length: 30 }, (_, i) => {
      const t = new Date(startTime.getTime() + (endTime.getTime() - startTime.getTime()) * i / 29)
      return {
        timestamp: t.toISOString(),
        tin: 10 + Math.random() * 10,
        tout: 5 + Math.random() * 10,
        tinDH: 25,
        tinDL: 5
      }
    })
    updateChart(data)
  } catch (error) {
    console.error('获取温度数据失败:', error)
  }
}

// 更新图表数据
const updateChart = (data: any[]) => {
  if (!chartInstance) return
  
  const tinData: [string, number][] = []
  const toutData: [string, number][] = []
  const tinDHData: [string, number][] = []
  const tinDLData: [string, number][] = []
  
  data.forEach(item => {
    const time = item.timestamp
    tinData.push([time, item.tin])
    toutData.push([time, item.tout])
    tinDHData.push([time, item.tinDH || 25])
    tinDLData.push([time, item.tinDL || 5])
  })
  
  chartInstance.setOption({
    series: [
      { data: tinData },
      { data: toutData },
      { data: tinDHData },
      { data: tinDLData },
    ],
  })
}

// WebSocket实时数据
const { connect, disconnect, onMessage } = useWebSocket()

const handleRealtimeData = (data: any) => {
  if (!chartInstance) return
  
  const time = new Date().toISOString()
  const series = chartInstance.getOption().series as any[]
  
  if (series && series[0] && series[0].data) {
    const tinData = series[0].data as [string, number][]
    const toutData = series[1].data as [string, number][]
    
    // 添加新数据，最多保留100个点
    tinData.push([time, data.tin])
    toutData.push([time, data.tout])
    
    if (tinData.length > 100) {
      tinData.shift()
      toutData.shift()
    }
    
    chartInstance.setOption({
      series: [
        { data: tinData },
        { data: toutData },
      ],
    })
  }
}

// 监听时间范围变化
watch(() => props.timeRange, () => {
  fetchData()
})

// 刷新图表
const refresh = () => {
  fetchData()
}

// 处理窗口大小变化
const handleResize = () => {
  chartInstance?.resize()
}

onMounted(async () => {
  initChart()
  await fetchData()
  
  // 连接WebSocket
  connect()
  onMessage('temperature', handleRealtimeData)
  
  // 定时更新数据
  dataUpdateInterval = setInterval(fetchData, 60000) // 每分钟更新一次
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  
  disconnect()
  window.removeEventListener('resize', handleResize)
  
  if (dataUpdateInterval) {
    clearInterval(dataUpdateInterval)
  }
})

// 暴露方法给父组件
defineExpose({
  refresh,
})
</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 250px;
}
</style>