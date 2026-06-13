<template>
  <q-page padding>
    <div class="section-header q-mb-md">
      <h4 class="q-ma-none">การเช็คเงินเดือนพนักงาน</h4>
    </div>
    <div v-if="isLoading" class="q-pa-md">
      <q-spinner-dots color="primary" size="40px" />
      กำลังโหลดข้อมูล...
    </div>
    <div v-else>
      <!-- Filter row with date picker and view toggle -->
      <div class="filter-row q-mb-md">
        <q-input
          filled
          v-model="selectedDate"
          label="เลือกวันที่"
          mask="date"
          :rules="[(val) => !val || /^\\d{4}-\\d{2}-\\d{2}$/.test(val) || 'รูปแบบวันที่ไม่ถูกต้อง']"
          placeholder="YYYY-MM-DD"
          clearable
          type="date"
          class="date-picker"
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

      <!-- กราฟแสดงข้อมูลเงินเดือน -->
      <div class="q-pa-md">
        <SalaryChart :filteredSalaries="chartSalaries" />
      </div>

      <!-- ตารางแสดงข้อมูลเงินเดือน -->
      <div>
        <q-table
          :columns="columns"
          :rows="sortedSalaries"
          :rows-per-page-options="[5, 10, 15]"
          class="data-table"
          row-key="id"
          :sort-method="(rows: readonly any[], sortBy: string, descending: boolean) => rows"
          :sort-by="sortBy"
          :sort-desc="sortDesc"
          @update:sort-by="(val: string) => (sortBy = val)"
          @update:sort-desc="(val: boolean) => (sortDesc = val)"
        >
          <template v-slot:body-cell-salary_date="{ row }">
            <q-td class="q-pa-none text-center">
              <p>{{ formatDate(row.salary_date) }}</p>
            </q-td>
          </template>
          <template v-slot:body-cell-working_hours="{ row }">
            <q-td class="q-pa-none text-center">
              <p>{{ row.working_hours.toFixed(2) }}</p>
            </q-td>
          </template>
          <template v-slot:body-cell-wage="{ row }">
            <q-td class="q-pa-none text-center">
              <p>{{ row.wage }}</p>
            </q-td>
          </template>
          <template v-slot:body-cell-total_amount="{ row }">
            <q-td class="q-pa-none text-center">
              <p>{{ row.total_amount.toFixed(2) }}</p>
            </q-td>
          </template>
          <template v-slot:body-cell-is_paid="{ row }">
            <q-td class="q-pa-none text-center">
              <p>{{ row.is_paid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย' }}</p>
            </q-td>
          </template>
          <template v-slot:body-cell-actions>
            <q-td class="q-pa-none text-center"> </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useSalariesStore } from 'src/stores/salaries.store'
import { useEmployeeStore } from 'src/stores/empStore'
import SalaryChart from './SalaryChart.vue'
import { Notify } from 'quasar'
import type { Salary } from 'src/models'

const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

const salariesStore = useSalariesStore()
const empStore = useEmployeeStore()

const isLoading = ref(true)
const selectedView = ref('monthly') // 'monthly' หรือ 'yearly'

// New reactive variable for selected date filter
const selectedDate = ref<string | null>(null)

// Add sorting state
const sortBy = ref<string>('salary_date')
const sortDesc = ref<boolean>(false)

const columns: {
  name: string
  label: string
  align: 'center' | 'left' | 'right'
  field: string | ((row: Salary) => string | number | boolean | undefined)
}[] = [
  { name: 'id', label: 'id', align: 'center', field: (row: Salary) => row.id },
  {
    name: 'salary_date',
    label: 'วันที่',
    align: 'center',
    field: 'salary_date',
  },
  {
    name: 'working_hours',
    label: 'ชั่วโมงทำงาน',
    align: 'center',
    field: 'working_hours',
  },
  {
    name: 'wage',
    label: 'ค่าจ้างต่อชั่วโมง',
    align: 'center',
    field: 'wage',
  },
  {
    name: 'total_amount',
    label: 'ยอดรวม',
    align: 'center',
    field: 'total_amount',
  },
  {
    name: 'is_paid',
    label: 'สถานะการจ่าย',
    align: 'center',
    field: 'is_paid',
  },
]

// Helper function to compare dates ignoring time
const isSameDate = (date1: string | Date, date2: string | Date): boolean => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return d1.toISOString().split('T')[0] === d2.toISOString().split('T')[0]
}

