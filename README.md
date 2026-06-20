# Scooter Rental System - Frontend

React 18 SPA 前端，提供滑板车租赁、支付、地图导航等功能。

## 技术栈

| 层 | 技术 |
|------|------|
| 框架 | React 18 + React Router 6 |
| UI 库 | Ant Design 5 + Bootstrap 5 |
| HTTP 客户端 | Axios |
| 地图 | Leaflet + React-Leaflet |
| 图表 | Chart.js + Recharts |
| 移动端 | Capacitor 7 (Android) |

## 快速启动

```bash
# 前置条件: Node.js 18+
npm install
npm start

# 开发地址: http://localhost:3000
# 后端 API 代理: localhost:8080
```

## 项目结构

```
src/
├── components/
│   ├── admin/          # 管理后台（仪表盘、滑板车管理、用户管理）
│   ├── auth/           # 登录/注册
│   ├── common/         # 地图、导航栏等公共组件
│   ├── feedback/       # 用户反馈
│   ├── payments/       # 支付
│   ├── rentals/        # 租赁管理
│   ├── scooters/       # 滑板车列表/详情/租赁
│   └── user/           # 个人中心
├── services/           # API 调用 (Axios)
├── contexts/           # React Context (Auth, Rental)
├── styles/             # CSS 样式
├── utils/              # 工具函数
├── config.js           # API 地址、配置常量
└── routes.jsx          # 路由配置
```

## 功能模块

- 用户注册/登录（JWT 认证）
- 滑板车浏览 + 地图定位
- 租赁管理（按小时/4小时/天/周）
- 在线支付 + 钱包充值
- 用户反馈系统
- 管理后台（统计仪表盘）
- 个人中心 + 租赁历史
