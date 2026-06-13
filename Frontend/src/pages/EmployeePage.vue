<template>
  <q-page padding class="employee-page">
    <!-- SECTION ด้านบน -->
    <div class="row q-mb-md">
      <q-tabs v-model="selectedSection" dense class="tab-container">
        <!-- ใช้ v-if เพื่อแสดงเฉพาะแท็บที่ผู้ใช้มีสิทธิ์เข้าถึง -->
        <q-tab v-if="authStore.isLogin" name="employee" label="รายชื่อพนักงาน" />
        <q-tab v-if="authStore.isLogin" name="attendance" label="เข้า-ออกงาน" />
        <q-tab v-if="authStore.isLogin" name="report" label="รายงาน" />
        <q-tab
          v-if="authStore.user?.role?.id === 1 || authStore.user?.role?.id === 2"
          name="salary"
          label="จ่ายเงินพนักงาน"
        />
        <q-tab v-if="authStore.isLogin" name="salaryCheck" label="เช็คเงินเดือนพนักงาน" />
        <q-tab v-if="authStore.isLogin" name="branchSalaryReport" label="รายงานเงินเดือนสาขา" />
      </q-tabs>
    </div>
    <q-tab-panels v-model="selectedSection" class="tab-panels">
      <q-tab-panel name="employee" v-if="authStore.isLogin">
        <EmployeeSection />
      </q-tab-panel>
      <q-tab-panel name="attendance" v-if="authStore.isLogin">
        <AttendanceSection />
      </q-tab-panel>
      <q-tab-panel
        name="branchSalaryReport"
        v-if="authStore.user?.role?.id === 1 || authStore.user?.role?.id === 2"
      >
        <BranchSalaryReport />
      </q-tab-panel>
      <q-tab-panel
        name="salary"
        v-if="authStore.user?.role?.id === 1 || authStore.user?.role?.id === 2"
      >
        <SalarySection />
      </q-tab-panel>
      <q-tab-panel name="salaryCheck" v-if="authStore.isLogin">
        <SalaryCheckSection />
      </q-tab-panel>
      <q-tab-panel
        name="report"
        v-if="authStore.user?.role?.id === 1 || authStore.user?.role?.id === 2"
      >
        <ReportSection />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AttendanceSection from 'components/EmployeeComponent/AttendanceSection.vue'
import SalarySection from 'components/EmployeeComponent/SalarySection.vue'
import SalaryCheckSection from 'components/EmployeeComponent/SalaryCheckSection.vue'
import ReportSection from 'components/EmployeeComponent/ReportSection.vue'
import BranchSalaryReport from 'components/EmployeeComponent/BranchSalaryReport.vue'
import EmployeeSection from 'components/EmployeeComponent/EmployeeSection.vue'
import { useAuthStore } from 'src/stores/authStore'

const selectedSection = ref('attendance') // ค่าที่เลือกใน Toggle
const authStore = useAuthStore() // ใช้ authStore ที่มีอยู่
</script>
<style>
.employee-page {
  background-color: #faf3e0;
}
/* SECTION ด้านบน */
.tab-container {
  background-color: rgba(255, 255, 255, 0.6);
  color: #3e2726;
}
/* ปรับสไตล์ตัวอักษรของแต่ละแท็บ */
.q-tab__label {
  font-size: 15px !important;
  font-weight: bold !important;
}
.tab-panels {
  width: 100%;
  max-width: 100%;
  background-color: transparent;
}
</style>
