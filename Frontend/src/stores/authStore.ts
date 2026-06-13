import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref } from 'vue'
import { useUserStore } from './userStore'
import { type User } from 'src/models'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const $q = useQuasar()
  const user = ref<User | null>(null) // 👈 ย้ายไว้ก่อน computed เพื่อให้ reactive
  const userStore = useUserStore()

  const isLogin = computed(() => {
    return user.value !== null
  })

  function saveUserToStorage() {
    $q.localStorage.set('user', user.value)
  }

  function loadUserFromStorage() {
    user.value = $q.localStorage.getItem('user')
  }

  function clearUserFromStorage() {
    $q.localStorage.remove('user')
  }

  function login(email: string, password: string): boolean {
    const u = userStore.getUserByEmail(email)
    if (u && u.password === password) {
      user.value = { ...u, password: '' }
      saveUserToStorage()
      return true
    }
    return false
  }

  function logout() {
    router.replace({ path: '/login' })
    clearUserFromStorage()
    user.value = null
  }

  // ✅ เพิ่ม init() เพื่อให้เรียก load เมื่อ component เริ่มต้น
  function init() {
    loadUserFromStorage()
  }

  // ดึง roleId เมื่อมีการ login
  const getRoleId = computed(() => {
    return user.value?.roleId || null
  })

  return { login, isLogin, logout, user, init, getRoleId }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
