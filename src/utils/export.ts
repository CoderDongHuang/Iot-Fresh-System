/**
 * 数据导出工具函数
 */

/**
 * 导出数据为CSV格式
 * @param data - 要导出的数据数组
 * @param headers - CSV表头
 * @param filename - 文件名
 */
export function exportToCSV(data: any[], headers: string[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn('没有数据可导出')
    return
  }

  // 创建CSV内容
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      Object.values(row).map(field => 
        `"${String(field).replace(/"/g, '""')}"`
      ).join(',')
    )
  ].join('\n')

  // 创建Blob对象并下载
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadFile(blob, filename)
}

/**
 * 导出单行数据为CSV格式
 * @param data - 要导出的数据对象
 * @param headers - CSV表头
 * @param headerMapping - 表头与数据字段的映射
 * @param filename - 文件名
 */
export function exportSingleToCSV(
  data: Record<string, any>, 
  headers: string[], 
  headerMapping: Record<string, string>,
  filename: string
): void {
  if (!data) {
    console.warn('没有数据可导出')
    return
  }

  // 创建CSV内容
  const csvHeaders = headers.join(',')
  const csvRow = headers.map(header => {
    const key = Object.keys(headerMapping).find(k => headerMapping[k] === header)
    const value = key ? data[key] : ''
    return `"${String(value).replace(/"/g, '""')}"`
  }).join(',')

  const csvContent = `${csvHeaders}\n${csvRow}`

  // 创建Blob对象并下载
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadFile(blob, filename)
}

/**
 * 下载文件
 * @param blob - Blob对象
 * @param filename - 文件名
 */
function downloadFile(blob: Blob, filename: string): void {
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // 释放URL对象
  setTimeout(() => URL.revokeObjectURL(url), 100)
}