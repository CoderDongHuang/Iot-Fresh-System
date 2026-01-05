<template>
  <div class="device-status-table">
    <el-table
      :data="tableData"
      :stripe="true"
      :border="true"
      :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      style="width: 100%"
      @row-click="handleRowClick"
    >
      <el-table-column prop="vid" label="设备ID" width="180" />
      <el-table-column prop="deviceName" label="设备名称" width="150" />
      <el-table-column prop="deviceType" label="设备类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getDeviceTypeTagType(row.deviceType)">
            {{ getDeviceTypeName(row.deviceType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="位置" width="150" />
      <el-table-column prop="contactPhone" label="联系电话" width="130" />
      <el-table-column prop="lastHeartbeat" label="最后心跳" width="180">
        <template #default="{ row }">
          {{ formatTime(row.lastHeartbeat) }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click.stop="handleViewDetail(row)">
            查看
          </el-button>
          <el-button type="success" size="small" @click.stop="handleControl(row)">
            控制
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElTable, ElTableColumn, ElTag, ElButton } from 'element-plus'
import type { DeviceInfo } from '@/types/api'
import dayjs from 'dayjs'

// 定义组件接收的属性
interface Props {
  data?: DeviceInfo[]
}

const props = withDefaults(defineProps<Props>(), {
  data: () => []
})

// 定义组件发出的事件
interface Emits {
  (e: 'device-click', device: DeviceInfo): void
  (e: 'view-detail', device: DeviceInfo): void
  (e: 'control-device', device: DeviceInfo): void
}

const emit = defineEmits<Emits>()

// 表格数据
const tableData = ref<DeviceInfo[]>([])

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    tableData.value = newData || []
  },
  { immediate: true }
)

// 处理行点击事件
const handleRowClick = (row: DeviceInfo) => {
  emit('device-click', row)
}

// 处理查看详细信息
const handleViewDetail = (row: DeviceInfo) => {
  emit('view-detail', row)
}

// 处理设备控制
const handleControl = (row: DeviceInfo) => {
  emit('control-device', row)
}

// 获取设备类型标签类型
const getDeviceTypeTagType = (type: string | undefined) => {
  if (!type) return 'info'
  const typeMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    'temperature': 'warning',
    'humidity': 'primary',
    'light': 'success',
    'control': 'danger',
    'monitor': 'info'
  }
  return typeMap[type.toLowerCase()] || 'info'
}

// 获取设备类型名称
const getDeviceTypeName = (type: string | undefined) => {
  if (!type) return '未知'
  const typeMap: Record<string, string> = {
    'temperature': '温控设备',
    'humidity': '湿度设备',
    'light': '光照设备',
    'control': '控制设备',
    'monitor': '监控设备'
  }
  return typeMap[type.toLowerCase()] || type
}

// 获取状态标签类型
const getStatusTagType = (status: number | undefined) => {
  if (status === undefined) return 'info'
  // 假设 1 为在线，0 为离线，2 为故障
  const statusMap: Record<number, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    0: 'info', // 离线
    1: 'success', // 在线
    2: 'danger' // 故障
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: number | undefined) => {
  if (status === undefined) return '未知'
  const statusMap: Record<number, string> = {
    0: '离线',
    1: '在线',
    2: '故障'
  }
  return statusMap[status] || '未知'
}

// 格式化时间
const formatTime = (time: string | undefined) => {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped>
.device-status-table {
  width: 100%;
}
</style>
