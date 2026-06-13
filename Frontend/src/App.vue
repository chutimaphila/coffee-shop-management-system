<template>
  <router-view />
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/authStore'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const authStore = useAuthStore()
authStore.init()
const router = useRouter()
onMounted(() => {
  if (!authStore.user) {
    router.push('/login')
  }
})
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Mali:wght@300;400;700&family=Nunito:wght@300;400;700&display=swap');

body {
  font-family: 'Mali', sans-serif;
}

/* ตัวอย่างการใช้ฟอนต์ `Nunito` กับบางส่วนของเว็บ */
.nunito-text {
  font-family: 'Nunito', sans-serif;
}
</style>
