import type { ResponseData } from '@/types/api'
import service from './http'

// 钉钉机器人相关API

// 获取钉钉机器人设置
export function getDingTalkSettings(): Promise<ResponseData<DingTalkSettings>> {
  return service.get('http://localhost:8080/api/dingtalk/settings')
}

// 保存钉钉机器人设置
export function saveDingTalkSettings(settings: DingTalkSettings): Promise<ResponseData> {
  return service.post('http://localhost:8080/api/dingtalk/settings', settings)
}

// 发送钉钉机器人消息
export function sendDingTalkMessage(params: DingTalkMessageParams): Promise<ResponseData> {
  return service.post('http://localhost:8080/api/dingtalk/send', params)
}

// 测试钉钉机器人
export function testDingTalk(params: { webhookUrl: string; secret: string }): Promise<ResponseData> {
  return service.post('http://localhost:8080/api/dingtalk/test', params)
}

// 钉钉机器人设置接口
export interface DingTalkSettings {
  enabled: boolean
  webhookUrl: string
  secret: string
  notifyLevels: string[]
  quietHours: [string, string]
}

// 钉钉机器人消息参数接口
export interface DingTalkMessageParams {
  alarmInfo: any
  messageType: 'text' | 'markdown' | 'actionCard'
}