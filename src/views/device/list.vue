<template>
  <div class="device-list-view">
    <el-card shadow="hover">
      <template #header>
        <div class="header">
          <h3>设备管理</h3>
          <div class="controls">
            <el-button type="primary" @click="refreshList">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索和筛选 -->
      <div class="search-bar">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索设备名称/VID" 
              clearable
              @keyup.enter="searchDevices"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="searchDevices">
              <el-option label="在线" value="online" />
              <el-option label="离线" value="offline" />
              <el-option label="故障" value="fault" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="searchDevices">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-col>
        </el-row>
      </div>
      
      <!-- 设备列表 -->
      <el-table 
        :data="deviceList" 
        v-loading="loading"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column prop="deviceName" label="设备名称" min-width="150">
          <template #default="{ row }">
            <div class="device-name">
              <el-icon :class="getStatusIcon(row.status)" :style="{ color: getStatusColor(row.status) }" />
              <span>{{ row.deviceName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="vid" label="设备VID" min-width="120" />
        <el-table-column prop="location" label="位置" min-width="120" />
        <el-table-column prop="deviceType" label="设备类型" min-width="100" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后在线" min-width="150">
          <template #default="{ row }">
            {{ 
              row.lastOnlineTime ? formatDate(row.lastOnlineTime) : 
              (row.lastOnline_time ? formatDate(row.lastOnline_time) : 
              (row.last_heartbeat ? formatDate(row.last_heartbeat) : '-')) 
            }}
          </template>
        </el-table-column>
        <el-table-column label="温度(℃)" min-width="100">
          <template #default="{ row }">
            <span v-if="row.currentData?.tin !== undefined">{{ row.currentData?.tin }}℃</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="光照(lux)" min-width="100">
          <template #default="{ row }">
            <span v-if="row.currentData?.lxin !== undefined">{{ row.currentData?.lxin }} lux</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click.stop="viewDetail(row)">详情</el-button>
            <el-button size="small" type="primary" @click.stop="viewRealTime(row)">实时监控</el-button>
            <el-dropdown trigger="click">
              <el-button size="small" type="info">
                更多 <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="controlDevice(row)">控制</el-dropdown-item>
                  <el-dropdown-item @click="viewHistory(row)">历史数据</el-dropdown-item>
                  <el-dropdown-item @click="exportData(row)">导出数据</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, Search, ArrowDown } from '@element-plus/icons-vue'
import { getDeviceList, getDeviceStatusStats } from '@/api/device'
import { exportSingleToCSV } from '@/utils/export'
import type { DeviceInfo } from '@/types/api'
import { formatDate } from '@/utils/date'

const router = useRouter()

// 响应式数据
const deviceList = ref<DeviceInfo[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')
const statusFilter = ref('')

// 获取设备列表
const fetchDeviceList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchQuery.value,
      status: statusFilter.value
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
      // 数据标准化：确保使用前端期望的字段名
      const normalizedList = resultData.list.map((device: any) => ({
        ...device,
        // 时间字段标准化
        lastOnlineTime: device.lastOnlineTime || device.lastOnline_time || device.last_heartbeat || device.lastHeartbeat || null,
        createTime: device.createTime || device.create_time || device.create_time || null,
        // 其他字段标准化
        deviceName: device.deviceName || device.device_name || device.name || device.deviceName,
        deviceType: device.deviceType || device.device_type || device.type || device.category,
        location: device.location || device.loc || device.place || device.installLocation || '-',
        status: device.status || device.state || device.devStatus
      }))
      
      deviceList.value = normalizedList
      total.value = resultData.total || resultData.list.length
    } else {
      console.warn('设备列表数据格式不正确:', response)
      deviceList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取设备列表失败:', error)
    ElMessage.error('获取设备列表失败')
  } finally {
    loading.value = false
  }
}

// 刷新列表
const refreshList = () => {
  fetchDeviceList()
}

// 搜索设备
const searchDevices = () => {
  currentPage.value = 1
  fetchDeviceList()
}

// 重置筛选条件
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  fetchDeviceList()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchDeviceList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchDeviceList()
}

// 状态相关函数
const getStatusIcon = (status: string | number) => {
  // 将状态转换为字符串进行比较
  const statusStr = String(status).toLowerCase();
  switch (statusStr) {
    case 'online':
    case '1':
      return 'el-icon-CircleCheck'
    case 'offline':
    case '0':
      return 'el-icon-CircleClose'
    case 'fault':
    case '2':
      return 'el-icon-Warning'
    default:
      return 'el-icon-Question'
  }
}

const getStatusColor = (status: string | number) => {
  const statusStr = String(status).toLowerCase();
  switch (statusStr) {
    case 'online':
    case '1':
      return '#67C23A'
    case 'offline':
    case '0':
      return '#909399'
    case 'fault':
    case '2':
      return '#F56C6C'
    default:
      return '#909399'
  }
}

const getStatusTagType = (status: string | number) => {
  const statusStr = String(status).toLowerCase();
  switch (statusStr) {
    case 'online':
    case '1':
      return 'success'
    case 'offline':
    case '0':
      return 'info'
    case 'fault':
    case '2':
      return 'danger'
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
    default:
      return '未知'
  }
}

// 行点击事件
const handleRowClick = (row: DeviceInfo) => {
  viewDetail(row)
}

// 查看详情
const viewDetail = (device: DeviceInfo) => {
  router.push(`/device/detail/${device.vid}`)
}

// 查看实时监控
const viewRealTime = (device: DeviceInfo) => {
  // 可以跳转到特定设备的监控页面或在当前页面显示实时数据
  router.push(`/monitor?device=${device.vid}`)
}

// 控制设备
const controlDevice = (device: DeviceInfo) => {
  router.push(`/control?device=${device.vid}`)
}

// 查看历史数据
const viewHistory = (device: DeviceInfo) => {
  router.push(`/data/history?device=${device.vid}`)
}

// 导出数据
const exportData = (device: DeviceInfo) => {
  const headers = ['设备VID', '设备名称', '设备类型', '位置', '状态', '最后在线时间', '创建时间', '备注']
  const headerMapping = {
    vid: '设备VID',
    deviceName: '设备名称', 
    deviceType: '设备类型',
    location: '位置',
    status: '状态',
    lastOnlineTime: '最后在线时间',
    createTime: '创建时间',
    remarks: '备注'
  }
  const filename = `设备数据_${device.vid}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`
  
  exportSingleToCSV(device, headers, headerMapping, filename)
  ElMessage.success(`设备 ${device.deviceName || device.vid} 数据导出成功`)
}

// 初始化
onMounted(() => {
  fetchDeviceList()
})
</script>

<style scoped>
.device-list-view {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.controls .el-button {
  margin-left: 10px;
}

.search-bar {
  margin-bottom: 20px;
}

.device-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-name .el-icon {
  font-size: 16px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
