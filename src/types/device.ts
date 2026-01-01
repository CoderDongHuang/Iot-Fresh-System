// src/types/device.ts
export interface DeviceInfo {
  id?: number
  vid: string
  deviceName?: string
  deviceType?: string
  status: number
  location?: string
  contactPhone?: string
  description?: string
  lastHeartbeat?: string
  createTime?: string
  updateTime?: string
}

export interface DeviceData {
  id?: number
  vid: string
  tin?: number
  tout?: number
  lxin?: number
  brightness?: number
  speedM1?: number
  speedM2?: number
  vStatus?: number
  timestamp?: string
}

export interface ControlCommand {
  vid: string
  command: string
  params?: any
}