<template>
  <div class="alarm-view">
    <el-page-header :title="'返回首页'" @back="goBack">
      <template #content>
        <div class="page-header-content">
          <span class="page-title">报警管理</span>
          <div v-if="newAlarmNotification" class="new-alarm-notification">
            <div class="badge-container">
              <el-badge :value="unreadAlarmCount" class="item">
                <el-button type="warning" size="small" @click="handleNewAlarmNotification">
                  <el-icon><Bell /></el-icon>
                  新报警通知
                </el-button>
              </el-badge>
            </div>
          </div>
        </div>
      </template>
    </el-page-header>

    <!-- 报警统计卡片 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c;">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">总报警数</div>
              <div class="stat-value">{{ statistics.total || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c;">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">待处理</div>
              <div class="stat-value">{{ statistics.active || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a;">
              <el-icon><SuccessFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">已处理</div>
              <div class="stat-value">{{ statistics.resolved || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="alarm-card">
      <template #header>
        <div class="alarm-header">
          <div class="alarm-filters">
            <el-select v-model="filter.level" placeholder="报警级别" clearable @change="fetchAlarms" style="width: 120px;">
              <el-option label="全部级别" value="" />
              <el-option label="紧急" value="high" />
              <el-option label="重要" value="medium" />
              <el-option label="一般" value="low" />
            </el-select>
            
            <el-select v-model="filter.status" placeholder="处理状态" clearable @change="fetchAlarms" style="width: 120px;">
              <el-option label="全部状态" value="" />
              <el-option label="待处理" value="active" />
              <el-option label="已处理" value="resolved" />
            </el-select>
            
            <el-date-picker
              v-model="filter.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="fetchAlarms"
              style="width: 240px;"
            />
            
            <el-input 
              v-model="filter.keyword" 
              placeholder="搜索设备或报警内容" 
              clearable 
              @input="searchAlarms"
              style="width: 200px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-button type="primary" @click="goToNotificationSettings" style="margin-left: 10px;">
              <el-icon><Bell /></el-icon>
              通知设置
            </el-button>
            
            <el-button @click="resetFilters" type="default" size="default">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          
          <el-tag :type="getWsStatusType()" size="small" style="margin-left: 10px;">
            WebSocket: {{ wsStatus }}
          </el-tag>
          
          <el-button @click="testWebSocket" type="info" size="small" style="margin-left: 10px;">
            <el-icon><Connection /></el-icon>
            测试连接
          </el-button>
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
            <div class="action-buttons">
              <el-tooltip content="查看详情" placement="top">
                <el-button size="small" @click="viewAlarmDetail(row)">
                  <el-icon><View /></el-icon>
                  详情
                </el-button>
              </el-tooltip>
              <template v-if="row.status === 'active'">
                <el-tooltip content="处理报警" placement="top">
                  <el-button type="success" size="small" @click="resolveAlarm(row)">
                    <el-icon><Check /></el-icon>
                    处理
                  </el-button>
                </el-tooltip>
                <el-tooltip content="关闭报警" placement="top">
                  <el-button type="info" size="small" @click="closeAlarm(row)">
                    <el-icon><Close /></el-icon>
                    关闭
                  </el-button>
                </el-tooltip>
              </template>
            </div>
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
    <el-dialog v-model="detailDialogVisible" title="报警详情" width="800px">
      <div v-if="selectedAlarm" class="alarm-detail-container">
        <div class="tabs-container">
          <el-tabs v-model="activeTab" type="card">
            <!-- 基本信息标签页 -->
            <el-tab-pane label="基本信息" name="basic">
              <div class="alarm-detail">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="报警ID">{{ selectedAlarm.id }}</el-descriptions-item>
                  <el-descriptions-item label="设备名称">{{ selectedAlarm.deviceName }}</el-descriptions-item>
                  <el-descriptions-item label="报警级别">
                    <el-tag :type="getLevelType(selectedAlarm.level)" size="small">
                      {{ getLevelText(selectedAlarm.level) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="当前状态">
                    <el-tag :type="getStatusType(selectedAlarm.status)" size="small">
                      {{ getStatusText(selectedAlarm.status) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="发生时间" :span="2">{{ selectedAlarm.timestamp }}</el-descriptions-item>
                  <el-descriptions-item label="报警内容" :span="2">{{ selectedAlarm.alarmContent }}</el-descriptions-item>
                  <el-descriptions-item label="附加信息" :span="2">{{ selectedAlarm.extraInfo || '-' }}</el-descriptions-item>
                </el-descriptions>
              </div>
            </el-tab-pane>
            
            <!-- 处理记录标签页 -->
            <el-tab-pane label="处理记录" name="history">
              <div class="alarm-history">
                <div v-if="alarmHistory.length === 0" class="empty-history">
                  <el-empty description="暂无处理记录" />
                </div>
                <div v-else class="history-list">
                  <el-timeline>
                    <el-timeline-item 
                      v-for="record in alarmHistory" 
                      :key="record.id"
                      :timestamp="record.timestamp"
                      :type="getHistoryItemType(record.action)"
                    >
                      <div class="history-item">
                        <strong>{{ record.action }}</strong> - {{ record.operator }}
                        <div v-if="record.remark" class="history-remark">{{ record.remark }}</div>
                      </div>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </div>
            </el-tab-pane>
            
            <!-- 处理操作标签页 -->
            <el-tab-pane label="处理操作" name="action" v-if="selectedAlarm.status === 'active'">
              <div class="alarm-action">
                <el-form :model="actionForm" label-width="80px">
                  <el-form-item label="处理操作">
                    <el-radio-group v-model="actionForm.action">
                      <el-radio label="处理">处理报警</el-radio>
                      <el-radio label="关闭">关闭报警</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="处理备注">
                    <el-input 
                      v-model="actionForm.remark" 
                      type="textarea" 
                      :rows="3" 
                      placeholder="请输入处理备注信息"
                    />
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button 
            v-if="selectedAlarm?.status === 'active' && activeTab === 'action'" 
            type="primary" 
            @click="handleAlarmAction"
          >
            确认操作
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { Bell, Warning, Clock, SuccessFilled, Close, View, Check, Search, Refresh, Plus, Connection } from '@element-plus/icons-vue'
import { getAlarms, resolveAlarm as apiResolveAlarm, ignoreAlarm as apiIgnoreAlarm, closeAlarm as apiCloseAlarm, clearAllAlarms as apiClearAllAlarms, getAlarmStatistics, getAlarmHistory, addAlarmHistory } from '@/api/alarm'
import { useWebSocket } from '@/composables/useWebSocket'
import { sendEmail, getEmailSettings } from '@/api/email'

// 路由
const router = useRouter()

// WebSocket
const { connect, disconnect, onMessage, send, connected } = useWebSocket()

// WebSocket连接状态
const wsStatus = ref('disconnected')

// WebSocket连接日志
const logWebSocketStatus = (status: string) => {
  console.log(`WebSocket状态: ${status}`)
  wsStatus.value = status
}

// 响应式数据
const alarms = ref<any[]>([])
const selectedRows = ref<any[]>([])
const detailDialogVisible = ref(false)
const selectedAlarm = ref<any>(null)

// 筛选条件
const filter = ref({
  level: '',
  status: '',
  keyword: '',
  dateRange: []
})

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 新报警通知
const newAlarmNotification = ref(false)
const unreadAlarmCount = ref(0)

// 报警详情相关
const activeTab = ref('basic')
const alarmHistory = ref<any[]>([])
const actionForm = ref({
  action: '处理',
  remark: ''
})

// 统计信息
const statistics = ref({
  total: 0,
  active: 0,
  resolved: 0,
  levelStats: {
    high: 0,
    medium: 0,
    low: 0
  }
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
    
    console.log('开始获取报警列表，参数:', params)
    const response: any = await getAlarms(params)
    console.log('API响应原始数据:', response)
    
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
          status: (alarm.status || alarm.state) === '待处理' ? 'active' : 
                   (alarm.status || alarm.state) === '已处理' ? 'resolved' : 
                   (alarm.status || alarm.state)
        }))
        
        console.log('标准化后的报警数据:', normalizedList)
        console.log('状态字段值统计:', {
          active: normalizedList.filter((a: any) => a.status === 'active').length,
          resolved: normalizedList.filter((a: any) => a.status === 'resolved').length,
          allStatuses: [...new Set(normalizedList.map((a: any) => a.status))]
        })
        
        alarms.value = normalizedList
        pagination.value.total = resultData.total || resultData.list.length
        
        // 更新统计信息 - 使用当前页面数据统计
        updatePageStatistics(normalizedList)
      } else {
      console.warn('报警列表数据格式不正确:', response)
      alarms.value = []
      pagination.value.total = 0
      
      // 更新统计信息
      updatePageStatistics([])
    }
  } catch (error) {
    console.error('获取报警列表失败:', error)
    ElMessage.error('获取报警列表失败')
    
    // 更新统计信息
    updatePageStatistics([])
  }
}

// 搜索报警
const searchAlarms = () => {
  pagination.value.currentPage = 1
  fetchAlarms()
}

// 重置筛选条件
const resetFilters = () => {
  filter.value = {
    level: '',
    status: '',
    keyword: '',
    dateRange: []
  }
  pagination.value.currentPage = 1
  fetchAlarms()
}

// 跳转到通知设置页面
const goToNotificationSettings = () => {
  router.push('/settings/notification')
}

// 测试WebSocket连接
const testWebSocket = () => {
  if (!connected.value) {
    ElMessage.warning('WebSocket未连接，请先连接')
    initWebSocket()
    return
  }
  
  // 发送测试消息
  send('test', { 
    message: '前端WebSocket连接测试',
    timestamp: new Date().toISOString()
  })
  
  ElMessage.success('WebSocket测试消息已发送')
  
  // 模拟接收报警消息（用于测试）
  setTimeout(() => {
    const testAlarm = {
      id: Date.now(),
      deviceName: '测试设备',
      level: 'high',
      alarmContent: '这是测试报警消息，用于验证WebSocket连接',
      timestamp: new Date().toISOString(),
      status: 'active'
    }
    
    // 手动触发报警处理（模拟后端推送）
    handlePriorityAlarm(testAlarm)
    
    ElMessage.info('测试报警已触发，请检查弹窗和声音')
  }, 1000)
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
      // 添加处理记录到历史
      await addAlarmHistory(alarm.id, {
        action: '处理报警',
        operator: '当前用户',
        remark: '通过表格行按钮处理报警，报警已处理'
      })
      
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

// 关闭报警
const closeAlarm = async (alarm: any) => {
  try {
    await ElMessageBox.confirm('确定要关闭此报警吗？关闭后将无法重新激活', '确认关闭', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await apiCloseAlarm(alarm.id)
    // 检查响应是否成功
    if (response) {
      // 添加关闭记录到历史
      await addAlarmHistory(alarm.id, {
        action: '关闭报警',
        operator: '当前用户',
        remark: '通过表格行按钮关闭报警，报警已解除'
      })
      
      ElMessage.success('报警已关闭')
      fetchAlarms() // 刷新列表
    } else {
      throw new Error('关闭报警失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('关闭报警失败:', error)
      ElMessage.error('关闭报警失败')
    }
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
  activeTab.value = 'basic'
  
  // 重置表单
  actionForm.value = {
    action: '处理',
    remark: ''
  }
  
  // 重置处理记录
  alarmHistory.value = []
  
  // 加载处理记录
  loadAlarmHistory(alarm.id)
}

// 加载报警处理记录
const loadAlarmHistory = async (alarmId: number) => {
  try {
    console.log('开始加载报警处理记录，报警ID:', alarmId)
    
    // 调用后端API获取真实处理记录
    const response = await getAlarmHistory(alarmId)
    console.log('后端API响应:', response)
    
    // 检查响应格式 - 适配后端返回的数据结构
    let resultData = null
    const responseData = response as any
    if (responseData && responseData.history) {
      // 后端返回格式: {history: Array}
      resultData = responseData.history
    } else if (responseData && responseData.data) {
      // 标准格式: {data: Array}
      resultData = responseData.data
    } else if (responseData && Array.isArray(responseData)) {
      // 直接返回数组格式
      resultData = responseData
    }
    
    console.log('处理后的数据:', resultData)
    
    if (resultData && Array.isArray(resultData)) {
      // 标准化处理记录数据 - 适配后端字段名
      const normalizedHistory = resultData.map((record: any) => {
        // 标准化action字段
        let actionText = record.action
        if (actionText === 'create') actionText = '创建报警'
        else if (actionText === 'acknowledge') actionText = '确认报警'
        else if (actionText === 'resolve') actionText = '处理报警'
        
        return {
          id: record.id || record.recordId || Date.now(),
          action: actionText || record.operation || '未知操作',
          operator: record.operator || record.userName || record.username || '系统',
          timestamp: formatTimestamp(record.timestamp || record.createTime || record.time || record.create_time || new Date().toISOString()),
          remark: record.remark || record.comment || record.note || '无备注'
        }
      })
      
      alarmHistory.value = normalizedHistory
      console.log('标准化后的处理记录:', normalizedHistory)
    } else {
      // 后端没有返回数据，保持空数组
      alarmHistory.value = []
      console.log('后端没有返回处理记录数据')
    }
  } catch (error: any) {
    console.error('加载报警处理记录失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    
    // 出错时保持空数组
    alarmHistory.value = []
    console.log('加载处理记录出错，保持空数组')
  }
  
  console.log('最终的处理记录数据:', alarmHistory.value)
}

// 获取历史记录项类型
const getHistoryItemType = (action: string) => {
  switch (action) {
    case '创建报警': return 'primary'
    case '处理': return 'success'
    case '关闭': return 'info'
    default: return 'primary'
  }
}

// 处理报警操作
const handleAlarmAction = async () => {
  if (!actionForm.value.action) {
    ElMessage.warning('请选择处理操作')
    return
  }
  
  try {
    let success = false
    
    if (actionForm.value.action === '处理') {
      await resolveAlarm(selectedAlarm.value)
      success = true
    } else if (actionForm.value.action === '关闭') {
      await closeAlarm(selectedAlarm.value)
      success = true
    }
    
    if (success) {
      // 向后端添加处理记录
      try {
        await addAlarmHistory(selectedAlarm.value.id, {
          action: actionForm.value.action,
          operator: '当前用户', // 实际应该从用户信息获取
          remark: actionForm.value.remark || '无备注'
        })
      } catch (historyError) {
        console.warn('添加处理记录失败，但报警操作已成功:', historyError)
      }
      
      // 刷新处理记录
      await loadAlarmHistory(selectedAlarm.value.id)
      
      ElMessage.success(`${actionForm.value.action}操作成功`)
      detailDialogVisible.value = false
      fetchAlarms() // 刷新列表
    }
  } catch (error) {
    console.error('处理报警操作失败:', error)
    ElMessage.error('操作失败')
  }
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
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'info'
    default: return 'info'
  }
}

// 获取级别文本
const getLevelText = (level: string) => {
  switch (level) {
    case 'high': return '紧急'
    case 'medium': return '重要'
    case 'low': return '一般'
    default: return level
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'active': return 'danger'    // � 红色标签 - 待处理
    case 'resolved': return 'success' // ✅ 绿色标签 - 已处理
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '待处理'
    case 'resolved': return '已处理'
    default: return status
  }
}

// 更新页面统计信息
const updatePageStatistics = (alarmList: any[]) => {
  console.log('updatePageStatistics被调用，参数alarmList:', alarmList)
  console.log('alarmList长度:', alarmList?.length || 0)
  
  if (!alarmList || alarmList.length === 0) {
    console.log('报警列表为空，重置统计信息')
    statistics.value = {
      total: 0,
      active: 0,
      resolved: 0,
      levelStats: { high: 0, medium: 0, low: 0 }
    }
    return
  }
  
  const stats = {
    total: alarmList.length,
    active: alarmList.filter((a: any) => a.status === 'active').length,
    resolved: alarmList.filter((a: any) => a.status === 'resolved').length,
    levelStats: {
      high: alarmList.filter((a: any) => a.level === 'high').length,
      medium: alarmList.filter((a: any) => a.level === 'medium').length,
      low: alarmList.filter((a: any) => a.level === 'low').length
    }
  }
  
  console.log('页面统计信息:', stats)
  console.log('所有状态值:', [...new Set(alarmList.map((a: any) => a.status))])
  console.log('所有级别值:', [...new Set(alarmList.map((a: any) => a.level))])
  
  statistics.value = stats
}

// WebSocket状态类型
const getWsStatusType = () => {
  switch (wsStatus.value) {
    case 'connected': return 'success'
    case 'connecting': return 'warning'
    case 'disconnected': return 'info'
    case 'failed': return 'danger'
    case 'error': return 'danger'
    default: return 'info'
  }
}

// 格式化时间戳
const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return '未知时间'
  
  try {
    // 处理ISO格式（包含T的时间）
    if (timestamp.includes('T')) {
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-')
    }
    
    // 处理其他格式的时间
    return timestamp.replace('T', ' ')
  } catch (error) {
    console.warn('时间格式化失败:', timestamp, error)
    return timestamp.replace('T', ' ') // 简单替换T为空格
  }
}

// WebSocket消息处理
const handleWebSocketMessage = (data: any) => {
  console.log('收到WebSocket消息:', data)
  
  if (data.type === 'new_alarm') {
    console.log('处理新报警消息')
    handleNewAlarm(data.data)
  } else if (data.type === 'priority_alarm') {
    console.log('处理优先报警消息')
    handlePriorityAlarm(data.data)
  } else if (data.type === 'alarm_resolved') {
    console.log('报警被处理:', data.data)
    
    // 如果当前页面是报警页面，自动刷新列表
    if (router.currentRoute.value.name === 'Alarm') {
      fetchAlarms()
    }
  } else {
    console.log('收到未知类型的消息:', data.type)
  }
}

// 处理普通报警
const handleNewAlarm = (newAlarm: any) => {
  console.log('收到新报警:', newAlarm)
  
  // 显示通知
  ElMessage.warning(`新报警: ${newAlarm.deviceName} - ${newAlarm.message}`)
  
  // 更新未读计数
  unreadAlarmCount.value++
  newAlarmNotification.value = true
  
  // 如果当前页面是报警页面，自动刷新列表
  if (router.currentRoute.value.name === 'Alarm') {
    fetchAlarms()
  }
}

// 处理优先报警
const handlePriorityAlarm = (priorityAlarm: any) => {
  console.log('收到优先报警:', priorityAlarm)
  
  // 播放声音提醒
  playAlertSound()
  
  // 显示优先弹窗
  showPriorityPopup(priorityAlarm)
  
  // 更新未读计数（优先报警计数加倍）
  unreadAlarmCount.value += 2
  newAlarmNotification.value = true
  
  // 立即刷新报警列表
  fetchAlarms()
}

// 发送邮件通知
const sendEmailNotification = async (alarmInfo: any) => {
  try {
    // 获取邮件设置
    const settingsResponse = await getEmailSettings()
    const emailSettings = settingsResponse.data
    
    if (!emailSettings || !emailSettings.enabled) {
      console.log('邮件通知未启用')
      return
    }
    
    // 检查报警级别是否需要发送邮件
    if (!emailSettings.notifyLevels.includes(alarmInfo.level)) {
      console.log('报警级别不在邮件通知范围内')
      return
    }
    
    // 检查免打扰时段
    const currentTime = new Date()
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
    
    if (emailSettings.quietHours && 
        currentTimeStr >= emailSettings.quietHours[0] && 
        currentTimeStr <= emailSettings.quietHours[1]) {
      console.log('当前处于免打扰时段，不发送邮件')
      return
    }
    
    // 准备邮件模板变量
    const variables = {
      device: alarmInfo.deviceName || '未知设备',
      level: getLevelText(alarmInfo.level),
      content: alarmInfo.alarmContent || alarmInfo.message || '无详细内容',
      time: formatTimestamp(alarmInfo.timestamp || new Date().toISOString())
    }
    
    // 根据报警级别选择邮件主题和内容
    let subject = ''
    let content = ''
    
    switch (alarmInfo.level) {
      case 'high':
        subject = '【IoT系统】紧急报警通知'
        content = `设备：${variables.device}\n级别：${variables.level}\n内容：${variables.content}\n时间：${variables.time}`
        break
      case 'medium':
        subject = '【IoT系统】重要报警通知'
        content = `设备：${variables.device}\n内容：${variables.content}\n时间：${variables.time}`
        break
      case 'low':
        subject = '【IoT系统】一般报警通知'
        content = `设备：${variables.device}\n内容：${variables.content}\n时间：${variables.time}`
        break
      default:
        subject = '【IoT系统】设备报警通知'
        content = `设备：${variables.device}\n内容：${variables.content}\n时间：${variables.time}`
    }
    
    // 发送邮件
    await sendEmail({
      emailAddresses: emailSettings.emailAddresses,
      subject: subject,
      content: content,
      level: alarmInfo.level
    })
    
    console.log('邮件通知发送成功')
  } catch (error) {
    console.error('邮件通知发送失败:', error)
  }
}

// 播放提醒声音
const playAlertSound = () => {
  try {
    // 创建音频上下文
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) {
      console.warn('浏览器不支持Web Audio API')
      return
    }
    
    const audioCtx = new AudioContext()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    
    // 设置清脆的警报声音（响两次）
    oscillator.type = 'triangle' // 使用三角波，声音更清脆
    
    // 第一次响声：高音清脆
    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime) // 高音
    oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.1) // 更高音
    gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2)
    
    // 第二次响声：间隔后再次响起
    oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.3) // 高音
    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.4) // 稍低音
    gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime + 0.3)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)
    
    oscillator.start(audioCtx.currentTime)
    oscillator.stop(audioCtx.currentTime + 0.5)
    
    console.log('播放优先报警声音')
  } catch (error) {
    console.warn('声音播放失败:', error)
  }
}

// 震动设备（移动端支持）
const vibrateDevice = () => {
  if ('vibrate' in navigator) {
    try {
      // 震动模式：短-长-短
      navigator.vibrate([100, 200, 100, 200, 100])
      console.log('设备震动提醒')
    } catch (error) {
      console.warn('震动功能不可用:', error)
    }
  }
}

// 显示新报警弹窗
const showNewAlarmPopup = (alarmInfo: any) => {
  const alarmLevel = alarmInfo.level || 'medium'
  const levelText = getLevelText(alarmLevel)
  const levelType = getLevelType(alarmLevel)
  
  ElMessageBox.alert(
    `<div style="text-align: left; padding: 10px 0;">
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <el-icon style="color: #e6a23c; font-size: 20px; margin-right: 8px;"><Warning /></el-icon>
        <span style="font-size: 16px; font-weight: bold;">🔔 新报警通知</span>
      </div>
      <div style="margin-bottom: 8px;"><strong>设备名称：</strong>${alarmInfo.deviceName || '未知设备'}</div>
      <div style="margin-bottom: 8px;"><strong>报警级别：</strong>
        <el-tag type="${levelType}" size="small">${levelText}</el-tag>
      </div>
      <div style="margin-bottom: 8px;"><strong>报警内容：</strong>${alarmInfo.alarmContent || alarmInfo.message || '无详细内容'}</div>
      <div style="margin-bottom: 8px;"><strong>发生时间：</strong>${formatTimestamp(alarmInfo.timestamp || new Date().toISOString())}</div>
      <div style="color: #67c23a; font-size: 12px; margin-top: 10px;">
        💡 系统检测到新报警，请及时处理！
      </div>
    </div>`,
    '新报警通知',
    {
      confirmButtonText: '查看详情',
      cancelButtonText: '知道了',
      type: 'warning',
      center: true,
      dangerouslyUseHTMLString: true,
      showCancelButton: true,
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          // 点击"查看详情"，跳转到报警详情
          viewAlarmDetail(alarmInfo)
        }
        done()
      }
    }
  )
}

