
import service from './http'

// 数据相关API

// 获取历史数据
export function getHistoryData(params: any): Promise<any> {
  return service.get('/api/data/history', { params })
}

// 获取数据统计
export function getDataStatistics(params: any): Promise<any> {
  return service.get('/api/data/statistics', { params })
}

// 获取温度历史数据
export function getTemperatureHistory(vid: string, params: any): Promise<any> {
  return service.get(`/api/data/temperature/${vid}`, { params })
}

// 获取湿度历史数据
export function getHumidityHistory(vid: string, params: any): Promise<any> {
  return service.get(`/api/data/humidity/${vid}`, { params })
}

// 获取光照历史数据
export function getLightHistory(vid: string, params: any): Promise<any> {
  return service.get(`/api/data/light/${vid}`, { params })
}

// 导出数据
export function exportData(params: any): Promise<any> {
  return service.get('/data/export', { params })
}