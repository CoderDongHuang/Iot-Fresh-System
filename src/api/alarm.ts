import type { ResponseData, PageResult } from '@/types/api'
import service from './http'

// 报警相关API

// 获取报警列表
export function getAlarms(params: any): Promise<ResponseData<PageResult<any>>> {
  return service.get('http://localhost:8080/api/alarm/list', { params })
}

// 获取报警统计
export function getAlarmStatistics(): Promise<any> {
  return service.get('http://localhost:8080/api/alarm/statistics')
}

// 处理报警
export function resolveAlarm(alarmId: number): Promise<ResponseData> {
  return service.post(`http://localhost:8080/api/alarm/resolve/${alarmId}`)
}

// 忽略报警
export function ignoreAlarm(alarmId: number): Promise<ResponseData> {
  return service.post(`http://localhost:8080/api/alarm/ignore/${alarmId}`)
}

// 清除全部报警
export function clearAllAlarms(): Promise<ResponseData> {
  return service.delete('http://localhost:8080/api/alarm/clear-all')
}

// 获取报警详情
export function getAlarmDetail(alarmId: number): Promise<any> {
  return service.get(`http://localhost:8080/api/alarm/detail/${alarmId}`)
}

// 获取报警设置
export function getAlarmSettings(): Promise<any> {
  return service.get('http://localhost:8080/api/alarm/settings')
}

// 更新报警设置
export function updateAlarmSettings(settings: any): Promise<ResponseData> {
  return service.post('http://localhost:8080/api/alarm/settings', settings)
}