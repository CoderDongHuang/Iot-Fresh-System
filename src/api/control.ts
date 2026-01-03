import type { ResponseData } from '@/types/api'
import service from './http'

// 控制相关API

// 发送控制命令
export function sendControlCommand(vid: string, command: any): Promise<ResponseData> {
  return service.post(`/api/control/command/${vid}`, command)
}

// 获取控制历史
export function getControlHistory(vid: string, params: any): Promise<any> {
  return service.get(`/api/control/history/${vid}`, { params })
}

// 获取设备控制参数
export function getDeviceControlParams(vid: string): Promise<any> {
  return service.get(`/api/control/params/${vid}`)
}

// 保存控制参数
export function saveControlParams(vid: string, params: any): Promise<ResponseData> {
  return service.post(`/api/control/params/${vid}`, params)
}