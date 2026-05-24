# Talent Digger 部署脚本

## 数据库初始化

### 方式一：CLI 命令行

```bash
# 设置环境变量（CloudBase API 密钥在腾讯云控制台获取）
export TCB_ENV_ID=your-env-id
export TCB_SECRET_ID=your-secret-id
export TCB_SECRET_KEY=your-secret-key

# 运行导入
cd scripts
npm install
npm run init-db
```

### 方式二：控制台手动导入

1. 打开 [CloudBase 控制台](https://console.cloud.tencent.com/tcb)
2. 选择环境 → 数据库
3. 创建以下集合：
   - `users`, `tests`, `questions`, `results`
   - `career_library`, `career_plans`, `growth_plans`, `admin_users`
4. 逐个集合点击「导入」，选择 `miniapp/database/` 下的 JSON 文件

## 云函数部署

```bash
# 使用 CloudBase CLI
npm install -g @cloudbase/cli
tcb login
tcb fn deploy getTestList --envId your-env-id
tcb fn deploy getTestQuestions --envId your-env-id
tcb fn deploy submitTestResult --envId your-env-id
tcb fn deploy generateReport --envId your-env-id
```

或在 CloudBase 控制台 → 云函数 → 新建云函数，逐个上传 `miniapp/cloudfunctions/` 下的函数。
