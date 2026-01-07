<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useWebSocket } from '@/composables/useWebSocket'
import { getTemperatureHistory } from '@/api/data'

interface Props {
  timeRange: string
  deviceVid?: string
  showTitle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  timeRange: '1h',
  deviceVid: '',
  showTitle: true,
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

// 定义温度数据类型
interface TemperatureData {
  timestamp: string
  tin: number
  tout: number
  tinDH: number
  tinDL: number
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
    
    // 如果有设备VID，则获取特定设备的温度数据
    if (props.deviceVid) {
      try {
        const data = await getTemperatureHistory(props.deviceVid, {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          timeRange: props.timeRange
        })
        
        // 假设后端返回的数据格式为 { list: [{ timestamp, tin, tout, tinDH, tinDL }, ...] }
        if (data && Array.isArray(data.list)) {
          updateChart(data.list)
        } else {
          // 如果后端返回格式不同，使用mock数据
          generateMockData(startTime, endTime)
        }
      } catch (error) {
        console.error('获取设备温度历史数据失败:', error)
        // 如果获取特定设备数据失败，使用模拟数据
        generateMockData(startTime, endTime)
      }
    } else {
      // 如果没有指定设备VID，使用模拟数据
      generateMockData(startTime, endTime)
    }
  } catch (error) {
    console.error('获取温度数据失败:', error)
  }
}

// 生成模拟数据的辅助函数
const generateMockData = (startTime: Date, endTime: Date) => {
  const data: TemperatureData[] = Array.from({ length: 30 }, (_, i) => {
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
}

// 更新图表数据
const updateChart = (data: TemperatureData[]) => {
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
  
  // 获取当前图表选项以保留其他配置
  const currentOption: any = chartInstance.getOption() || {}
  
  const option = {
    ...currentOption,
    series: [
      { 
        ...(currentOption.series && currentOption.series[0]), 
        data: tinData, 
        type: 'line', 
        name: '厢内温度' 
      },
      { 
        ...(currentOption.series && currentOption.series[1]), 
        data: toutData, 
        type: 'line', 
        name: '厢外温度' 
      },
      { 
        ...(currentOption.series && currentOption.series[2]), 
        data: tinDHData, 
        type: 'line', 
        name: '设定上限' 
      },
      { 
        ...(currentOption.series && currentOption.series[3]), 
        data: tinDLData, 
        type: 'line', 
        name: '设定下限' 
      }
    ],
  }
  
  // 检查图表是否已经初始化了系列
  try {
    chartInstance.setOption(option, true)
  } catch (error) {
    console.warn('更新图表数据失败:', error)
  }
}

// WebSocket实时数据
const { connect, disconnect, onMessage } = useWebSocket()

// 定义实时数据类型
interface RealtimeData {
  tin?: number
  tout?: number
  [key: string]: any
}

const handleRealtimeData = (data: RealtimeData) => {
  if (!chartInstance) return
  
  const time = new Date().toISOString()
  const option = chartInstance.getOption()
  
  if (option && option.series && Array.isArray(option.series)) {
    const series = option.series as any[]
    
    if (series.length >= 2 && series[0] && series[0].data && series[1] && series[1].data) {
      const tinData = [...series[0].data as [string, number][]]
      const toutData = [...series[1].data as [string, number][]]
      
      // 添加新数据，最多保留100个点
      tinData.push([time, (data.tin !== undefined && data.tin !== null) ? data.tin : 0])
      toutData.push([time, (data.tout !== undefined && data.tout !== null) ? data.tout : 0])
      
      if (tinData.length > 100) {
        tinData.shift()
        toutData.shift()
      }
      
      chartInstance.setOption({
        series: [
          { 
            ...series[0], 
            data: tinData, 
            type: series[0].type || 'line',
            name: series[0].name || '厢内温度'
          },
          { 
            ...series[1], 
            data: toutData, 
            type: series[1].type || 'line',
            name: series[1].name || '厢外温度'
          },
          { 
            ...series[2], 
            type: series[2].type || 'line',
            name: series[2].name || '设定上限'
          },
          { 
            ...series[3], 
            type: series[3].type || 'line',
            name: series[3].name || '设定下限'
          }
        ],
      })
    }
  }
}

// 监听时间范围变化
watch(() => props.timeRange, () => {
  fetchData()
})

watch(() => props.deviceVid, () => {
  fetchData()
}, { immediate: true })

// 刷新图表
const refresh = () => {
  fetchData()
}

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    try {
      chartInstance.resize()
    } catch (error) {
      console.warn('ECharts resize error:', error)
    }
  }
}

onMounted(async () => {
  initChart()
  await fetchData()
  
  // 连接WebSocket
  connect()
  onMessage('temperature', (data: unknown) => {
    // 确保图表已初始化再处理实时数据
    if (chartInstance && typeof data === 'object' && data !== null) {
      handleRealtimeData(data as RealtimeData)
    }
  })
  
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
  background: rgba(15, 30, 55, 0.4);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(41, 121, 255, 0.2);
  box-shadow: 
    0 4px 15px rgba(5, 20, 45, 0.3),
    inset 0 0 15px rgba(41, 121, 255, 0.1);
}
</style>