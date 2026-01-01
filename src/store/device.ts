import { defineStore } from 'pinia'
import type { DeviceInfo } from '@/types/api'
import { getDeviceList, getDeviceDetail, getDeviceStatusStats } from '@/api/device'

interface DeviceState {
  deviceList: DeviceInfo[]
  currentDevice: DeviceInfo | null
  deviceStatusStats: {
    online: number
    offline: number
    fault: number
    maintenance: number
  }
  loading: boolean
}

export const useDeviceStore = defineStore('device', {
  state: (): DeviceState => ({
    deviceList: [],
    currentDevice: null,
    deviceStatusStats: {
      online: 0,
      offline: 0,
      fault: 0,
      maintenance: 0
    },
    loading: false
  }),

  getters: {
    getDeviceById: (state) => (id: string) => {
      return state.deviceList.find(device => device.vid === id)
    },
    getOnlineDevices: (state) => {
      return state.deviceList.filter(device => device.status === 1) // 假设1表示在线
    },
    getOfflineDevices: (state) => {
      return state.deviceList.filter(device => device.status === 0) // 假设0表示离线
    }
  },

  actions: {
    // 获取设备列表
    async fetchDeviceList(params: any = {}) {
      try {
        this.loading = true
        const result = await getDeviceList(params)
        this.deviceList = result.list || []
        return Promise.resolve(result)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },

    // 获取设备详情
    async fetchDeviceDetail(vid: string) {
      try {
        const result = await getDeviceDetail(vid)
        this.currentDevice = result
        return Promise.resolve(result)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 获取设备状态统计
    async fetchDeviceStatusStats() {
      try {
        const result = await getDeviceStatusStats()
        this.deviceStatusStats = result
        return Promise.resolve(result)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 更新设备状态
    updateDeviceStatus(vid: string, status: number) {
      const device = this.deviceList.find(d => d.vid === vid)
      if (device) {
        device.status = status
      }
    },

    // 添加设备
    addDevice(device: DeviceInfo) {
      this.deviceList.push(device)
    },

    // 更新设备
    updateDevice(device: DeviceInfo) {
      const index = this.deviceList.findIndex(d => d.vid === device.vid)
      if (index !== -1) {
        this.deviceList[index] = { ...this.deviceList[index], ...device }
      }
    },

    // 删除设备
    removeDevice(vid: string) {
      const index = this.deviceList.findIndex(d => d.vid === vid)
      if (index !== -1) {
        this.deviceList.splice(index, 1)
      }
    }
  },
})