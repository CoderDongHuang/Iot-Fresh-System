<template>
  <div class="device-pie-chart" ref="chartRef" :style="{ height: height, width: width }" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'
import type { DeviceStatusDistribution } from '@/types/api'

// 定义组件属性
interface Props {
  width?: string
  height?: string
  data?: DeviceStatusDistribution
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px',
  data: () => ({
    online: 0,
    offline: 0,
    fault: 0,
    maintenance: 0
  })
})

// 定义事件
interface Emits {
  (e: 'click', params: any): void
}

const emit = defineEmits<Emits>()

// 图表引用
const chartRef = ref<HTMLElement>()
let chart: EChartsType | null = null

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    
    const option = {
      title: {
        text: '设备状态分布',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '设备状态',
          type: 'pie',
          radius: '50%',
          data: [
            { value: props.data.online, name: '在线', itemStyle: { color: '#67C23A' } },
            { value: props.data.offline, name: '离线', itemStyle: { color: '#909399' } },
            { value: props.data.fault, name: '故障', itemStyle: { color: '#F56C6C' } },
            { value: props.data.maintenance, name: '维护', itemStyle: { color: '#E6A23C' } }
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
    
    chart.setOption(option)
    
    // 添加点击事件
    chart.on('click', (params) => {
      emit('click', params)
    })
  }
}

// 更新图表
const updateChart = () => {
  if (chart) {
    // 获取当前图表选项以保留其他配置
    const currentOption: any = chart.getOption() || {}
    
    const option = {
      ...currentOption,
      series: [
        {
          ...(currentOption.series && currentOption.series[0]),
          type: 'pie',
          data: [
            { value: props.data.online, name: '在线', itemStyle: { color: '#67C23A' } },
            { value: props.data.offline, name: '离线', itemStyle: { color: '#909399' } },
            { value: props.data.fault, name: '故障', itemStyle: { color: '#F56C6C' } },
            { value: props.data.maintenance, name: '维护', itemStyle: { color: '#E6A23C' } }
          ]
        }
      ]
    }
    chart.setOption(option, true)
  }
}

// 监听数据变化
watch(() => props.data, () => {
  nextTick(() => {
    if (chart) {
      updateChart()
    } else {
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
.device-pie-chart {
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