// 显示优先弹窗
const showPriorityPopup = (alarmInfo: any) => {
  const alarmLevel = alarmInfo.level || 'high'
  const levelText = getLevelText(alarmLevel)
  const levelType = getLevelType(alarmLevel)
  
  ElMessageBox.alert(
    `<div style="text-align: left; padding: 10px 0;">
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <el-icon style="color: #e6a23c; font-size: 20px; margin-right: 8px;"><Warning /></el-icon>
        <span style="font-size: 16px; font-weight: bold;">🚨 优先报警通知</span>
      </div>
      <div style="margin-bottom: 8px;"><strong>设备名称：</strong>${alarmInfo.deviceName || '未知设备'}</div>
      <div style="margin-bottom: 8px;"><strong>报警级别：</strong>
        <el-tag type="${levelType}" size="small">${levelText}</el-tag>
      </div>
      <div style="margin-bottom: 8px;"><strong>报警内容：</strong>${alarmInfo.message || alarmInfo.alarmContent || '无详细内容'}</div>
      <div style="margin-bottom: 8px;"><strong>发生时间：</strong>${formatTimestamp(alarmInfo.timestamp || new Date().toISOString())}</div>
      <div style="color: #f56c6c; font-size: 12px; margin-top: 10px;">
        ⚠️ 此为优先报警，请及时处理！
      </div>
    </div>`,
    '优先报警通知',
    {
      confirmButtonText: '立即处理',
      cancelButtonText: '稍后处理',
      type: 'warning',
      center: true,
      dangerouslyUseHTMLString: true,
      showCancelButton: true,
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          // 点击"立即处理"，跳转到报警详情
          viewAlarmDetail(alarmInfo)
        }
        done()
      }
    }
  )
}

