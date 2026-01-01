import type { ResponseData, DeviceInfo, DeviceData, PageResult, PageParams } from '@/types/api'
import service from './http'

// 获取设备列表
export function getDeviceList(params: PageParams): Promise<PageResult<DeviceInfo>> {
  return service.get('/device/list', { params })
}

// 获取设备详情
export function getDeviceDetail(vid: string): Promise<DeviceInfo> {
  return service.get(`/device/detail/${vid}`)
}

// 获取设备实时数据
export function getDeviceRealTimeData(vid: string): Promise<DeviceData> {
  return service.get(`/device/real-time-data/${vid}`)
}

// 获取设备历史数据
export function getDeviceHistoryData(vid: string, params: any): Promise<DeviceData[]> {
  return service.get(`/device/history-data/${vid}`, { params })
}

// 控制设备
export function controlDevice(vid: string, command: any): Promise<ResponseData> {
  return service.post(`/device/control/${vid}`, command)
}

// 获取设备状态统计
export function getDeviceStatusStats(): Promise<any> {
  // TODO: 替换为真实后端请求
  return Promise.resolve({
    online: 42,
    offline: 5,
    fault: 2,
    maintenance: 1
  })
}