import { useAuthStore } from 'src/stores/authStore'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login', // ให้หน้าเริ่มต้นไปที่หน้า Login
  },
  {
    path: '/login',
    component: () => import('layouts/FullScreen.vue'),
    children: [{ path: '', name: 'LoginPage', component: () => import('pages/LoginPage.vue') }],
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'DashboardPage', component: () => import('src/pages/DashboardPage.vue') },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/pos',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'PosPage', component: () => import('pages/POSPage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/product-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'ProductPage', component: () => import('pages/ProductPage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/user-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'UserPage', component: () => import('pages/UserPage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/role-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'RolePage', component: () => import('pages/RolePage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/emp-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'EmployeePage', component: () => import('pages/EmployeePage.vue') },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/expense-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'ExpensePage', component: () => import('pages/ExpensePage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/customer-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'CustomerPage', component: () => import('pages/CustomerPage.vue') },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/promotion-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'PromotionPage', component: () => import('pages/PromotionPage.vue') },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/branch-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'branchPage', component: () => import('pages/branchPage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/stock-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'StockPage', component: () => import('pages/StockPage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/route-page/:id/:name',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'RoutePage', component: () => import('pages/RoutePage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/order-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'OrderPage', component: () => import('pages/OrderPage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/salary-check',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'SalaryCheck',
        component: () => import('src/components/EmployeeComponent/SalaryCheckSection.vue'),
      },
    ],
    meta: { requiresAuth: true },
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isLogin // เช็คว่า user ล็อกอินหรือยัง
  const userRole = authStore.user?.role // ดึงบทบาทของผู้ใช้จาก store

  // ตรวจสอบว่าเส้นทางต้องการการล็อกอินหรือไม่
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login') // ถ้ายังไม่ล็อกอินให้ไปที่หน้า login
  } else if (to.meta.role && to.meta.role !== userRole) {
    next('/home') // ถ้าไม่มีสิทธิ์เข้าถึง ให้ไปหน้า home
  } else {
    next() // ถ้าผ่านการตรวจสอบแล้ว ให้ไปหน้าต่อไป
  }
})

export default routes
