import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'
import router from '@/router'

// 创建axios实例
const service: AxiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 检查HTTP状态码
    if (response.status >= 200 && response.status < 300) {
      const res = response.data
      
      // 检查响应数据是否存在
      if (!res) {
        console.warn('HTTP拦截器: 响应数据为空')
        return Promise.reject(new Error('响应数据为空'))
      }
      
      console.log('HTTP拦截器: 收到响应数据:', res)
      
      // 兼容性处理：如果后端直接返回数据对象（没有包装）
      if (typeof res === 'object' && !res.code) {
        console.log('HTTP拦截器: 后端返回未包装的数据，直接返回')
        return res  // 直接返回数据对象
      }
      
      // 检查业务状态码
      if (res.code && res.code !== 200) {
        // 未登录或token过期
        if (res.code === 401) {
          ElMessageBox.confirm('登录状态已过期，请重新登录', '系统提示', {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            useUserStore().logout()
            router.push('/login')
          })
        } else {
          ElMessage({
            message: res.msg || '请求失败',
            type: 'error',
            duration: 5 * 1000,
          })
        }
        return Promise.reject(new Error(res.msg || 'Error'))
      } else if (res.code === 200) {
        // 正常包装格式 - 返回完整响应对象，让业务层处理
        console.log('HTTP拦截器: 返回完整响应对象')
        return res
      } else {
        // 没有code字段，直接返回数据
        console.log('HTTP拦截器: 响应没有code字段，直接返回数据')
        return res
      }
    } else {
      // HTTP 状态码错误
      ElMessage({
        message: `HTTP错误: ${response.status}`,
        type: 'error',
        duration: 5 * 1000,
      })
      return Promise.reject(new Error(`HTTP错误: ${response.status}`))
    }
  },
  (error) => {
    let { message } = error
    if (message === 'Network Error') {
      message = '网络连接错误'
    } else if (message.includes('timeout')) {
      message = '请求超时'
    } else if (message.includes('Request failed with status code 500')) {
      message = '服务器内部错误，请稍后重试'
    } else if (message.includes('Request failed with status code 404')) {
      message = '请求地址不存在'
    } else if (message.includes('Request failed with status code 401')) {
      message = '未授权访问'
    } else if (message.includes('Request failed with status code')) {
      message = `接口异常: ${message}`
    }
    ElMessage({
      message,
      type: 'error',
      duration: 5 * 1000,
    })
    return Promise.reject(error)
  }
)

// 导出实例
export default service