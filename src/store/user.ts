import { defineStore } from 'pinia'
import { loginApi, logoutApi, getUserInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'

interface UserState {
  token: string
  userInfo: Record<string, any>
  roles: string[]
  permissions: string[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: getToken() || '',
    userInfo: {},
    roles: [],
    permissions: [],
  }),
  
  getters: {
    isLogin: (state) => !!state.token,
    getToken: (state) => state.token,
    getUserInfo: (state) => state.userInfo,
    getRoles: (state) => state.roles,
    getPermissions: (state) => state.permissions,
  },
  
  actions: {
    // 登录
    async login(loginForm: { username: string; password: string }) {
      try {
        const res = await loginApi(loginForm)
        const { token } = res
        this.token = token
        setToken(token)
        return Promise.resolve()
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 获取用户信息
    async fetchUserInfo() {
      try {
        const res = await getUserInfo()
        const { user, roles, permissions } = res
        this.userInfo = user
        this.roles = roles
        this.permissions = permissions
        return Promise.resolve(res)
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 登出
    async logout() {
      try {
        await logoutApi()
      } finally {
        this.token = ''
        this.userInfo = {}
        this.roles = []
        this.permissions = []
        removeToken()
      }
    },
    
    // 重置Token
    resetToken() {
      this.token = ''
      this.userInfo = {}
      this.roles = []
      this.permissions = []
      removeToken()
    },
  },
})