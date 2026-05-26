// 应用配置文件
// 所有敏感信息应从 .env 环境变量注入
// .env 文件不会提交到 git，请参考 .env.example 创建
//
// Vite 构建时会将 import.meta.env.VITE_* 替换为静态值

export const config = {
  // CloudBase 云开发环境 ID
  cloudbaseEnv: import.meta.env.VITE_CLOUDBASE_ENV || '',

  // 微信小程序 AppID
  wechatAppId: import.meta.env.VITE_WECHAT_APPID || '',
}
