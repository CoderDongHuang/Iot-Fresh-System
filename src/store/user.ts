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
        // 检查响应格式，兼容不同格式
        let token;
        if (res.data && typeof res.data === 'object' && 'token' in res.data) {
          // 如果res.data是包含token的对象
          token = res.data.token
        } else if (res.token) {
          // 如果res直接包含token
          token = res.token
        } else {
          // 如果响应格式不符合预期
          throw new Error('登录响应格式错误')
        }
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
        // 检查响应格式，兼容不同格式
        let user, roles, permissions;
        if (res.data && typeof res.data === 'object') {
          // 如果res.data是包含用户信息的对象
          user = res.data.user
          roles = res.data.roles
          permissions = res.data.permissions
        } else {
          // 如果res直接包含用户信息
          user = res.user
          roles = res.roles
          permissions = res.permissions
        }
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