const filteredSalaries = computed(() => {
  if (!currentUser.value || !currentUser.value.id) return []
  return salariesStore.salaries
    .filter((salary) => salary.employee?.employee_id === currentUser.value!.id)
    .filter(
      (salary): salary is Salary & { employee: NonNullable<Salary['employee']> } =>
        salary.employee !== null,
    )
    .filter((salary) => {
      if (!selectedDate.value) return true
      return isSameDate(salary.salary_date, selectedDate.value)
    })
})

// Computed chart salaries based on selected view (monthly/yearly)
const chartSalaries = computed(() => {
  if (selectedView.value === 'monthly') {
    return filteredSalaries.value.filter(
      (salary): salary is Salary & { employee: NonNullable<Salary['employee']> } =>
        salary.employee !== null,
    )
  } else {
    // Yearly aggregation
    const yearlyData = new Map<
      number,
      {
        id: number
        salary_date: string
        employee: (typeof filteredSalaries.value)[0]['employee'] | null
        wage: number
        working_hours: number
        total_amount: number
        is_paid: boolean
      }
    >()

    // Filter out salaries with null employee before aggregation
    const filteredForYearly = filteredSalaries.value.filter(
      (salary): salary is Salary & { employee: NonNullable<Salary['employee']> } =>
        salary.employee !== null,
    )

    filteredForYearly.forEach((salary) => {
      const date = new Date(salary.salary_date)
      const year = date.getFullYear()

      if (!yearlyData.has(year)) {
        yearlyData.set(year, {
          id: year,
          salary_date: `${year}`,
          employee: salary.employee,
          wage: salary.wage,
          working_hours: 0,
          total_amount: 0,
          is_paid: true,
        })
      }

      const yearData = yearlyData.get(year)!
      yearData.working_hours += salary.working_hours
      yearData.total_amount += salary.total_amount
    })

    return Array.from(yearlyData.values()) as Salary[]
  }
})

// Computed sorted salaries for table
const sortedSalaries = computed(() => {
  const data = [...filteredSalaries.value]
  data.sort((a, b) => {
    let aValue: string | number | boolean = a[sortBy.value as keyof typeof a] as
      | string
      | number
      | boolean
    let bValue: string | number | boolean = b[sortBy.value as keyof typeof b] as
      | string
      | number
      | boolean

    // Handle undefined or null values
    if (aValue === undefined || aValue === null) aValue = ''
    if (bValue === undefined || bValue === null) bValue = ''

    // For dates, convert to timestamp
    if (sortBy.value === 'salary_date') {
      aValue = new Date(aValue as string).getTime()
      bValue = new Date(bValue as string).getTime()
    }

    if (aValue < bValue) return sortDesc.value ? 1 : -1
    if (aValue > bValue) return sortDesc.value ? -1 : 1
    return 0
  })
  return data
})

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

onMounted(async () => {
  try {
    await Promise.all([salariesStore.fetchSalaries(), empStore.getEmps()])
  } catch {
    Notify.create({
      type: 'negative',
      message: 'ไม่สามารถโหลดข้อมูลเงินเดือนได้',
      icon: 'error',
    })
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.date-picker {
  width: 200px;
}

.view-toggle {
  min-width: 200px;
}

.data-table {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  color: #3e2726;
}
.section-header {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  padding: 16px;
  color: #3e2726;
}
</style>
