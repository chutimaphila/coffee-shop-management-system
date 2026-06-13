<template>
  <q-page class="login-page">
    <div class="login-container">
      <div class="form-container">
        <div class="logo">
          <img src="../../public/logo/D-CoffeeLogo-Brown.png" alt="Logo" />
        </div>
        <h2 class="title">LOGIN</h2>
        <q-form @submit.prevent="onSubmit" @reset="onReset" class="q-gutter-md">
          <q-input
            filled
            v-model="email"
            label="Email"
            hint="Email"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please type something']"
            icon="email"
          />
          <q-input
            filled
            v-model="password"
            label="Password"
            type="password"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please type your password']"
            icon="lock"
          />
          <div>
            <q-btn label="Sign in" type="submit" color="primary" />
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
          </div>
        </q-form>
      </div>
      <div class="background-image"></div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { useUserStore } from 'src/stores/userStore'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const $q = useQuasar()
const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
// โหลดข้อมูลผู้ใช้
// ฟังก์ชันที่ใช้ในปุ่ม Submit
async function onSubmit() {
  console.log('Form submitted!')
  console.log('login', email.value)
  console.log('password', password.value)
  // ตรวจสอบว่ามีข้อมูลผู้ใช้หรือไม่ (โหลดข้อมูลจาก userStore)
  if (userStore.users.length === 0) {
    await userStore.getUsers() // โหลดข้อมูลผู้ใช้ถ้ายังไม่มีข้อมูล
  }

  // ตรวจสอบการล็อกอิน
  if (await authStore.login(email.value, password.value)) {
    // ค้นหาผู้ใช้ที่ล็อกอิน
    const loggedInUser = userStore.users.find((user) => user.email === email.value)

    if (loggedInUser) {
      const userRole = loggedInUser.role // ตรวจสอบ Role ของผู้ใช้
      console.log(loggedInUser)
      console.log('User Role:', userRole)

      $q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Login successful',
      })

      const redirectTo = route.query.redirect || '/dashboard'
      router.replace(redirectTo.toString())
    }
  } else {
    $q.notify({
      color: 'red-4',
      textColor: 'white',
      icon: 'error',
      message: 'Invalid email or password',
    })
  }
}

// โหลดข้อมูลผู้ใช้เมื่อหน้าโหลด
onMounted(async () => {
  authStore.init()
  console.log(userStore.users)
})

function onReset() {
  email.value = ''
  password.value = ''
}
</script>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: center;
  position: relative;
}

.form-container {
  background-color: #faf3e0; /* ทำให้ฟอร์มโปร่งใส */
  padding-top: 165px;
  padding-left: 30px;
  padding-right: 30px;
  height: 100%;
  width: 30%;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  position: absolute;
  right: 0;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 30%; /* เพิ่มให้ภาพพื้นหลังครอบคลุมฝั่งซ้าย */
  bottom: 0;
  background-image: url('../../public/background/backcoffee.png');
  background-size: cover;
  background-position: right;
  opacity: 1;
  z-index: 1;
}

.login-page {
  background-color: #0e0a02;
}

.title {
  text-align: center;
  margin-bottom: 20px;
  font-weight: bold;
  padding-bottom: 40px;
}

.q-btn.full-width {
  width: 100%;
}

.q-input {
  margin-bottom: 15px;
}

.q-input__control {
  font-size: 16px;
}

.logo img {
  width: 150px; /* ตั้งขนาดความกว้างของโลโก้ */
  height: auto; /* ให้สูงปรับอัตโนมัติตามอัตราส่วน */
  display: block;
  margin: 0 auto; /* จัดโลโก้ให้อยู่กลาง */
}
</style>
