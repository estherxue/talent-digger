// 应用配置文件
// 所有密钥和敏感信息应从环境变量注入，此处仅作为本地开发默认值
// 生产部署时请通过 CI/CD 环境变量覆盖

export const config = {
  // CloudBase 云开发环境 ID
  // 构建时通过 VITE_CLOUDBASE_ENV 环境变量注入，本地开发使用 .env 文件
  cloudbaseEnv: process.env.VITE_CLOUDBASE_ENV || '',

  // 微信小程序 AppID（用于 project.config.json 等）
  wechatAppId: process.env.VITE_WECHAT_APPID || '',
}
