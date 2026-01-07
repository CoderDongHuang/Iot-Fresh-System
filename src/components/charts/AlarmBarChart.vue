<template>
  <div class="alarm-bar-chart" ref="chartRef" :style="{ height: height, width: width }" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'

// 定义组件属性
interface Props {
  width?: string
  height?: string
  data?: AlarmChartData[]
  dateRange?: [Date, Date]
}

// 报警数据类型
interface AlarmChartData {
  type: string
  count: number
  level: 'low' | 'medium' | 'high' | 'critical'
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px',
  data: () => [],
  dateRange: () => [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()] // 默认7天范围
})

// 定义事件
interface Emits {
  (e: 'click', params: any): void
  (e: 'data-update', data: AlarmChartData[]): void
}

const emit = defineEmits<Emits>()

// 图表引用
const chartRef = ref<HTMLElement>()
let chart: EChartsType | null = null

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    
    const option = getChartOption()
    
    chart.setOption(option)
    
    // 添加点击事件
    chart.on('click', (params) => {
      emit('click', params)
    })
  }
}

// 获取图表配置
const getChartOption = () => {
  const hasData = props.data && props.data.length > 0
  const xAxisData = hasData ? props.data.map(item => item.type) : []
  const seriesData = hasData ? props.data.map(item => ({
    value: item.count,
    itemStyle: {
      color: getAlarmColor(item.level)
    }
  })) : []
  
  return {
    title: {
      text: '报警类型统计',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const param = params[0]
        return `${param.axisValue}<br/>${param.marker}${param.seriesName}: ${param.value}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: '数量'
    },
    series: [
      {
        name: '报警数量',
        type: 'bar',
        barWidth: '60%',
        data: seriesData,
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
}

// 获取报警级别颜色
const getAlarmColor = (level: string) => {
  const colorMap: Record<string, string> = {
    'critical': '#F56C6C',  // 红色 - 危急
    'high': '#E6A23C',      // 橙色 - 高
    'medium': '#F7BA2A',    // 黄色 - 中
    'low': '#909399'        // 灰色 - 低
  }
  return colorMap[level] || '#909399'
}

// 更新图表
const updateChart = () => {
  if (chart) {
    const option = getChartOption()
    chart.setOption(option, true)
  }
}

// 监听数据变化
watch(() => props.data, (newData) => {
  nextTick(() => {
    if (chart && newData) {
      updateChart()
    } else if (!chart) {
      // 如果图表还未初始化，先初始化图表
      initChart()
    }
  })
}, { deep: true })

// 组件挂载时初始化图表
onMounted(() => {
  nextTick(() => {
    if (!chart) {
      initChart()
    }
  })
})

// 组件卸载时销毁图表
onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
})

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  if (chart) {
    try {
      chart.resize()
    } catch (error) {
      console.warn('ECharts resize error:', error)
    }
  }
}

window.addEventListener('resize', handleResize)

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chart) {
    chart.dispose()
  }
})
</script>

<style scoped>
.alarm-bar-chart {
  width: 100%;
  height: 100%;
  background: rgba(15, 30, 55, 0.4);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(41, 121, 255, 0.2);
  box-shadow: 
    0 4px 15px rgba(5, 20, 45, 0.3),
    inset 0 0 15px rgba(41, 121, 255, 0.1);
}
</style>
