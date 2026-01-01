# 物联网生鲜品储运系统

基于Vue 3 + TypeScript + Vite的物联网生鲜品储运监控系统，用于实时监控冷链运输设备的状态和环境参数。

## 项目特点

- **现代化技术栈**：使用Vue 3、TypeScript、Vite构建
- **响应式设计**：支持桌面端和移动端访问
- **实时监控**：通过WebSocket获取设备实时数据
- **数据可视化**：使用ECharts展示温度、湿度等关键指标
- **模块化架构**：清晰的组件和模块划分

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **构建工具**：Vite
- **状态管理**：Pinia
- **UI库**：Element Plus
- **图表库**：ECharts
- **HTTP客户端**：Axios
- **路由**：Vue Router 4

## 项目结构

```
src/
├── api/                    # API接口定义
│   ├── http.ts            # Axios实例配置
│   ├── dashboard.ts       # 仪表盘相关API
│   ├── device.ts          # 设备管理API
│   ├── user.ts            # 用户认证API
│   ├── control.ts         # 设备控制API
│   └── data.ts            # 数据查询API
├── assets/                # 静态资源
│   └── styles/            # 全局样式
├── components/            # 通用组件
│   ├── charts/            # 图表组件
│   └── device/            # 设备相关组件
├── composables/           # 组合式API
│   └── useWebSocket.ts    # WebSocket连接管理
├── directives/            # 自定义指令
├── router/                # 路由配置
├── store/                 # Pinia状态管理
├── types/                 # TypeScript类型定义
├── utils/                 # 工具函数
│   └── auth.ts            # 认证相关工具
├── views/                 # 页面组件
│   ├── dashboard/         # 仪表盘页面
│   ├── device/            # 设备管理页面
│   ├── control/           # 设备控制页面
│   ├── data/              # 数据查询页面
│   ├── alarm/             # 报警管理页面
│   ├── settings/          # 系统设置页面
│   └── login/             # 登录页面
└── App.vue                # 根组件
```

## 功能模块

### 1. 仪表盘 (Dashboard)
- 设备状态统计
- 实时数据展示
- 温度变化趋势图
- 报警信息汇总

### 2. 设备管理 (Device Management)
- 设备列表展示
- 设备详情查看
- 设备状态监控
- 设备搜索和筛选

### 3. 实时监控 (Real-time Monitoring)
- 温度、湿度、光照等环境参数
- 实时数据图表展示
- 设备状态指示

### 4. 设备控制 (Device Control)
- 远程设备控制
- 参数设置
- 控制历史记录

### 5. 报警管理 (Alarm Management)
- 报警信息列表
- 报警处理状态
- 报警统计分析

### 6. 数据查询 (Data Query)
- 历史数据查询
- 数据导出功能
- 统计报表

### 7. 系统设置 (System Settings)
- 个人设置
- 系统配置
- 主题切换

## API模块

### Dashboard API
- `getDashboardStatistics()` - 获取仪表盘统计数据

### Device API
- `getDeviceList()` - 获取设备列表
- `getDeviceDetail()` - 获取设备详情
- `getDeviceRealTimeData()` - 获取设备实时数据
- `getDeviceHistoryData()` - 获取设备历史数据
- `controlDevice()` - 控制设备

### Data API
- `getHistoryData()` - 获取历史数据
- `getDataStatistics()` - 获取数据统计
- `getTemperatureHistory()` - 获取温度历史数据
- `getHumidityHistory()` - 获取湿度历史数据
- `getLightHistory()` - 获取光照历史数据
- `exportData()` - 导出数据

### Alarm API
- `getAlarmList()` - 获取报警列表
- `getAlarmStatistics()` - 获取报警统计
- `handleAlarm()` - 处理报警
- `getAlarmDetail()` - 获取报警详情
- `getAlarmSettings()` - 获取报警设置
- `updateAlarmSettings()` - 更新报警设置

## 环境配置

### 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 类型检查
npm run type-check
```

### 环境变量
- `VITE_APP_BASE_API` - API基础URL
- `VITE_APP_TITLE` - 应用标题

## 项目特色

### WebSocket实时通信
使用WebSocket实现设备数据的实时推送，确保监控数据的实时性。

### 主题切换
支持亮色和暗色主题切换，提升用户体验。

### 响应式设计
适配不同屏幕尺寸，支持桌面端和移动端访问。

### 数据可视化
使用ECharts实现丰富的数据可视化，直观展示设备状态和环境参数。

### 权限管理
基于角色的权限控制，确保系统安全。

## 部署说明

1. 构建生产版本：`npm run build`
2. 将 `dist/` 目录部署到Web服务器
3. 配置API代理（如需要）

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)