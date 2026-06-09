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
  background-color: #F5F3FF;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  color: #1E1B4B;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Smooth scrolling for scroll-views */
::-webkit-scrollbar {
  width: 0;
  height: 0;
}

/* Theme transition for all elements */
view, text, button, image, input, textarea {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
</style>
