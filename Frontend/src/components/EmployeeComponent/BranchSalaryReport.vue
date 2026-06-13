<template>
  <q-page padding>
    <div v-if="isLoading" class="q-pa-md">กำลังโหลดข้อมูล...</div>
    <div v-else>
      <div class="section-header q-mb-md">
        <h4 class="q-ma-none">รายงานเงินเดือนตามสาขา</h4>
      </div>

      <!-- การเลือกสาขาและมุมมอง -->
      <div class="filter-row q-mb-md">
        <q-select
          v-if="isOwner"
          v-model="selectedBranch"
          :options="visibleBranchOptions"
          label="เลือกสาขา"
          filled
          class="branch-select"
        />

        <q-btn-toggle
          v-model="selectedView"
          :options="[
            { label: 'รายเดือน', value: 'monthly' },
            { label: 'รายปี', value: 'yearly' },
          ]"
          spread
          unelevated
          class="bg-white view-toggle"
          toggle-color="primary"
        />
      </div>

      <!-- กราฟแสดงข้อมูล -->
      <div class="q-pa-md chart-container">
        <BranchSalaryChart :salaryData="chartData" />
      </div>

      <!-- ตารางแสดงรายละเอียด -->
      <div class="q-mt-md">
        <q-table
          :columns="columns"
          :rows="filteredBranchSalaries"
          :rows-per-page-options="[5, 10, 15]"
          row-key="id"
          class="data-table"
        >
          <template v-slot:top>
            <div class="q-table__title">
              รายละเอียดเงินเดือนพนักงาน{{
                selectedBranch === 'ทั้งหมด' ? 'ทุกสาขา' : selectedBranch
              }}
            </div>
          </template>

          <template v-slot:body-cell-employee_name="{ row }">
            <q-td class="q-pa-none text-center">
              <p>{{ row.employee?.employee_name || 'N/A' }}</p>
            </q-td>
          </template>

          <template v-slot:body-cell-position="{ row }">
            <q-td class="q-pa-none text-center">
              <p>{{ row.employee?.position || 'N/A' }}</p>
            </q-td>
          </template>

          <template v-slot:body-cell-branch_name="{ row }">
            <q-td class="q-pa-none text-center">
              <p>{{ row.employee?.branch_name || 'N/A' }}</p>
            </q-td>
          </template>

          <template v-slot:body-cell-salary_date="{ row }">
            <q-td class="q-pa-none text-center">
              <p>{{ formatDate(row.salary_date) }}</p>
            </q-td>
          </template>

          <template v-slot:body-cell-working_hours="{ row }">
            <q-td class="q-pa-none text-center">
              <p>{{ Number(row.working_hours).toFixed(2) }}</p>
            </q-td>
          </template>

          <template v-slot:body-cell-total_amount="{ row }">
            <q-td class="q-pa-none text-center">
              <p>{{ Number(row.total_amount).toFixed(2) }}</p>
            </q-td>
          </template>

          <template v-slot:body-cell-is_paid="{ row }">
            <q-td class="q-pa-none text-center">
              <q-badge :color="row.is_paid ? 'positive' : 'negative'">
                {{ row.is_paid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย' }}
              </q-badge>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSalariesStore } from 'src/stores/salaries.store'
import { useEmployeeStore } from 'src/stores/empStore'
import { useAuthStore } from 'src/stores/authStore' // เพิ่มการ import authStore
import { Notify } from 'quasar'
import BranchSalaryChart from './BranchSalaryChart.vue'

const salariesStore = useSalariesStore()
const empStore = useEmployeeStore()
const authStore = useAuthStore() // เพิ่มการใช้งาน authStore
const isLoading = ref(true)
const selectedBranch = ref('ทั้งหมด')
const selectedView = ref('monthly')

// computed property for user branch name
const userBranchName = computed(() => authStore.user?.branch?.name || null)

// คอลัมน์ในตาราง
const columns = [
  {
    name: 'employee_name',
    align: 'center' as const,
    label: 'ชื่อพนักงาน',
    field: 'employee_name',
  },
  {
    name: 'position',
    align: 'center' as const,
    label: 'ตำแหน่ง',
    field: 'position',
  },
  {
    name: 'branch_name',
    align: 'center' as const,
    label: 'สาขา',
    field: 'branch_name',
  },
  {
    name: 'salary_date',
    align: 'center' as const,
    label: 'วันที่',
    field: 'salary_date',
    sortable: true,
  },
  {
    name: 'working_hours',
    align: 'center' as const,
    label: 'ชั่วโมงทำงาน',
    field: 'working_hours',
    sortable: true,
  },
  {
    name: 'total_amount',
    align: 'center' as const,
    label: 'จำนวนเงิน (บาท)',
    field: 'total_amount',
    sortable: true,
  },
  {
    name: 'is_paid',
    align: 'center' as const,
    label: 'สถานะ',
    field: 'is_paid',
  },
]

// ตรวจสอบว่าเป็น owner หรือไม่
const isOwner = computed(() => {
  return authStore.getRoleId === 1
})

// รายการสาขาทั้งหมด
const allBranchOptions = computed(() => {
  const branches = new Set(
    salariesStore.salaries.map((salary) => salary.employee?.branch_name).filter((branch) => branch),
  )
  return ['ทั้งหมด', ...Array.from(branches)]
})

// รายการสาขาที่ผู้ใช้มีสิทธิ์ดู
const visibleBranchOptions = computed(() => {
  // ถ้าเป็น owner (roleId 1) สามารถดูได้ทุกสาขา
  if (isOwner.value) {
    return allBranchOptions.value
  } else {
    // ถ้าไม่ใช่ owner จะแสดงเฉพาะสาขาของตัวเอง
    return userBranchName.value ? [userBranchName.value] : ['ทั้งหมด']
  }
})

// กรองข้อมูลตามสาขาและสิทธิ์การเข้าถึง
const filteredBranchSalaries = computed(() => {
  let filteredData = salariesStore.salaries

  // กรณีที่ owner เลือกสาขาเฉพาะ
  if (selectedBranch.value !== 'ทั้งหมด') {
    filteredData = filteredData.filter(
      (salary) => salary.employee?.branch_name === selectedBranch.value,
    )
  }
  // กรณีที่ไม่ใช่ owner ดูได้แค่สาขาของตัวเอง
  else if (!isOwner.value && userBranchName.value) {
    filteredData = filteredData.filter(
      (salary) => salary.employee?.branch_name === userBranchName.value,
    )
  }

  return filteredData
})

// ข้อมูลกราฟ
const chartData = computed(() => {
  // กรองตามสาขาและสิทธิ์การเข้าถึง
  const filteredData = filteredBranchSalaries.value

  // กรองตามมุมมอง (รายเดือน/รายปี)
  if (selectedView.value === 'monthly') {
    // จัดกลุ่มข้อมูลตามเดือน
    const monthlyData = new Map()

    filteredData.forEach((salary) => {
      if (!salary.salary_date) return

      const date = new Date(salary.salary_date)
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`

      if (!monthlyData.has(monthYear)) {
        monthlyData.set(monthYear, {
          label: monthYear,
          totalAmount: 0,
          totalHours: 0,
        })
      }

      const monthData = monthlyData.get(monthYear)
      monthData.totalAmount += Number(salary.total_amount)
      monthData.totalHours += Number(salary.working_hours)
    })

    return Array.from(monthlyData.values())
  } else {
    // จัดกลุ่มข้อมูลตามปี
    const yearlyData = new Map()

    filteredData.forEach((salary) => {
      if (!salary.salary_date) return

      const date = new Date(salary.salary_date)
      const year = date.getFullYear().toString()

      if (!yearlyData.has(year)) {
        yearlyData.set(year, {
          label: year,
          totalAmount: 0,
          totalHours: 0,
        })
      }

      const yearData = yearlyData.get(year)
      yearData.totalAmount += Number(salary.total_amount)
      yearData.totalHours += Number(salary.working_hours)
    })

    return Array.from(yearlyData.values())
  }
})

// ฟังก์ชันจัดรูปแบบวันที่
const formatDate = (dateString: string | Date) => {
  if (!dateString) return 'N/A'

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString

    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

// เมื่อ component ถูกโหลด
onMounted(async () => {
  try {
    await Promise.all([salariesStore.fetchSalaries(), empStore.getEmps()])

    // ถ้าไม่ใช่ owner และมีข้อมูลสาขาของผู้ใช้ ให้กำหนดค่าเริ่มต้นของ selectedBranch เป็นสาขาของผู้ใช้
    if (!isOwner.value && userBranchName.value) {
      selectedBranch.value = userBranchName.value
    }
  } catch (error) {
    console.error('Error loading data:', error)
    Notify.create({
      type: 'negative',
      message: 'ไม่สามารถโหลดข้อมูลได้',
      icon: 'error',
    })
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.section-header {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  padding: 16px;
  color: #3e2726;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.branch-select {
  width: 200px;
}

.view-toggle {
  min-width: 200px;
}

.chart-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.data-table {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  color: #3e2726;
}
</style>
