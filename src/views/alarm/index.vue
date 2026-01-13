<template>
  <div class="alarm-view">
    <el-page-header :title="'返回首页'" @back="goBack">
      <template #content>
        <span class="page-title">报警管理</span>
      </template>
    </el-page-header>

    <el-card shadow="hover" class="alarm-card">
      <template #header>
        <div class="alarm-header">
          <div class="alarm-filters">
            <el-select v-model="filter.level" placeholder="报警级别" clearable @change="fetchAlarms">
              <el-option label="全部级别" value="" />
              <el-option label="紧急" value="critical" />
              <el-option label="重要" value="high" />
              <el-option label="一般" value="medium" />
              <el-option label="提示" value="low" />
            </el-select>
            
            <el-select v-model="filter.status" placeholder="处理状态" clearable @change="fetchAlarms">
              <el-option label="全部状态" value="" />
              <el-option label="待处理" value="pending" />
              <el-option label="已处理" value="resolved" />
              <el-option label="已忽略" value="ignored" />
            </el-select>
            
            <el-input 
              v-model="filter.keyword" 
              placeholder="搜索设备或报警内容" 
              clearable 
              @input="searchAlarms"
              style="width: 200px; margin-left: 10px;"
            />
          </div>
          
          <div class="alarm-actions">
            <el-button type="primary" @click="refreshAlarms">刷新</el-button>
            <el-button @click="clearAllAlarms">清除全部</el-button>
          </div>
        </div>
      </template>

      <el-table 
        :data="alarms" 
        stripe 
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="报警ID" width="100" />
        <el-table-column prop="deviceName" label="设备名称" width="150">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.deviceName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="alarmContent" label="报警内容" min-width="200" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" size="small">{{ getLevelText(row.level) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="发生时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="viewAlarmDetail(row)">详情</el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              type="success" 
              size="small" 
              @click="resolveAlarm(row)"
            >
              处理
            </el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              type="info" 
              size="small" 
              @click="ignoreAlarm(row)"
            >
              忽略
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 报警详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="报警详情" width="600px">
      <div v-if="selectedAlarm" class="alarm-detail">
        <p><strong>报警ID:</strong> {{ selectedAlarm.id }}</p>
        <p><strong>设备名称:</strong> {{ selectedAlarm.deviceName }}</p>
        <p><strong>报警内容:</strong> {{ selectedAlarm.alarmContent }}</p>
        <p><strong>报警级别:</strong> 
          <el-tag :type="getLevelType(selectedAlarm.level)" size="small">
            {{ getLevelText(selectedAlarm.level) }}
          </el-tag>
        </p>
        <p><strong>状态:</strong> 
          <el-tag :type="getStatusType(selectedAlarm.status)" size="small">
            {{ getStatusText(selectedAlarm.status) }}
          </el-tag>
        </p>
        <p><strong>发生时间:</strong> {{ selectedAlarm.timestamp }}</p>
        <p><strong>附加信息:</strong> {{ selectedAlarm.extraInfo || '-' }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button 
            v-if="selectedAlarm?.status === 'pending'" 
            type="success" 
            @click="resolveAlarm(selectedAlarm)"
          >
            处理报警
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAlarms, resolveAlarm as apiResolveAlarm, ignoreAlarm as apiIgnoreAlarm, clearAllAlarms as apiClearAllAlarms } from '@/api/alarm'

// 路由
const router = useRouter()

// 响应式数据
const alarms = ref<any[]>([])
const selectedRows = ref<any[]>([])
const detailDialogVisible = ref(false)
const selectedAlarm = ref<any>(null)

