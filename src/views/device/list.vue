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
          <el-button type="success" @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            新增设备
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
              <el-option label="在线" value="1" />
              <el-option label="离线" value="0" />
              <el-option label="故障" value="2" />
              <el-option label="维护" value="3" />
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
        <el-table-column prop="deviceType" label="设备类型" min-width="100">
          <template #default="{ row }">
            {{ deviceTypeMap[row.deviceType] || row.deviceType }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="deviceStatusMap[row.status]?.type || 'info'" size="small">
              {{ deviceStatusMap[row.status]?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后在线" min-width="150">
          <template #default="{ row }">
            {{ row.lastOnlineTime ? formatDate(row.lastOnlineTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="manufacturer" label="制造商" min-width="120" />
        <el-table-column prop="model" label="型号" min-width="100" />
        <el-table-column prop="firmwareVersion" label="固件版本" min-width="100" />
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

    <!-- 新增设备对话框 -->
    <el-dialog 
      v-model="addDialogVisible" 
      title="新增设备" 
      width="500px"
      :before-close="handleCloseDialog"
    >
      <el-form 
        ref="addFormRef" 
        :model="addForm" 
        :rules="addFormRules" 
        label-width="100px"
      >
        <el-form-item label="设备名称" prop="deviceName">
          <el-input 
            v-model="addForm.deviceName" 
            placeholder="请输入设备名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="设备VID" prop="vid">
          <el-input 
            v-model="addForm.vid" 
            placeholder="请输入设备唯一标识VID"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="设备类型" prop="deviceType">
          <el-select v-model="addForm.deviceType" placeholder="请选择设备类型" style="width: 100%">
            <el-option label="冷库设备" value="cold_storage" />
            <el-option label="温控设备" value="temperature_control" />
            <el-option label="湿度设备" value="humidity_control" />
            <el-option label="监控设备" value="monitor" />
            <el-option label="其他设备" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="安装位置" prop="location">
          <el-input 
            v-model="addForm.location" 
            placeholder="请输入设备安装位置"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="设备状态" prop="status">
          <el-radio-group v-model="addForm.status">
            <el-radio label="online">在线</el-radio>
            <el-radio label="offline">离线</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="描述信息" prop="description">
          <el-input 
            v-model="addForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入设备描述信息（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseDialog">取消</el-button>
          <el-button type="primary" @click="handleAddDevice" :loading="addLoading">
            确认新增
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, Search, ArrowDown, Plus } from '@element-plus/icons-vue'
import { getDeviceList, getDeviceStatusStats, addDevice } from '@/api/device'
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

// 新增设备相关数据
const addDialogVisible = ref(false)
const addLoading = ref(false)
const addFormRef = ref()
const addForm = reactive({
  deviceName: '',
  vid: '',
  deviceType: '',
  location: '',
  status: 'online',
  description: ''
})

// 表单验证规则
const addFormRules = {
  deviceName: [
    { required: true, message: '请输入设备名称', trigger: 'blur' },
    { min: 2, max: 50, message: '设备名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  vid: [
    { required: true, message: '请输入设备VID', trigger: 'blur' },
    { min: 3, max: 20, message: '设备VID长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  deviceType: [
    { required: true, message: '请选择设备类型', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入安装位置', trigger: 'blur' },
    { min: 2, max: 100, message: '安装位置长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择设备状态', trigger: 'change' }
  ]
}

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

// 设备状态映射
const deviceStatusMap: Record<number, { label: string, type: string }> = {
  0: { label: '离线', type: 'info' },
  1: { label: '在线', type: 'success' },
  2: { label: '故障', type: 'danger' },
  3: { label: '维护', type: 'warning' }
}

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
      // 数据标准化：适配数据库字段名
      const normalizedList = resultData.list.map((device: any) => ({
        ...device,
        // 使用数据库字段名
        vid: device.vid,
        deviceName: device.device_name || device.deviceName,
        deviceType: device.device_type || device.deviceType,
        status: device.status,
        location: device.location,
        description: device.description,
        manufacturer: device.manufacturer,
        model: device.model,
        firmwareVersion: device.firmware_version || device.firmwareVersion,
        ipAddress: device.ip_address || device.ipAddress,
        macAddress: device.mac_address || device.macAddress,
        lastOnlineTime: device.last_online_time || device.lastOnlineTime,
        createdAt: device.created_at || device.createTime
      }))
      
      console.log('原始数据:', resultData.list)
      console.log('标准化后数据:', normalizedList)
      
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
  const statusNum = typeof status === 'string' ? parseInt(status) : status
  switch (statusNum) {
    case 1:
      return 'el-icon-CircleCheck'
    case 0:
      return 'el-icon-CircleClose'
    case 2:
      return 'el-icon-Warning'
    case 3:
      return 'el-icon-Tools'
    default:
      return 'el-icon-Question'
  }
}

const getStatusColor = (status: string | number) => {
  const statusNum = typeof status === 'string' ? parseInt(status) : status
  switch (statusNum) {
    case 1:
      return '#67C23A'
    case 0:
      return '#909399'
    case 2:
      return '#F56C6C'
    case 3:
      return '#E6A23C'
    default:
      return '#909399'
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

// 新增设备相关函数
const showAddDialog = () => {
  addDialogVisible.value = true
  // 重置表单
  Object.assign(addForm, {
    deviceName: '',
    vid: '',
    deviceType: '',
    location: '',
    status: 'online',
    description: ''
  })
  // 清除验证状态
  if (addFormRef.value) {
    addFormRef.value.clearValidate()
  }
}

const handleCloseDialog = () => {
  addDialogVisible.value = false
}

const handleAddDevice = async () => {
  if (!addFormRef.value) return
  
  // 表单验证
  const valid = await addFormRef.value.validate().catch(() => false)
  if (!valid) {
    ElMessage.warning('请完善表单信息')
    return
  }
  
  addLoading.value = true
  try {
    // 调用新增设备API
    const result = await addDevice(addForm)
    
    if (result.success) {
      ElMessage.success('设备新增成功')
      addDialogVisible.value = false
      // 刷新设备列表
      fetchDeviceList()
    } else {
      ElMessage.error(`设备新增失败: ${result.message}`)
    }
  } catch (error: any) {
    console.error('新增设备失败:', error)
    ElMessage.error(`新增设备失败: ${error.message || '未知错误'}`)
  } finally {
    addLoading.value = false
  }
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
