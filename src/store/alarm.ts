import { defineStore } from 'pinia'
import { getAlarms as getAlarmList, getAlarmStatistics, handleAlarm, getAlarmSettings, updateAlarmSettings } from '@/api/alarm'

interface AlarmState {
  alarmList: any[]
  alarmStats: any
  alarmSettings: any
  loading: boolean
  total: number
}

export const useAlarmStore = defineStore('alarm', {
  state: (): AlarmState => ({
    alarmList: [],
    alarmStats: {},
    alarmSettings: {},
    loading: false,
    total: 0
  }),

  getters: {
    getUnresolvedAlarms: (state) => {
      return state.alarmList.filter(alarm => alarm.status === 'active' || alarm.status === 'unresolved')
    },
    getResolvedAlarms: (state) => {
      return state.alarmList.filter(alarm => alarm.status === 'resolved' || alarm.status === 'closed')
    }
  },

  actions: {
    // 获取报警列表
    async fetchAlarmList(params: any = {}) {
      try {
        this.loading = true
        const result: any = await getAlarmList(params)
        // 检查响应格式，兼容不同格式
        if (result && result.data) {
          // 如果响应遵循标准格式 { code, msg, data }
          this.alarmList = result.data.list || []
          this.total = result.data.total || 0
        } else {
          // 如果响应直接包含列表数据
          this.alarmList = result.list || []
          this.total = result.total || 0
        }
        return Promise.resolve(result)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },

    // 获取报警统计
    async fetchAlarmStatistics() {
      try {
        const result: any = await getAlarmStatistics()
        // 检查响应格式，兼容不同格式
        if (result && result.data) {
          // 如果响应遵循标准格式 { code, msg, data }
          this.alarmStats = result.data
        } else {
          // 如果响应直接包含统计数据
          this.alarmStats = result
        }
        return Promise.resolve(result)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 处理报警
    async handleAlarm(alarmId: number, action: string) {
      try {
        const result: any = await handleAlarm(alarmId, action)
        // 更新本地列表
        const index = this.alarmList.findIndex(alarm => alarm.id === alarmId)
        if (index !== -1) {
          this.alarmList[index].status = action === 'resolve' ? 'resolved' : this.alarmList[index].status
        }
        return Promise.resolve(result)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 获取报警设置
    async fetchAlarmSettings() {
      try {
        const result: any = await getAlarmSettings()
        // 检查响应格式，兼容标准格式
        if (result && result.data) {
          this.alarmSettings = result.data
        } else {
          this.alarmSettings = result
        }
        return Promise.resolve(result)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 更新报警设置
    async updateAlarmSettings(settings: any) {
      try {
        const result: any = await updateAlarmSettings(settings)
        // 检查响应格式
        if (result && result.data) {
          this.alarmSettings = { ...this.alarmSettings, ...result.data }
        } else {
          this.alarmSettings = { ...this.alarmSettings, ...settings }
        }
        return Promise.resolve(result)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 添加报警
    addAlarm(alarm: any) {
      this.alarmList.unshift(alarm)
      this.total += 1
    },

    // 更新报警状态
    updateAlarmStatus(alarmId: number, status: string) {
      const alarm = this.alarmList.find(a => a.id === alarmId)
      if (alarm) {
        alarm.status = status
      }
    }
  },
})