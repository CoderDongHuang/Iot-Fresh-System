import type { ResponseData } from '@/types/api'
import service from './http'

// 报警相关API

// 获取报警列表
export function getAlarmList(params: any): Promise<any> {
  return service.get('/alarm/list', { params })
}

// 获取报警统计
export function getAlarmStatistics(): Promise<any> {
  return service.get('/alarm/statistics')
}

// 处理报警
export function handleAlarm(alarmId: number, action: string): Promise<ResponseData> {
  return service.post(`/alarm/handle/${alarmId}`, { action })
}

// 获取报警详情
export function getAlarmDetail(alarmId: number): Promise<any> {
  return service.get(`/alarm/detail/${alarmId}`)
}

// 获取报警设置
export function getAlarmSettings(): Promise<any> {
  return service.get('/alarm/settings')
}

// 更新报警设置
export function updateAlarmSettings(settings: any): Promise<ResponseData> {
  return service.post('/alarm/settings', settings)
}