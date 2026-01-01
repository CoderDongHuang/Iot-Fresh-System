
import Cookies from 'js-cookie'
import { useUserStore } from '@/store/user'

const TokenKey = 'iot-token'
const RefreshTokenKey = 'iot-refresh-token'

export function getToken(): string {
  return Cookies.get(TokenKey) || ''
}

export function setToken(token: string): void {
  Cookies.set(TokenKey, token, { expires: 7 })
}

export function removeToken(): void {
  Cookies.remove(TokenKey)
  Cookies.remove(RefreshTokenKey)
}

export function getRefreshToken(): string {
  return Cookies.get(RefreshTokenKey) || ''
}

export function setRefreshToken(token: string): void {
  Cookies.set(RefreshTokenKey, token, { expires: 30 })
}

// 检查权限
export function checkPermission(value: string[]): boolean {
  if (!value || value.length === 0) return true
  
  const userStore = useUserStore?.()
  if (!userStore) return false
  
  const { permissions } = userStore
  return permissions.some((permission: string) => value.includes(permission))
}

// 检查角色
export function checkRole(value: string[]): boolean {
  if (!value || value.length === 0) return true
  
  const userStore = useUserStore?.()
  if (!userStore) return false
  
  const { roles } = userStore
  return roles.some((role: string) => value.includes(role))
}