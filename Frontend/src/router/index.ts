import { defineRouter } from '#q-app/wrappers'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/authStore'

export default defineRouter(function () {
  // ตรวจสอบว่าใช้ server-side rendering หรือไม่
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // เพิ่มการตรวจสอบการล็อกอินก่อนที่ผู้ใช้จะเข้าถึงหน้า
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // ถ้า route นี้ต้องการการล็อกอินและผู้ใช้ยังไม่ได้ล็อกอิน
    if (to.meta.requiresAuth && !authStore.isLogin) {
      // รีไดเร็กต์ไปหน้า login และบันทึกหน้าเดิมที่ผู้ใช้พยายามเข้าถึง
      next({
        path: '/login',
        query: { redirect: to.fullPath }, // เก็บ URL ที่ผู้ใช้พยายามไป
      })
    } else {
      // ถ้าไม่ต้องการการล็อกอินหรือผู้ใช้ล็อกอินแล้ว ให้ไปที่หน้าอื่น
      next()
    }
  })

  return Router
})