// 筛选条件
const filter = ref({
  level: '',
  status: '',
  keyword: ''
})

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 获取报警列表
const fetchAlarms = async () => {
  try {
    const params = {
      pageNum: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      level: filter.value.level || undefined,
      status: filter.value.status || undefined,
      keyword: filter.value.keyword || undefined
    }
    
    const response: any = await getAlarms(params)
    
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
      const normalizedList = resultData.list.map((alarm: any) => ({
        ...alarm,
        // 如果后端返回的是alarmLevel，则映射到level
        level: alarm.level || alarm.alarmLevel,
        // 如果后端返回的是alarmType，则映射到type
        type: alarm.type || alarm.alarmType,
        // 确保其他可能的字段映射正确
        deviceName: alarm.deviceName || alarm.device_name || alarm.name,
        alarmContent: alarm.alarmContent || alarm.content || alarm.message,
        timestamp: alarm.timestamp || alarm.time || alarm.createTime,
        status: alarm.status || alarm.state
      }))
      
      alarms.value = normalizedList
      pagination.value.total = resultData.total || resultData.list.length
    } else {
      console.warn('报警列表数据格式不正确:', response)
      alarms.value = []
      pagination.value.total = 0
    }
  } catch (error) {
    console.error('获取报警列表失败:', error)
    ElMessage.error('获取报警列表失败')
  }
}

// 搜索报警
const searchAlarms = () => {
  pagination.value.currentPage = 1
  fetchAlarms()
}

// 刷新报警列表
const refreshAlarms = () => {
  fetchAlarms()
}

// 处理报警
const resolveAlarm = async (alarm: any) => {
  try {
    const response = await apiResolveAlarm(alarm.id)
    // 检查响应是否成功
    if (response) {
      ElMessage.success('报警处理成功')
      fetchAlarms() // 刷新列表
    } else {
      throw new Error('处理报警失败')
    }
  } catch (error) {
    console.error('处理报警失败:', error)
    ElMessage.error('处理报警失败')
  }
}

// 忽略报警
const ignoreAlarm = async (alarm: any) => {
  try {
    const response = await apiIgnoreAlarm(alarm.id)
    // 检查响应是否成功
    if (response) {
      ElMessage.success('报警已忽略')
      fetchAlarms() // 刷新列表
    } else {
      throw new Error('忽略报警失败')
    }
  } catch (error) {
    console.error('忽略报警失败:', error)
    ElMessage.error('忽略报警失败')
  }
}

// 清除全部报警
const clearAllAlarms = async () => {
  try {
    await ElMessageBox.confirm('确定要清除所有报警吗？此操作不可撤销', '确认清除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await apiClearAllAlarms()
    // 检查响应是否成功
    if (response) {
      ElMessage.success('全部报警清除成功')
      fetchAlarms() // 刷新列表
    } else {
      throw new Error('清除报警失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清除报警失败:', error)
      ElMessage.error('清除报警失败')
    }
  }
}

// 查看报警详情
const viewAlarmDetail = (alarm: any) => {
  selectedAlarm.value = alarm
  detailDialogVisible.value = true
}

// 表格选择事件
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  fetchAlarms()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  fetchAlarms()
}

// 返回首页
const goBack = () => {
  router.push('/dashboard')
}

// 获取级别类型
const getLevelType = (level: string) => {
  switch (level) {
    case 'critical': return 'danger'
    case 'high': return 'warning'
    case 'medium': return 'orange'
    case 'low': return 'info'
    default: return 'info'
  }
}

// 获取级别文本
const getLevelText = (level: string) => {
  switch (level) {
    case 'critical': return '紧急'
    case 'high': return '重要'
    case 'medium': return '一般'
    case 'low': return '提示'
    default: return level
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'resolved': return 'success'
    case 'ignored': return 'info'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return '待处理'
    case 'resolved': return '已处理'
    case 'ignored': return '已忽略'
    default: return status
  }
}

// 初始化
onMounted(() => {
  fetchAlarms()
})
</script>

<style scoped>
.alarm-view {
  padding: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
}

.alarm-card {
  margin-top: 20px;
}

.alarm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alarm-filters {
  display: flex;
  gap: 10px;
}

.alarm-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.alarm-detail p {
  margin: 8px 0;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>