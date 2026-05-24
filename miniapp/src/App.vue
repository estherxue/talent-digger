<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  // 初始化 CloudBase 云开发
  if (wx.cloud) {
    wx.cloud.init({
      env: '__CLOUDBASE_ENV__'  // 如 'talent-digger-8grqda2hf'
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
</script>

<style>
page {
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  color: #333;
}
</style>
