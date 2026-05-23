import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userId = ref('')
  const nickname = ref('')
  const avatar = ref('')
  const isLogin = computed(() => !!userId.value)
  const isGuest = ref(true)

  function login(id: string, name: string, av: string) {
    userId.value = id
    nickname.value = name
    avatar.value = av
    isGuest.value = false
    // 持久化存储
    uni.setStorageSync('userInfo', { id, name, av })
  }

  function loginAsGuest() {
    isGuest.value = true
    nickname.value = '游客用户'
  }

  function logout() {
    userId.value = ''
    nickname.value = ''
    avatar.value = ''
    isGuest.value = true
    uni.removeStorageSync('userInfo')
  }

  function loadFromStorage() {
    const stored = uni.getStorageSync('userInfo')
    if (stored) {
      userId.value = stored.id
      nickname.value = stored.name
      avatar.value = stored.av
      isGuest.value = false
    }
  }

  return { userId, nickname, avatar, isLogin, isGuest, login, loginAsGuest, logout, loadFromStorage }
})