// 加载报警统计信息
const loadStatistics = async () => {
  try {
    const response = await getAlarmStatistics()
    if (response && response.data) {
      statistics.value = {
        total: response.data.total || 0,
        active: response.data.active || 0,
        resolved: response.data.resolved || 0,
        levelStats: response.data.levelStats || {
          high: 0,
          medium: 0,
          low: 0
        }
      }
    } else {
      // 模拟数据，实际应该从后端获取
      statistics.value = {
        total: alarms.value.length,
        active: alarms.value.filter(a => a.status === 'active').length,
        resolved: alarms.value.filter(a => a.status === 'resolved').length,
        levelStats: {
          high: alarms.value.filter(a => a.level === 'high').length,
          medium: alarms.value.filter(a => a.level === 'medium').length,
          low: alarms.value.filter(a => a.level === 'low').length
        }
      }
    }
  } catch (error) {
     console.error('加载报警统计信息失败:', error)
     // 使用模拟数据
     updatePageStatistics(alarms.value)
   }
}

// 初始化WebSocket
const initWebSocket = async () => {
  try {
    logWebSocketStatus('connecting')
    
    // 连接WebSocket
    await connect()
    
    // 等待连接建立
    const checkConnection = () => {
      return new Promise((resolve) => {
        const check = () => {
          if (connected.value) {
            resolve(true)
          } else {
            setTimeout(check, 100)
          }
        }
        check()
      })
    }
    
    // 等待最多3秒
    await Promise.race([
      checkConnection(),
      new Promise(resolve => setTimeout(() => resolve(false), 3000))
    ])
    
    if (connected.value) {
      logWebSocketStatus('connected')
      
      // 订阅报警消息
      onMessage('alarm', handleWebSocketMessage)
      onMessage('priority_alarm', handleWebSocketMessage)
      onMessage('new_alarm', handleWebSocketMessage)
      
      console.log('WebSocket连接成功，已订阅报警消息')
      
      // 测试WebSocket连接
       setTimeout(() => {
         send('test', { message: '前端WebSocket连接测试' })
       }, 1000)
    } else {
      logWebSocketStatus('failed')
      console.error('WebSocket连接失败，3秒后重试')
      
      // 3秒后重试
      setTimeout(() => {
        initWebSocket()
      }, 3000)
    }
  } catch (error) {
    logWebSocketStatus('error')
    console.error('WebSocket初始化失败:', error)
    
    // 5秒后重试
    setTimeout(() => {
      initWebSocket()
    }, 5000)
  }
}

