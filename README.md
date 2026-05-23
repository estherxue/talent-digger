# Talent Digger - 天赋发现与职业规划小程序

Talent Digger 帮助用户发现自己的天赋、兴趣和价值观，为职业选择提供科学参考。

## 项目结构

```
talent-digger/
├── miniapp/          # uni-app + Vue 3 小程序前端
├── admin/            # Vite + Vue 3 + Element Plus 管理后台
├── shared/           # 共享类型定义和常量
└── pnpm-workspace.yaml
```

## 技术栈

- **小程序**: uni-app + Vue 3 + Vite + Pinia
- **管理后台**: Vite + Vue 3 + Element Plus
- **后端**: 腾讯云开发 CloudBase（云函数 + 云数据库）
- **图表**: ECharts

## 启动

```bash
# 安装依赖
pnpm install

# 启动小程序开发
pnpm dev:miniapp

# 启动管理后台开发
pnpm dev:admin
```
