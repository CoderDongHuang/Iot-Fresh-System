
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
  // TODO: 替换为真实后端请求
  return Promise.resolve({
    onlineDevices: 42,
    totalDevices: 50,
    todayData: 1280,
    dataGrowth: 15.5,
    unresolvedAlarms: 3,
    todayAlarms: 8,
    alarmCount: 3,
    alarmTrend: -2,
    systemStatus: '正常',
    cpuUsage: 35,
    deviceStatusDistribution: {
      online: 42,
      offline: 5,
      fault: 2,
      maintenance: 1
    },
    recentAlarms: [
      {
        id: 1,
        deviceName: '冷链车001',
        alarmType: '温度异常',
        alarmLevel: 'high',
        timestamp: '2023-10-20 14:30:25',
        status: 'active'
      },
      {
        id: 2,
        deviceName: '冷藏柜002',
        alarmType: '湿度异常',
        alarmLevel: 'medium',
        timestamp: '2023-10-20 13:45:12',
        status: 'resolved'
      },
      {
        id: 3,
        deviceName: '冷库A区',
        alarmType: '设备故障',
        alarmLevel: 'high',
        timestamp: '2023-10-20 12:15:33',
        status: 'active'
      }
    ]
  })
}

// 获取设备状态分布
export function getDeviceStatusDistribution() {
  return service.get('/dashboard/device-status-distribution')
}

// 获取最近报警信息
export function getRecentAlarms() {
  return service.get('/dashboard/recent-alarms')
}