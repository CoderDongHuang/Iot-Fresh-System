<template>
  <div class="data-history-view">
    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="选择设备">
          <el-select v-model="searchForm.vid" placeholder="请选择设备" clearable style="width: 300px;">
            <el-option
              v-for="device in availableDevices"
              :key="device.vid"
              :label="`${device.deviceName} (${device.vid})`"
              :value="device.vid"
            >
              <div class="device-option">
                <span>{{ device.deviceName }}</span>
                <el-tag 
                  :type="getStatusTagType(device.status)" 
                  size="small"
                  style="margin-left: 10px;"
                >
                  {{ getStatusText(device.status) }}
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="数据类型">
          <el-select v-model="searchForm.dataType" placeholder="请选择数据类型" clearable>
            <el-option label="温度数据" value="temperature" />
            <el-option label="湿度数据" value="humidity" />
            <el-option label="光照数据" value="light" />
            <el-option label="其他数据" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="exportData" :loading="exportLoading">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="data-table-card">
      <template #header>
        <div class="card-header">
          <span>历史数据查询结果</span>
          <div class="table-controls">
            <el-button type="primary" size="small" @click="refreshData">刷新</el-button>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="historyData" 
        style="width: 100%" 
        stripe 
        v-loading="loading"
        :default-sort="{ prop: 'timestamp', order: 'descending' }"
      >
        <el-table-column prop="vid" label="设备VID" width="150" sortable />
        <el-table-column label="内部温度(℃)" width="130" sortable prop="tin">
          <template #default="{ row }">
            <span :class="getTempClass(row.tin)">
              {{ row.tin !== undefined ? row.tin.toFixed(1) : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="外部温度(℃)" width="130" sortable prop="tout">
          <template #default="{ row }">
            <span :class="getTempClass(row.tout)">
              {{ row.tout !== undefined ? row.tout.toFixed(1) : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="光照强度" width="120" sortable prop="lxin">
          <template #default="{ row }">
            <span>{{ row.lxin !== undefined ? row.lxin.toFixed(1) : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="亮度调节" width="120" sortable prop="brightness">
          <template #default="{ row }">
            <span>{{ row.brightness !== undefined ? row.brightness : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="设备状态" width="120" sortable prop="vStatus">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.vStatus)">
              {{ getStatusText(row.vStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="时间" width="180" sortable />
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDeviceHistoryData, getDeviceList } from '@/api/device'
import { exportToCSV } from '@/utils/export'
import type { DeviceData, DeviceInfo, PageResult } from '@/types/api'

// 设备类型映射
const deviceTypeMap: Record<string, string> = {
  'storage': '存储设备',
  'transport': '运输设备',
  'display': '展示设备',
  'processing': '加工设备',
  'quality': '质检设备',
  'monitoring': '监控设备',
  'warehouse': '仓储设备'
}

// 搜索表单
const searchForm = reactive({
  vid: '',
  dateRange: [] as string[] | null,
  dataType: ''
})

// 分页数据
const historyData = ref<DeviceData[]>([])
const availableDevices = ref<DeviceInfo[]>([])
const loading = ref(false)
const exportLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 搜索处理
const handleSearch = async () => {
  currentPage.value = 1
  await fetchHistoryData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.vid = ''
  searchForm.dateRange = null
  searchForm.dataType = ''
  currentPage.value = 1
  fetchHistoryData()
}

// 刷新数据
const refreshData = () => {
  fetchHistoryData()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchHistoryData()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchHistoryData()
}

// 获取历史数据
const fetchHistoryData = async () => {
  loading.value = true
  try {
    // 验证设备VID
    if (!searchForm.vid || searchForm.vid.trim() === '') {
      ElMessage.error('请先输入设备VID')
      return
    }
    
    // 构建查询参数
    const params: any = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      vid: searchForm.vid,
      dataType: searchForm.dataType
    }
    
    // 添加时间范围参数
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startTime = searchForm.dateRange[0]
      params.endTime = searchForm.dateRange[1]
    }
    
    const response = await getDeviceHistoryData(params)
    historyData.value = response.list || []
    total.value = response.total || 0
    
    ElMessage.success('查询成功')
  } catch (error) {
    console.error('查询历史数据失败:', error)
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

// 获取温度文本样式
const getTempClass = (temp: number) => {
  if (temp === undefined || temp === null) return ''
  if (temp > 30) return 'temp-high'
  if (temp < 0) return 'temp-low'
  return 'temp-normal'
}

// 状态相关函数
const getStatusType = (status: string | number | undefined) => {
  if (status === undefined) return 'info'
  const statusNum = typeof status === 'string' ? parseInt(status) : status
  switch (statusNum) {
    case 1: return 'success'
    case 0: return 'info'
    case 2: return 'danger'
    case 3: return 'warning'
    default: return 'info'
  }
}

const getStatusText = (status: string | number | undefined) => {
  if (status === undefined) return '未知'
  const statusNum = typeof status === 'string' ? parseInt(status) : status
  switch (statusNum) {
    case 1: return '在线'
    case 0: return '离线'
    case 2: return '故障'
    case 3: return '维护'
    default: return '未知'
  }
}

// 导出数据
const exportData = async () => {
  if (historyData.value.length === 0) {
    ElMessage.warning('没有数据可导出')
    return
  }
  
  exportLoading.value = true
  try {
    const headers = [
      '设备VID', '内部温度(℃)', '外部温度(℃)', 
      '光照强度', '亮度调节', '设备状态', '时间'
    ]
    
    // 创建映射后的数据
    const mappedData = historyData.value.map(item => ({
      '设备VID': item.vid,
      '内部温度(℃)': item.tin !== undefined ? item.tin.toFixed(1) : '-',
      '外部温度(℃)': item.tout !== undefined ? item.tout.toFixed(1) : '-',
      '光照强度': item.lxin !== undefined ? item.lxin.toFixed(1) : '-',
      '亮度调节': item.brightness !== undefined ? item.brightness : '-',
      '设备状态': getStatusText(item.vStatus),
      '时间': item.timestamp
    }))
    
    const filename = `历史数据_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`
    exportToCSV(mappedData, headers, filename)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exportLoading.value = false
  }
}

// 获取设备列表
const fetchDeviceList = async () => {
  try {
    const response: any = await getDeviceList({ pageNum: 1, pageSize: 1000 })
    
    // 处理响应数据，兼容不同格式
    let resultData = null
    if (response && response.data) {
      resultData = response.data
    } else if (response && response.list) {
      resultData = response
    }
    
    if (resultData && resultData.list) {
      // 数据标准化：适配数据库字段名
      availableDevices.value = resultData.list.map((device: any) => ({
        ...device,
        vid: device.vid,
        deviceName: device.device_name || device.deviceName,
        deviceType: device.device_type || device.deviceType,
        status: device.status,
        location: device.location
      }))
    }
  } catch (error) {
    console.error('获取设备列表失败:', error)
    ElMessage.error('获取设备列表失败')
  }
}

// 设备选择器状态函数（与表格状态函数保持一致）
const getStatusTagType = (status: string | number | undefined) => {
  return getStatusType(status)
}

onMounted(() => {
  fetchDeviceList()
  fetchHistoryData()
})
</script>

<style scoped>
.data-history-view {
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

.data-table-card {
  background: var(--card-bg) !important;
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 8px !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-controls {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.temp-high {
  color: var(--color-accent-red);
  font-weight: bold;
}

.temp-low {
  color: var(--color-accent-blue);
  font-weight: bold;
}

.temp-normal {
  color: var(--text-color-primary);
}

.device-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.device-option span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
