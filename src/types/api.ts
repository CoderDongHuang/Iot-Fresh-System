// src/types/api.ts
export interface ResponseData<T = any> {
  code: number
  msg: string
  data: T
}

export interface PageParams {
  pageNum: number
  pageSize: number
  [key: string]: any
}

export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}

// src/types/device.ts
export interface DeviceInfo {
  id?: number
  vid: string
  deviceName?: string
  deviceType?: string
  status: number | string // 状态可能是数字或字符串
  location?: string
  contactPhone?: string
  description?: string
  lastHeartbeat?: string
  lastOnlineTime?: string
  createTime?: string
  updateTime?: string
  remarks?: string
  currentData?: DeviceData
}

export interface DeviceData {
  id?: number
  vid: string
  tin?: number        // 内部温度
  tout?: number       // 外部温度
  hin?: number        // 内部湿度
  hout?: number       // 外部湿度
  lxin?: number       // 内部光照
  lxout?: number      // 外部光照
  brightness?: number // 亮度
  vStatus?: number
  timestamp?: string
}

export interface ControlCommand {
  vid: string
  commandType: 'temperature' | 'light' | 'fan' | 'global'
  data: any
}

export interface AlarmInfo {
  id?: number
  vid: string
  alarmType: string
  alarmLevel: number
  alarmMessage: string
  alarmData?: string
  resolved: boolean
  resolvedTime?: string
  resolvedBy?: string
  createTime?: string
}

export interface DeviceQueryParams extends PageParams {
  vid?: string
  deviceType?: string
  status?: number
  startTime?: string
  endTime?: string
}

// 仪表盘统计信息类型
export interface DeviceStatusDistribution {
  online: number
  offline: number
  fault: number
  maintenance: number
}

export interface DashboardStatistics {
  onlineDevices: number
  totalDevices: number
  todayData: number
  dataGrowth: number
  unresolvedAlarms: number
  todayAlarms: number
  alarmCount: number
  alarmTrend: number
  systemStatus: string
  cpuUsage: number
  deviceStatusDistribution: DeviceStatusDistribution
  recentAlarms: Array<{
    id: number
    deviceName: string
    alarmType: string
    alarmLevel: string
    timestamp: string
    status: string
  }>
}