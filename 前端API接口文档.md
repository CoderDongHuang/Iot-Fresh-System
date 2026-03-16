# 前端API接口文档

## 1. 项目概述

本项目是一个物联网设备管理系统前端，基于Vue 3 + TypeScript + Element Plus开发，主要功能包括设备管理、实时监控、数据查询、报警处理等。

## 2. 基础配置

### 2.1 API基础路径
```javascript
const BASE_URL = 'http://localhost:8080/api'
```

### 2.2 响应数据格式
前端支持两种响应格式：

**格式一：标准包装格式**
```javascript
{
  "code": 200,
  "msg": "操作成功",
  "data": {}
}
```

**格式二：直接数据格式**
```javascript
{
  "list": [],
  "total": 100
}
```

## 3. 设备管理接口

### 3.1 获取设备列表

**接口路径**
```
GET /api/device/list
```

**请求参数**
```javascript
{
  "pageNum": 1,        // 页码
  "pageSize": 10,      // 每页数量
  "keyword": "",       // 搜索关键词（设备名称/VID）
  "status": "1"        // 状态筛选：1=在线, 0=离线, 2=故障, 3=维护
}
```

**响应数据格式**
```javascript
{
  "list": [
    {
      "vid": "device001",
      "device_name": "存储设备001",      // 或 deviceName
      "device_type": "storage",          // 或 deviceType
      "status": 1,                        // 1=在线, 0=离线, 2=故障, 3=维护
      "location": "A区仓库",
      "contact_phone": "13800138000",    // 或 contactPhone
      "description": "设备描述",
      "manufacturer": "海康威视",
      "model": "DS-2CD3T45D-I5",
      "firmware_version": "V1.0.0",      // 或 firmwareVersion
      "last_heartbeat": "2024-01-15 10:30:25",  // 或 lastHeartbeat
      "last_online_time": "2024-01-15 10:30:25", // 或 lastOnlineTime
      "created_at": "2024-01-01 08:00:00" // 或 createTime
    }
  ],
  "total": 31
}
```

### 3.2 获取设备详情

**接口路径**
```
GET /api/device/detail/{vid}
```

**响应数据格式**
```javascript
{
  "vid": "device001",
  "device_name": "存储设备001",
  "device_type": "storage",
  "status": 1,
  "location": "A区仓库",
  "contact_phone": "13800138000",
  "description": "设备描述",
  "manufacturer": "海康威视",
  "model": "DS-2CD3T45D-I5",
  "firmware_version": "V1.0.0",
  "last_heartbeat": "2024-01-15 10:30:25",
  "last_online_time": "2024-01-15 10:30:25",
  "created_at": "2024-01-01 08:00:00"
}
```

### 3.3 新增设备

**接口路径**
```
POST /api/device/add
```

**请求数据格式**
```javascript
{
  "vid": "device032",          // 设备VID（唯一标识）
  "device_name": "新设备032",    // 设备名称
  "device_type": "storage",      // 设备类型
  "location": "B区仓库",        // 设备位置
  "contact_phone": "13800138000", // 联系电话
  "description": "新增设备",     // 设备描述
  "manufacturer": "海康威视",    // 制造商
  "model": "DS-2CD3T45D-I5",    // 型号
  "firmware_version": "V1.0.0"  // 固件版本
}
```

### 3.4 获取设备状态统计

**接口路径**
```
GET /api/device/status-stats
```

**响应数据格式**
```javascript
{
  "online": 25,        // 在线设备数量
  "offline": 4,        // 离线设备数量
  "fault": 2,          // 故障设备数量
  "maintenance": 0     // 维护设备数量
}
```

## 4. 设备数据接口

### 4.1 获取设备实时数据

**接口路径**
```
GET /api/device/real-time-data/{vid}
```

**响应数据格式**
```javascript
{
  "vid": "device001",
  "tin": 25.5,         // 内部温度
  "tout": 20.1,        // 外部温度
  "hin": 68,           // 内部湿度
  "hout": 62,          // 外部湿度
  "lxin": 350,         // 内部光照
  "lxout": 280,        // 外部光照
  "brightness": 80,    // 亮度
  "v_status": 1,       // 设备状态
  "timestamp": "2024-01-15 10:30:25"
}
```

