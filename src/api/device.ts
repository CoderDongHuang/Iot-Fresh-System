import type { ResponseData, DeviceInfo, DeviceData, PageResult, PageParams } from '@/types/api'
import service from './http'

// 获取设备列表
export function getDeviceList(params: PageParams): Promise<PageResult<DeviceInfo>> {
  return service.get('http://localhost:8080/api/device/list', { params })
}

// 获取设备详情
export function getDeviceDetail(vid: string): Promise<ResponseData<DeviceInfo>> {
  return service.get(`http://localhost:8080/api/device/detail/${vid}`)
}

// 获取设备实时数据
export function getDeviceRealTimeData(vid: string): Promise<DeviceData> {
  return service.get(`http://localhost:8080/api/device/real-time-data/${vid}`)
}

// 获取设备历史数据
export function getDeviceHistoryData(vid: string, params: any): Promise<DeviceData[]> {
  return service.get(`http://localhost:8080/api/device/history-data/${vid}`, { params })
}

// 控制设备
export function controlDevice(vid: string, command: any): Promise<ResponseData> {
  return service.post(`http://localhost:8080/api/device/control/${vid}`, command)
}

// 获取设备状态统计
export function getDeviceStatusStats(): Promise<any> {
  return service.get('http://localhost:8080/api/device/status-stats')
}