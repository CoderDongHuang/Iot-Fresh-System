// 用户相关 API
import type { ResponseData } from '@/types/api'
import service from './http'

export async function loginApi(params: { username: string; password: string }): Promise<any> {
  return service.post('http://localhost:8080/api/auth/login', params)
}

export async function logoutApi(): Promise<any> {
  return service.post('http://localhost:8080/api/auth/logout')
}

export async function getUserInfo(): Promise<any> {
  return service.get('http://localhost:8080/api/user/info')
}

export async function updateUserProfile(data: any): Promise<any> {
  return service.put('http://localhost:8080/api/user/profile', data)
}

export async function updatePassword(data: any): Promise<any> {
  return service.put('http://localhost:8080/api/user/password', data)
}
