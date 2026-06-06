<script setup lang="ts">
import { onLaunch, onShow, onHide, onError, onUnhandledRejection } from '@dcloudio/uni-app'
import { config } from '@/config'
import { reportError } from '@/utils/devLogger'

onLaunch(() => {
  // 初始化 CloudBase 云开发
  if (wx.cloud) {
    wx.cloud.init({
      env: config.cloudbaseEnv
    })
    console.log('CloudBase initialized')
  }
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})

// 开发环境错误日志桥接：将小程序运行时错误发送到本地日志服务
onError((err: any) => {
  reportError('onError', err)
})

onUnhandledRejection((res: any) => {
  reportError('unhandledRejection', res?.reason || res)
})
</script>

<style>
page {
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  color: #333;
}
</style>