### 4.2 获取所有设备实时数据

**接口路径**
```
GET /api/device/real-time-data
```

**响应数据格式**
```javascript
[
  {
    "vid": "device001",
    "tin": 25.5,
    "tout": 20.1,
    "hin": 68,
    "hout": 62,
    "lxin": 350,
    "lxout": 280,
    "brightness": 80,
    "v_status": 1,
    "timestamp": "2024-01-15 10:30:25"
  }
]
```

### 4.3 获取设备历史数据

**接口路径**
```
GET /api/device/{vid}/history-data
```

**请求参数**
```javascript
{
  "pageNum": 1,        // 页码
  "pageSize": 100,     // 每页数量
  "startTime": "2024-01-15 00:00:00",  // 开始时间
  "endTime": "2024-01-15 23:59:59",    // 结束时间
  "timeRange": "1h"    // 时间范围：1h, 6h, 24h, 7d
}
```

**响应数据格式**
```javascript
{
  "list": [
    {
      "vid": "device001",
      "tin": 25.5,
      "tout": 20.1,
      "hin": 68,
      "hout": 62,
      "lxin": 350,
      "lxout": 280,
      "brightness": 80,
      "v_status": 1,
      "timestamp": "2024-01-15 10:30:25"
    }
  ],
  "total": 1000
}
```

### 4.4 控制设备

**接口路径**
```
POST /api/device/control/{vid}
```

**请求数据格式**
```javascript
{
  "commandType": "temperature",  // 命令类型：temperature, light, fan, global
  "data": {
    "tin": 25,        // 内部温度设置
    "tout": 20,       // 外部温度设置
    "hin": 65,        // 内部湿度设置
    "hout": 60,       // 外部湿度设置
    "lxin": 300,      // 内部光照设置
    "lxout": 250,     // 外部光照设置
    "brightness": 75  // 亮度设置
  }
}
```

## 5. 仪表盘接口

### 5.1 获取仪表盘统计数据

**接口路径**
```
GET /api/dashboard/statistics
```

**响应数据格式**
```javascript
{
  "onlineDevices": 25,
  "totalDevices": 31,
  "todayData": 0,
  "dataGrowth": 0,
  "unresolvedAlarms": 0,
  "todayAlarms": 0,
  "alarmCount": 0,
  "alarmTrend": 0,
  "systemStatus": "正常",
  "cpuUsage": 0,
  "deviceStatusDistribution": {
    "online": 25,      // 在线设备数量
    "offline": 4,      // 离线设备数量
    "fault": 2,        // 故障设备数量
    "maintenance": 0   // 维护设备数量
  },
  "recentAlarms": [
    {
      "id": 1,
      "deviceName": "存储设备001",
      "alarmType": "温度异常",
      "alarmLevel": "high",
      "timestamp": "2024-01-15 10:30:25",
      "status": "active"
    }
  ]
}
```

### 5.2 获取设备状态分布

**接口路径**
```
GET /api/dashboard/device-status-distribution
```

**响应数据格式**
```javascript
{
  "online": 25,
  "offline": 4,
  "fault": 2,
  "maintenance": 0
}
```

### 5.3 获取最近报警信息

**接口路径**
```
GET /api/dashboard/recent-alarms
```

**响应数据格式**
```javascript
[
  {
    "id": 1,
    "deviceName": "存储设备001",
    "alarmType": "温度异常",
    "alarmLevel": "high",
    "timestamp": "2024-01-15 10:30:25",
    "status": "active"
  }
]
```

## 6. 报警管理接口

### 6.1 获取报警列表

**接口路径**
```
GET /api/alarm/list
```

**请求参数**
```javascript
{
  "pageNum": 1,
  "pageSize": 10,
  "status": "active",     // 报警状态：active, resolved, closed
  "alarmLevel": "high",   // 报警级别：high, medium, low
  "startTime": "2024-01-15 00:00:00",
  "endTime": "2024-01-15 23:59:59"
}
```

