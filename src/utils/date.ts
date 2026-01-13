/**
 * 日期格式化工具函数
 */

// 格式化日期
export function formatDate(dateString: string | number | Date, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!dateString) return '-'
  
  let date: Date
  
  if (typeof dateString === 'string') {
    // 如果是字符串，尝试解析
    date = new Date(dateString)
  } else if (typeof dateString === 'number') {
    // 如果是数字，假设是时间戳
    date = new Date(dateString)
  } else if (dateString instanceof Date) {
    // 如果已经是Date对象
    date = dateString
  } else {
    // 如果是其他类型（如对象），尝试转换为字符串再解析
    date = new Date(String(dateString))
  }
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '-'
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 获取相对时间
export function getRelativeTime(date: Date | string | number): string {
  if (!date) return '-'
  
  let targetDate: Date
  
  if (typeof date === 'string') {
    targetDate = new Date(date)
  } else if (typeof date === 'number') {
    targetDate = new Date(date)
  } else if (date instanceof Date) {
    targetDate = date
  } else {
    targetDate = new Date(String(date))
  }
  
  if (isNaN(targetDate.getTime())) {
    return '-'
  }
  
  const now = new Date()
  const diffMs = now.getTime() - targetDate.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  
  if (diffSec < 60) {
    return '刚刚'
  } else if (diffMin < 60) {
    return `${diffMin}分钟前`
  } else if (diffHour < 24) {
    return `${diffHour}小时前`
  } else {
    return `${diffDay}天前`
  }
}

// 转换为时间戳
export function toTimestamp(date: Date | string): number {
  if (!date) return 0
  
  if (typeof date === 'string') {
    return new Date(date).getTime()
  }
  
  return date.getTime()
}