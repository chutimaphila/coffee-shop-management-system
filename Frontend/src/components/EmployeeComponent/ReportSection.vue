<template>
  <q-page padding class="custom-page">
    <!-- แท็บเลือกประเภทการแสดงผล -->
    <div class="row q-mb-md">
      <q-tabs v-model="selectedTab" dense class="tab-container">
        <q-tab name="individual" label="รายบุคคล" v-if="canViewIndividual" />
        <q-tab name="branch" label="สาขา" v-if="canViewBranch" />
        <q-tab name="all" label="ทั้งหมด" v-if="canViewAll" />
      </q-tabs>
    </div>

    <!-- เนื้อหาแต่ละแท็บ -->
    <q-tab-panels v-model="selectedTab" animated class="tab-panels">
      <!-- รายงานรายบุคคล -->
      <q-tab-panel name="individual" v-if="isUser || isAdmin || isOwner">
        <div class="text-h6 q-mb-md">รายงานรายบุคคล</div>
        <q-select
          filled
          v-model="selectedEmployee"
          :options="employeeOptions"
          option-label="fullName"
          option-value="id"
          label="เลือกพนักงาน"
          style="width: 250px"
          clearable
          emit-value
          map-options
        />
        <!-- แถวที่ 1 -->
        <div class="row q-col-gutter-md q-mt-md">
          <q-card class="q-pa-md col-12">
            <div>
              <AttChartEmp :selected-employee-id="selectedEmployee" />
            </div>
          </q-card>
        </div>
        <!-- แถวที่ 2 -->
        <div class="row q-col-gutter-md q-mt-md">
          <q-card class="q-pa-md col-12">
            <div>
              <AttChartEmpYear :selected-employee-id="selectedEmployee" />
            </div>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- รายงานสาขา -->
      <q-tab-panel name="branch" v-if="isOwner || isAdmin">
        <div class="text-h6 q-mb-md">รายงานสาขา</div>
        <!-- แถวที่ 1 -->
        <div class="row q-col-gutter-md q-mt-md">
          <q-card class="q-pa-md col-12">
            <div>
              <AttChartBranchMonth :selected-employee-id="selectedEmployee" />
            </div>
          </q-card>
        </div>

        <!-- แถวที่ 2 -->
        <div class="row q-col-gutter-md q-mt-md">
          <q-card class="q-pa-md col-12">
            <div>
              <AttChartBranchYear :selected-employee-id="selectedEmployee" />
            </div>
          </q-card>
        </div>
      </q-tab-panel>

      <!-- รายงานทั้งหมด -->
      <q-tab-panel name="all" v-if="isOwner">
        <div class="text-h6 q-mb-md">รายงานทั้งหมด</div>

        <!-- แถวที่ 1 -->
        <div class="row q-col-gutter-md q-mt-md">
          <q-card class="q-pa-md col-12">
            <div>
              <AttChartBranchAllMonth :selected-employee-id="selectedEmployee" />
            </div>
          </q-card>
        </div>

        <!-- แถวที่ 2 -->
        <div class="row q-col-gutter-md q-mt-md">
          <q-card class="q-pa-md col-12">
            <div>
              <AttChartBranchAllYear :selected-employee-id="selectedEmployee" />
            </div>
          </q-card>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import AttChartEmp from './AttChartEmp.vue'
import { useEmployeeStore } from 'src/stores/empStore'
import type { Employee } from 'src/models'
import AttChartEmpYear from './AttChartEmpYear.vue'
import AttChartBranchMonth from './AttChartBranchMonth.vue'
import AttChartBranchYear from './AttChartBranchYear.vue'
import AttChartBranchAllMonth from './AttChartBranchAllMonth.vue'

const authStore = useAuthStore()
const currentUser = computed(() => authStore.user) // Get user from authStore

// แท็บที่เลือกปัจจุบัน
const selectedTab = ref('individual')
const selectedEmployee = ref(null)
const employeeStore = useEmployeeStore()
// การคำนวณสิทธิ์
const isOwner = computed(() => authStore.user?.role?.name === 'Owner')
const isAdmin = computed(() => authStore.user?.role?.name === 'Admin')
const isUser = computed(() => authStore.user?.role?.name === 'User')

// การควบคุมการมองเห็นแท็บ
const canViewIndividual = computed(() => {
  return (
    currentUser.value?.role?.name === 'Owner' ||
    currentUser.value?.role?.name === 'Admin' ||
    currentUser.value?.role?.name === 'User'
  )
})
const canViewBranch = computed(() => {
  return currentUser.value?.role?.name === 'Owner' || currentUser.value?.role?.name === 'Admin'
})
const canViewAll = computed(() => {
  return currentUser.value?.role?.name === 'Owner' || currentUser.value?.role?.name === 'Admin'
})

const employeeOptions = ref<{ id: number; fullName: string }[]>([])

onMounted(async () => {
  await employeeStore.getEmps() // หรือชื่อเมธอดตามที่แพรวาใช้
  console.log('currentUser.branchid', currentUser.value?.branch?.id)

  const role = currentUser.value?.role?.name
  const currentBranchId = currentUser.value?.branch?.id
  const currentUserId = currentUser.value?.id

  // เงื่อนไขกรองรายชื่อพนักงาน
  let filteredEmployees: Employee[] = []

  if (role === 'Owner') {
    // Owner เห็นพนักงานทุกคน
    filteredEmployees = employeeStore.employees
  } else if (role === 'Admin') {
    // Admin เห็นเฉพาะพนักงานในสาขาเดียวกัน
    filteredEmployees = employeeStore.employees.filter((emp) => emp.branch_id === currentBranchId)
  } else if (role === 'User') {
    // User เห็นเฉพาะตัวเอง
    filteredEmployees = employeeStore.employees.filter((emp) => emp.user_id === currentUserId)
  }

  // map ข้อมูลสำหรับ q-select
  employeeOptions.value = filteredEmployees.map((emp) => ({
    id: emp.id,
    fullName: `${emp.name} ${emp.surname}`,
  }))
})
</script>

<style scoped>
.custom-page {
  max-width: 1200px;
  margin: 0 auto;
}

.tab-container {
  width: 100%;
  border-bottom: 1px solid #eee;
}

.tab-panels {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-height: 300px;
}
.q-card {
  margin-bottom: 16px;
}
</style>
