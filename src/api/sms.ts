import type { ResponseData } from '@/types/api'
import service from './http'

// 短信相关API

// 获取短信设置
export function getSmsSettings(): Promise<ResponseData<SmsSettings>> {
  return service.get('http://localhost:8080/api/sms/settings')
}

// 保存短信设置
export function saveSmsSettings(settings: SmsSettings): Promise<ResponseData> {
  return service.post('http://localhost:8080/api/sms/settings', settings)
}

// 发送短信
export function sendSms(params: SendSmsParams): Promise<ResponseData> {
  return service.post('http://localhost:8080/api/sms/send', params)
}

// 测试短信发送
export function testSms(phoneNumber: string): Promise<ResponseData> {
  return service.post('http://localhost:8080/api/sms/test', { phoneNumber })
}

// 获取短信模板
export function getSmsTemplates(): Promise<ResponseData<SmsTemplates>> {
  return service.get('http://localhost:8080/api/sms/templates')
}

// 保存短信模板
export function saveSmsTemplates(templates: SmsTemplates): Promise<ResponseData> {
  return service.post('http://localhost:8080/api/sms/templates', templates)
}

// 短信设置接口
export interface SmsSettings {
  enabled: boolean
  phoneNumbers: string[]
  notifyLevels: string[]
  quietHours: [string, string]
  pushFrequency: 'immediate' | 'batch' | 'summary'
}

// 短信模板接口
export interface SmsTemplates {
  high: string
  medium: string
  low: string
}

// 发送短信参数接口
export interface SendSmsParams {
  phoneNumbers: string[]
  template: string
  variables: Record<string, string>
  level: string
}