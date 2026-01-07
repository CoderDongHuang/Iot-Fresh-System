<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useWebSocket } from '@/composables/useWebSocket'
import { getLightHistory } from '@/api/data'

interface Props {
  timeRange: string
  deviceVid?: string
}

const props = withDefaults(defineProps<Props>(), {
  timeRange: '1h',
  deviceVid: '',
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
      data: ['光照强度'],
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
        formatter: '{value} lux',
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
        },
      },
    },
    series: [
      {
        name: '光照强度',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: '#E6A23C',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
            { offset: 1, color: 'rgba(230, 162, 60, 0.1)' },
          ]),
        },
        itemStyle: {
          color: '#E6A23C',
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
    ],
  }
  
  chartInstance.setOption(option)
  
  // 响应式
  window.addEventListener('resize', handleResize)
}

// 定义光照强度数据类型
interface LightData {
  timestamp: string
  light: number
}

// 生成模拟数据的辅助函数
const generateAndShowMockData = (startTime: Date, endTime: Date) => {
  const mockData: LightData[] = Array.from({ length: 30 }, (_, i) => {
    const t = new Date(startTime.getTime() + (endTime.getTime() - startTime.getTime()) * i / 29)
    return {
      timestamp: t.toISOString(),
      light: 200 + Math.random() * 800, // 光照强度在200-1000 lux之间
    }
  })
  updateChart(mockData)
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
    
    // 如果有设备VID，则获取特定设备的光照数据
    if (props.deviceVid) {
      try {
        // 调用API获取特定设备的光照数据
        const data = await getLightHistory(props.deviceVid, {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          timeRange: props.timeRange
        })
        
        // 假设后端返回的数据格式为 { list: [{ timestamp, light }, ...] }
        if (data && Array.isArray(data.list)) {
          updateChart(data.list)
        } else {
          // 如果后端返回格式不同，使用mock数据
          generateAndShowMockData(startTime, endTime)
        }
      } catch (error) {
        console.error('获取光照强度历史数据失败:', error)
        // 使用mock数据作为fallback
        generateAndShowMockData(startTime, endTime)
      }
    } else {
      // 如果没有指定设备VID，使用mock数据
      generateAndShowMockData(startTime, endTime)
    }
  } catch (error) {
    console.error('获取光照强度数据失败:', error)
    // 发生错误时显示默认数据
    const defaultData: LightData[] = Array.from({ length: 10 }, (_, i) => {
      const t = new Date()
      t.setMinutes(t.getMinutes() - i)
      return {
        timestamp: t.toISOString(),
        light: 400,
      }
    })
    updateChart(defaultData)
  }
}

// 更新图表数据
const updateChart = (data: LightData[]) => {
  if (!chartInstance) return
  
  const lightData: [string, number][] = []
  
  data.forEach(item => {
    lightData.push([item.timestamp, item.light])
  })
  
  // 获取当前图表选项以保留其他配置
  const currentOption: any = chartInstance.getOption() || {}
  
  const option = {
    ...currentOption,
    series: [
      { 
        ...(currentOption.series && currentOption.series[0]), 
        data: lightData, 
        type: 'line', 
        name: '光照强度' 
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
  light?: number
  [key: string]: any
}

const handleRealtimeData = (data: RealtimeData) => {
  if (!chartInstance) return
  
  const time = new Date().toISOString()
  const option = chartInstance.getOption()
  
  if (option && option.series && Array.isArray(option.series) && option.series[0] && option.series[0].data) {
    const series = option.series as any[]
    const lightData = [...series[0].data as [string, number][]]
    
    // 添加新数据，最多保留100个点
    lightData.push([time, (data.light !== undefined && data.light !== null) ? data.light : 0])
    
    if (lightData.length > 100) {
      lightData.shift()
    }
    
    chartInstance.setOption({
      series: [
        { 
          ...series[0], 
          data: lightData, 
          type: series[0].type || 'line',
          name: series[0].name || '光照强度' 
        }
      ],
    })
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
  onMessage('light', (data: unknown) => {
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

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
  background: rgba(15, 30, 55, 0.4);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(41, 121, 255, 0.2);
  box-shadow: 
    0 4px 15px rgba(5, 20, 45, 0.3),
    inset 0 0 15px rgba(41, 121, 255, 0.1);
}
</style>
