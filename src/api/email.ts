import type { ResponseData } from '@/types/api'
import service from './http'

// 邮件相关API

// 获取邮件设置
export function getEmailSettings(): Promise<ResponseData<EmailSettings>> {
  return service.get('http://localhost:8080/api/email/settings')
}

// 保存邮件设置
export function saveEmailSettings(settings: EmailSettings): Promise<ResponseData> {
  return service.post('http://localhost:8080/api/email/settings', settings)
}

// 发送邮件
export function sendEmail(params: SendEmailParams): Promise<ResponseData> {
  return service.post('http://localhost:8080/api/email/send', params)
}

// 测试邮件发送
export function testEmail(emailAddress: string): Promise<ResponseData> {
  return service.post('http://localhost:8080/api/email/test', { emailAddress })
}

// 获取邮件模板
export function getEmailTemplates(): Promise<ResponseData<EmailTemplates>> {
  return service.get('http://localhost:8080/api/email/templates')
}

// 保存邮件模板
export function saveEmailTemplates(templates: EmailTemplates): Promise<ResponseData> {
  return service.post('http://localhost:8080/api/email/templates', templates)
}

// 邮件设置接口
export interface EmailSettings {
  enabled: boolean
  emailAddresses: string[]
  notifyLevels: string[]
  quietHours: [string, string]
  pushFrequency: 'immediate' | 'batch' | 'summary'
}

// 邮件模板接口
export interface EmailTemplates {
  high: string
  medium: string
  low: string
}

// 发送邮件参数接口
export interface SendEmailParams {
  emailAddresses: string[]
  subject: string
  content: string
  level: string
}