// 处理新报警通知点击
const handleNewAlarmNotification = () => {
  clearNotification()
  fetchAlarms()
}

// 清除新报警通知
const clearNotification = () => {
  newAlarmNotification.value = false
  unreadAlarmCount.value = 0
}

// 轮询检查新报警
let pollInterval: number | null = null

// 初始化
onMounted(() => {
  fetchAlarms()
  initWebSocket()
  
  // 启动轮询检查新报警（每10秒检查一次）
  startPolling()
})

// 组件卸载时清理
onUnmounted(() => {
  stopPolling()
  disconnect()
})

// 启动轮询
const startPolling = () => {
  pollInterval = window.setInterval(() => {
    checkNewAlarms()
  }, 10000) // 10秒检查一次
}

// 停止轮询
const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

// 检查新报警
const checkNewAlarms = async () => {
  try {
    console.log('轮询检查新报警...')
    
    // 获取上次检查的最新时间
    const lastCheckTime = parseInt(localStorage.getItem('lastAlarmCheckTime') || '0')
    console.log('上次检查时间:', new Date(lastCheckTime).toLocaleString())
    
    // 获取最新的报警列表（使用与页面初始化相同的参数）
    const params = {
      pageNum: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      level: filter.value.level || undefined,
      status: filter.value.status || undefined,
      keyword: filter.value.keyword || undefined
    }
    
    console.log('轮询检测参数:', params)
    const response: any = await getAlarms(params)
    console.log('API响应原始数据:', response)
    console.log('API响应数据:', response?.data?.list?.length || 0, '条报警')
    
    // 检查响应格式并提取数据（与页面初始化相同）
    let resultData = null
    if (response && response.data) {
      // 标准格式: { code: 200, msg: 'success', data: { list: [], total: 100 } }
      resultData = response.data
    } else if (response && response.list) {
      // 直接格式: { list: [], total: 100 }
      resultData = response
    }
    
    if (resultData && resultData.list) {
      // 数据标准化：确保使用前端期望的字段名（与页面初始化相同）
      const normalizedList = resultData.list.map((alarm: any) => ({
        ...alarm,
        level: alarm.level || alarm.alarmLevel,
        type: alarm.type || alarm.alarmType,
        deviceName: alarm.deviceName || alarm.device_name || alarm.name,
        alarmContent: alarm.alarmContent || alarm.content || alarm.message,
        timestamp: alarm.timestamp || alarm.time || alarm.createTime,
        status: (alarm.status || alarm.state) === '待处理' ? 'active' : 
                 (alarm.status || alarm.state) === '已处理' ? 'resolved' : 
                 (alarm.status || alarm.state)
      }))
      
      const latestAlarms = normalizedList
      
      if (latestAlarms.length > 0) {
        const latestAlarm = latestAlarms[0]
        const latestAlarmTime = new Date(latestAlarm.timestamp).getTime()
        
        console.log('最新报警时间:', new Date(latestAlarmTime).toLocaleString())
        console.log('时间比较:', latestAlarmTime, '>', lastCheckTime, '=', latestAlarmTime > lastCheckTime)
        
        // 如果发现比上次检查时间更新的报警
        if (latestAlarmTime > lastCheckTime) {
          console.log('发现新报警，触发通知!')
          
          // 播放声音提醒
          playAlertSound()
          
          // 显示弹窗通知
          showNewAlarmPopup(latestAlarm)
          
          // 发送邮件通知
          sendEmailNotification(latestAlarm)
          
          // 刷新报警列表
          fetchAlarms()
          
          // 显示Element Plus通知
          ElNotification({
            title: '新报警通知',
            message: `设备 ${latestAlarm.deviceName} 发生新报警`,
            type: 'warning',
            duration: 5000
          })
        } else {
          console.log('没有发现新报警')
        }
      } else {
        console.log('报警列表为空')
      }
    }
    
    // 更新最后检查时间
    const newCheckTime = Date.now()
    localStorage.setItem('lastAlarmCheckTime', newCheckTime.toString())
    console.log('更新检查时间:', new Date(newCheckTime).toLocaleString())
    
  } catch (error) {
    console.error('检查新报警失败:', error)
  }
}
</script>

<style scoped>
.alarm-view {
  padding: 20px;
}

.page-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
}

.new-alarm-notification {
  margin-left: auto;
}

.new-alarm-notification .el-badge {
  margin-right: 10px;
}

.statistics-row {
  margin-top: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon .el-icon {
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
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
  align-items: center;
  flex-wrap: wrap;
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

/* 报警详情样式 */
.alarm-detail-container {
  min-height: 400px;
}

.alarm-detail {
  padding: 20px 0;
}

.alarm-history {
  padding: 20px 0;
  max-height: 400px;
  overflow-y: auto;
}

.empty-history {
  text-align: center;
  padding: 40px 0;
}

.history-list {
  padding: 0 20px;
}

.history-item {
  padding: 8px 0;
}

.history-remark {
  margin-top: 4px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  font-size: 12px;
}

.alarm-action {
  padding: 20px 0;
}

.el-timeline-item {
  padding-bottom: 10px;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .alarm-detail-container {
    min-height: 300px;
  }
  
  .alarm-history {
    max-height: 300px;
  }
  
  .action-buttons {
    gap: 4px;
  }
  
  .action-buttons .el-button {
    padding: 6px 8px;
    font-size: 12px;
  }
}
</style>