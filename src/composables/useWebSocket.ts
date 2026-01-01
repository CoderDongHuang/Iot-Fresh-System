import { ref, onUnmounted } from 'vue'

interface WebSocketMessage {
  type: string
  data: any
}

export function useWebSocket() {
  const wsUrl = import.meta.env.VITE_APP_WS_URL
  const socket = ref<WebSocket | null>(null)
  const connected = ref(false)
  const messageHandlers = new Map<string, Function[]>()
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  // 连接WebSocket
  const connect = () => {
    if (connected.value || !wsUrl) return

    try {
      socket.value = new WebSocket(wsUrl)
      
      socket.value.onopen = () => {
        console.log('WebSocket连接成功')
        connected.value = true
        reconnectAttempts.value = 0
      }
      
      socket.value.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          handleMessage(message)
        } catch (error) {
          console.error('WebSocket消息解析失败:', error)
        }
      }
      
      socket.value.onclose = () => {
        console.log('WebSocket连接关闭')
        connected.value = false
        handleReconnect()
      }
      
      socket.value.onerror = (error) => {
        console.error('WebSocket连接错误:', error)
        connected.value = false
      }
    } catch (error) {
      console.error('WebSocket连接失败:', error)
    }
  }

  // 断开连接
  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
    connected.value = false
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  // 处理重连
  const handleReconnect = () => {
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      console.warn('已达到最大重连次数，停止重连')
      return
    }
    
    reconnectAttempts.value++
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.value), 30000)
    
    reconnectTimer = setTimeout(() => {
      console.log(`尝试重连 (${reconnectAttempts.value}/${maxReconnectAttempts})`)
      connect()
    }, delay)
  }

  // 发送消息
  const send = (type: string, data: any) => {
    if (!socket.value || !connected.value) {
      console.warn('WebSocket未连接，无法发送消息')
      return
    }
    
    const message: WebSocketMessage = { type, data }
    socket.value.send(JSON.stringify(message))
  }

  // 处理消息
  const handleMessage = (message: WebSocketMessage) => {
    const handlers = messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach(handler => handler(message.data))
    }
  }

  // 注册消息处理器
  const onMessage = (type: string, handler: Function) => {
    if (!messageHandlers.has(type)) {
      messageHandlers.set(type, [])
    }
    messageHandlers.get(type)?.push(handler)
    
    // 返回取消监听的函数
    return () => {
      const handlers = messageHandlers.get(type)
      if (handlers) {
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      }
    }
  }

  // 移除消息处理器
  const offMessage = (type: string, handler?: Function) => {
    if (!handler) {
      messageHandlers.delete(type)
    } else {
      const handlers = messageHandlers.get(type)
      if (handlers) {
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      }
    }
  }

  // 订阅主题
  const subscribe = (topic: string) => {
    send('subscribe', { topic })
  }

  // 取消订阅
  const unsubscribe = (topic: string) => {
    send('unsubscribe', { topic })
  }

  // 清理
  onUnmounted(() => {
    disconnect()
    messageHandlers.clear()
  })

  return {
    socket,
    connected,
    connect,
    disconnect,
    send,
    onMessage,
    offMessage,
    subscribe,
    unsubscribe,
  }
}