import axios from 'axios'

// 创建取消令牌的Map
const pendingMap = new Map<string, AbortController>()

// 生成请求key
function generateReqKey(config: any): string {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

// 添加请求到pendingMap
export function addPending(config: any): void {
  const controller = new AbortController()
  config.signal = controller.signal
  
  const key = generateReqKey(config)
  if (!pendingMap.has(key)) {
    pendingMap.set(key, controller)
  }
}

// 移除pending请求
export function removePending(config: any): void {
  const key = generateReqKey(config)
  if (pendingMap.has(key)) {
    const controller = pendingMap.get(key)
    controller?.abort()
    pendingMap.delete(key)
  }
}

// 清除所有pending请求
export function clearPending(): void {
  pendingMap.forEach(controller => {
    controller.abort()
  })
  pendingMap.clear()
}

// 下载文件
export function downloadFile(url: string, params: any, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    axios({
      url,
      params,
      method: 'GET',
      responseType: 'blob',
    }).then(response => {
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      resolve()
    }).catch(reject)
  })
}

// 上传文件
export function uploadFile(url: string, file: File, params?: any): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)
  
  if (params) {
    Object.keys(params).forEach(key => {
      formData.append(key, params[key])
    })
  }
  
  return axios.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}