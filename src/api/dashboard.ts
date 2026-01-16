
import service from './http'

// 仪表盘统计信息类型
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
  deviceStatusDistribution: {
    online: number
    offline: number
    fault: number
    maintenance: number
  }
  recentAlarms: Array<{
    id: number
    deviceName: string
    alarmType: string
    alarmLevel: string
    timestamp: string
    status: string
  }>
}

// 获取仪表盘统计数据
export function getDashboardStatistics(): Promise<DashboardStatistics> {
  return service.get('http://localhost:8080/api/dashboard/statistics')
}

// 获取设备状态分布
export function getDeviceStatusDistribution() {
  return service.get('http://localhost:8080/api/dashboard/device-status-distribution')
}

// 获取最近报警信息
export function getRecentAlarms() {
  return service.get('http://localhost:8080/api/dashboard/recent-alarms')
}

// 获取数据统计
export function getDataStatistics(params: any): Promise<any> {
  return service.get('http://localhost:8080/api/dashboard/data-statistics', { params })
}