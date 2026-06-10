import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userId = ref('')
  const openid = ref('')
  const nickname = ref('')
  const avatar = ref('')
  const isLogin = computed(() => !!userId.value)
  const isGuest = ref(true)

  /** 微信授权登录（openid 模式，不依赖已废弃的 getUserInfo/getUserProfile API） */
  async function loginByWechat() {
    try {
      const loginRes = await wx.login()
      if (!loginRes.code) {
        throw new Error('获取登录凭证失败')
      }

      const res = await wx.cloud.callFunction({
        name: 'userLogin',
        data: { code: loginRes.code }
      })

      const result = res.result as any
      if (result.code === 0 && result.data) {
        userId.value = result.data.userId
        openid.value = result.data.openid
        nickname.value = result.data.nickname || '微信用户'
        avatar.value = result.data.avatar || ''
        isGuest.value = false
        persistUser()
        return { success: true }
      }
      return { success: false }
    } catch (err: any) {
      console.error('微信登录失败:', err)
      wx.showToast({ title: err.message || '登录失败', icon: 'none' })
      return { success: false }
    }
  }

  /** 游客模式登录 */
  function loginAsGuest() {
    isGuest.value = true
    nickname.value = '游客用户'
    userId.value = `guest_${Date.now()}`
  }

  /** 退出登录 */
  function logout() {
    userId.value = ''
    openid.value = ''
    nickname.value = ''
    avatar.value = ''
    isGuest.value = true
    uni.removeStorageSync('userInfo')
  }

  /** 从本地存储恢复登录状态 */
  function loadFromStorage() {
    const stored = uni.getStorageSync('userInfo')
    if (stored) {
      userId.value = stored.id
      openid.value = stored.openid || ''
      nickname.value = stored.name
      avatar.value = stored.av
      isGuest.value = stored.guest === true
    }
  }

  /** 持久化到本地存储 */
  function persistUser() {
    uni.setStorageSync('userInfo', {
      id: userId.value,
      openid: openid.value,
      name: nickname.value,
      av: avatar.value,
      guest: isGuest.value
    })
  }

  return {
    userId,
    openid,
    nickname,
    avatar,
    isLogin,
    isGuest,
    loginByWechat,
    loginAsGuest,
    logout,
    loadFromStorage
  }
})
