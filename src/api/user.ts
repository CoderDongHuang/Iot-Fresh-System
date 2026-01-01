// 用户相关 API 占位
import type { ResponseData } from '@/types/api'

export async function loginApi(_params: { username: string; password: string }): Promise<{ token: string }> {
  // TODO: 替换为真实后端请求
  return Promise.resolve({ token: 'mock-token' })
}

export async function logoutApi(): Promise<ResponseData> {
  // TODO: 替换为真实后端请求
  return Promise.resolve({ code: 200, msg: '退出成功', data: null })
}

export async function getUserInfo(): Promise<{ user: any; roles: string[]; permissions: string[] }> {
  // TODO: 替换为真实后端请求
  return Promise.resolve({
    user: { username: 'admin', email: 'admin@example.com' },
    roles: ['admin'],
    permissions: ['*'],
  })
}