**响应数据格式**
```javascript
{
  "list": [
    {
      "id": 1,
      "vid": "device001",
      "deviceName": "存储设备001",
      "alarmType": "温度异常",
      "alarmLevel": "high",
      "alarmMessage": "内部温度超过阈值",
      "alarmData": "{\"temperature\": 35.5}",
      "resolved": false,
      "resolvedTime": null,
      "resolvedBy": null,
      "createTime": "2024-01-15 10:30:25"
    }
  ],
  "total": 100
}
```

### 6.2 处理报警

**接口路径**
```
POST /api/alarm/{id}/handle
```

**请求数据格式**
```javascript
{
  "resolved": true,        // 是否已处理
  "resolvedBy": "admin",   // 处理人
  "remark": "已处理完成"   // 处理备注
}
```

### 6.3 获取报警统计

**接口路径**
```
GET /api/alarm/statistics
```

**响应数据格式**
```javascript
{
  "high": 0,       // 紧急报警数量
  "medium": 0,     // 重要报警数量
  "low": 0,        // 一般报警数量
  "critical": 0   // 严重报警数量
}
```

## 7. 数据查询接口

### 7.1 获取历史数据

**接口路径**
```
GET /api/data/history
```

**请求参数**
```javascript
{
  "pageNum": 1,
  "pageSize": 100,
  "vid": "device001",
  "startTime": "2024-01-15 00:00:00",
  "endTime": "2024-01-15 23:59:59",
  "timeRange": "1h"
}
```

**响应数据格式**
```javascript
{
  "list": [
    {
      "vid": "device001",
      "tin": 25.5,
      "tout": 20.1,
      "hin": 68,
      "hout": 62,
      "lxin": 350,
      "lxout": 280,
      "brightness": 80,
      "v_status": 1,
      "timestamp": "2024-01-15 10:30:25"
    }
  ],
  "total": 1000
}
```

## 8. 字段映射说明

### 8.1 设备状态映射
```javascript
{
  1: { text: '在线', type: 'success' },
  0: { text: '离线', type: 'info' },
  2: { text: '故障', type: 'danger' },
  3: { text: '维护', type: 'warning' }
}
```

### 8.2 报警级别映射
```javascript
{
  'critical': { text: '严重', color: '#F56C6C' },
  'high': { text: '紧急', color: '#E6A23C' },
  'medium': { text: '重要', color: '#409EFF' },
  'low': { text: '一般', color: '#67C23A' }
}
```

### 8.3 设备类型映射
```javascript
{
  'storage': '存储设备',
  'transport': '运输设备',
  'display': '展示设备',
  'processing': '加工设备',
  'quality': '质检设备',
  'monitoring': '监控设备',
  'warehouse': '仓储设备',
  'temperature': '温控设备',
  'humidity': '湿度设备',
  'light': '光照设备',
  'control': '控制设备',
  'other': '其他设备'
}
```

## 9. 前端数据标准化

前端会对后端返回的数据进行标准化处理，支持多种字段名格式：

```javascript
// 设备数据标准化
const normalizedList = resultData.list.map((device: any) => ({
  ...device,
  vid: device.vid,
  deviceName: device.device_name || device.deviceName,
  deviceType: device.device_type || device.deviceType,
  status: device.status,
  location: device.location,
  description: device.description,
  manufacturer: device.manufacturer,
  model: device.model,
  firmwareVersion: device.firmware_version || device.firmwareVersion,
  ipAddress: device.ip_address || device.ipAddress,
  macAddress: device.mac_address || device.macAddress,
  lastOnlineTime: device.last_online_time || device.lastOnlineTime,
  lastHeartbeat: device.last_heartbeat || device.lastHeartbeat || device.last_online_time || device.lastOnlineTime,
  contactPhone: device.contact_phone || device.contactPhone,
  createdAt: device.created_at || device.createTime
}))
```

## 10. 注意事项

1. **字段名兼容性**：前端支持数据库字段名（下划线格式）和驼峰格式字段名
2. **时间格式**：所有时间字段使用字符串格式，如 "2024-01-15 10:30:25"
3. **状态值**：设备状态使用数字（1=在线, 0=离线, 2=故障, 3=维护）
4. **报警级别**：报警级别使用字符串（high, medium, low, critical）
5. **分页参数**：所有列表接口都支持分页参数 pageNum 和 pageSize

此文档基于当前前端代码编写，后端实现时需要按照此格式返回数据。