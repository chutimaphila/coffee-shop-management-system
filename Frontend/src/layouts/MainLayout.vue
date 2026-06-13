<template>
  <q-layout view="hHh LpR lFf">
    <q-header elevated class="bg-primary full-width-header">
      <q-toolbar class="header-font">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer">
          <template>
            <div>
              <q-list>
                <!-- Use the filteredLinksList computed property -->
                <q-item
                  v-for="(link, index) in filteredLinksList"
                  :key="index"
                  to="link.link"
                  class="menu-item"
                >
                  <q-item-section>
                    <q-avatar size="30px">
                      <q-icon :name="link.icon" class="q-icon" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section class="link-title">
                    {{ link.title }}
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </template>
        </q-btn>

        <q-toolbar-title class="header-font">
          <q-avatar size="60px" icon="coffee"></q-avatar>
          D.Coffee
        </q-toolbar-title>

        <div class="row items-center">
          <q-avatar>
            <q-img :src="'http://localhost:3000' + currentUser?.imageUrl"></q-img>
          </q-avatar>

          <div class="q-ml-sm">
            <div>{{ currentUser?.name }}</div>
            <q-tooltip>Email:{{ currentUser?.email }} Role:{{ currentUser?.role?.name }}</q-tooltip>
          </div>
          <q-space />
          <q-btn icon="logout" @click="authStore.logout()" class="q-ml-md" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above class="custom-drawer" :width="200">
      <q-list>
        <!-- Use the filteredLinksList computed property -->
        <EssentialLink
          v-for="link in filteredLinksList"
          :key="link.title"
          v-bind="link"
          :class="{ 'active-menu': $route.path === link.link }"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue'
import { useAuthStore } from 'src/stores/authStore'

const authStore = useAuthStore()
const linksList: EssentialLinkProps[] = [
  {
    title: 'Dashboard',
    icon: 'fa-solid fa-house',
    link: '/dashboard',
  },
  {
    title: 'Pos',
    icon: 'fa-solid fa-cash-register',
    link: '/pos',
  },
  {
    title: 'Product',
    icon: 'fa-solid fa-mug-saucer',
    link: '/product-page',
  },
  {
    title: 'User',
    icon: 'fa-solid fa-users',
    link: '/user-page',
  },
  {
    title: 'Employee',
    icon: 'fa-solid fa-user-tie',
    link: '/emp-page',
  },
  {
    title: 'Customer',
    icon: 'fa-solid fa-users-viewfinder',
    link: '/customer-page',
  },
  {
    title: 'Order',
    icon: 'fa-solid fa-receipt',
    link: '/order-page',
  },
  {
    title: 'Expense',
    icon: 'fa-solid fa-file-invoice-dollar',
    link: '/expense-page',
  },
  {
    title: 'Promotion',
    icon: 'fa-regular fa-calendar',
    link: '/promotion-page',
  },
  {
    title: 'Branch',
    icon: 'fa-solid fa-store',
    link: '/branch-page',
  },
  {
    title: 'Stock',
    icon: 'fa-solid fa-box',
    link: '/stock-page',
  },
]

const currentUser = authStore.user // ดึงข้อมูล user จาก authStore

const leftDrawerOpen = ref(false)

// Use a computed property to filter the links
const filteredLinksList = computed(() => {
  if (currentUser?.role?.name === 'User' || currentUser?.role?.name === 'Admin') {
    // Return a filtered list that excludes 'Branch' and 'Express' for users
    return linksList.filter((link) => link.title !== 'Branch') //&& link.title !== 'Dashboard')
  }
  return linksList
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped>
.full-width-header {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000; /* ให้ Header อยู่ด้านบนสุด */
}

.header-font {
  font-family: 'Nunito';
  font-size: 25px;
  font-weight: 700;
  color: #faf3e0;
}

.menu-item {
  background-color: #8d6e63; /* สีพื้นหลังของเมนู */
  color: #faf3e0; /* สีฟอนต์ของเมนู */
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background-color: #3e2726; /* สีพื้นหลังเมื่อ hover */
}

.menu-icon {
  color: #faf3e0; /* สีของไอคอน */
}

.link-title {
  font-family: 'Nunito';
  font-size: 20px;
  font-weight: 700;
}
::v-deep(.custom-drawer) {
  background-color: #8d6e63 !important; /* บังคับให้ Sidebar เป็นสีน้ำตาล */
  color: #faf3e0; /* สีฟอนต์ของเมนู */
  font-family: 'Nunito';
  font-size: 17px;
  font-weight: 600;
}
/* เปลี่ยนสีของเมนูที่กำลังเปิดอยู่ */
.active-menu {
  background-color: rgba(255, 255, 255, 0.25) !important; /* พื้นหลังขาวจางๆ */
  color: #faf3e0; /* สีฟอนต์ของเมนู */
}
</style>
