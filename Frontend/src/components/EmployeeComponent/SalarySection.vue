<template>
  <div>
    <div class="section-header q-mb-md">
      <h4 class="q-ma-none">การจ่ายเงินพนักงาน</h4>
    </div>
    <div class="header-row">
      <q-input filled v-model="search" label="ค้นหา..." class="search-box" dense>
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-select
        filled
        v-model="selectedBranch"
        :options="branchOptions"
        label="Filter"
        class="q-mb-md"
        style="width: 200px"
      />
      <!-- Removed salary processing button as backend now processes salaries automatically -->
    </div>

    <div>
      <q-table
        :columns="columns"
        :rows="filteredSalaries"
        :rows-per-page-options="[5, 10, 15]"
        class="data-table"
      >
        <template v-slot:body-cell-branch="{ row }">
          <q-td class="q-pa-none text-center">
            <div>
              <p v-if="row.employee?.branch_name">{{ row.employee.branch_name }}</p>
              <p v-else>Branch information not available</p>
            </div>
          </q-td>
        </template>
        <template v-slot:body-cell-button="{ row }">
          <q-td class="q-pa-none text-center">
            <div class="action-cell">
              <q-btn
                v-if="!row.is_paid"
                label="จ่ายเงิน"
                color="green"
                text-color="white"
                rounded
                unelevated
                class="q-px-md"
                @click="pay(row)"
              />
              <div v-else class="paid-box">จ่ายแล้ว</div>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Notify } from 'quasar'
import { useEmployeeStore } from 'src/stores/empStore'
import type { Salary } from 'src/models'

import { useSalariesStore } from 'src/stores/salaries.store'

const search = ref('')
const salariesStore = useSalariesStore()
const empStore = useEmployeeStore()
const selectedBranch = ref('ทั้งหมด')

const branchOptions = computed(() => {
  const branches = new Set(
    salariesStore.salaries.map((salary) => salary.employee?.branch_name).filter((branch) => branch),
  )
  return ['ทั้งหมด', ...branches]
})

const columns: {
  name: string
  label: string
  align: 'center' | 'left' | 'right'
  field: string | ((row: Salary) => string | number | undefined)
}[] = [
  { name: 'id', label: 'id', align: 'center', field: (row: Salary) => row.id },
  {
    name: 'name',
    label: 'ชื่อ',
    field: (row) => row.employee?.employee_name || 'N/A',
    align: 'center',
  },
  {
    name: 'position',
    label: 'ตำแหน่ง',
    align: 'center',
    field: (row: Salary) => row.employee?.position || 'N/A',
  },
  {
    name: 'working_hours',
    label: 'ชั่วโมงทำงาน',
    align: 'center',
    field: (row: Salary) => row.working_hours,
  },
  {
    name: 'wage',
    label: 'ค่าจ้างต่อชั่วโมง (บาท)',
    align: 'center',
    field: (row: Salary) => row.wage,
  },
  {
    name: 'total_amount',
    label: 'ค่าจ้างรวม (บาท)',
    align: 'center',
    field: (row: Salary) => row.total_amount,
  },
  {
    name: 'button',
    label: 'ชำระค่าจ้าง',
    align: 'center',
    field: '',
  },
]

const mappedSalaries = computed<Salary[]>(() => {
  return salariesStore.salaries.map((salary) => {
    return {
      ...salary,
      employee: salary.employee,
    }
  })
})

const filteredSalaries = computed(() => {
  return mappedSalaries.value.filter((s) => {
    const matchesBranch =
      selectedBranch.value === 'ทั้งหมด' || (s.employee?.branch_name ?? '') === selectedBranch.value

    const matchesSearch = (s.employee?.employee_name?.toLowerCase() || '').includes(
      search.value.toLowerCase(),
    )

    return matchesBranch && matchesSearch
  })
})

const pay = async (row: Salary) => {
  try {
    await salariesStore.paySalary(row.id)
    Notify.create({
      type: 'positive',
      message: 'จ่ายเงินเรียบร้อยแล้ว',
      icon: 'check_circle',
      timeout: 2000,
      position: 'center',
      color: 'green-6',
      textColor: 'white',
      classes: 'q-pa-md text-subtitle1 rounded-borders',
    })
  } catch (error) {
    console.error('Error while paying salary:', error)
    Notify.create({
      type: 'negative',
      message: 'เกิดข้อผิดพลาดในการจ่ายเงิน',
      icon: 'error',
      timeout: 2500,
      position: 'center',
    })
  }
}

// Removed processSalaries function as salary processing is now automatic in backend

// โหลดข้อมูลเมื่อเข้าหน้านี้
onMounted(async () => {
  try {
    await Promise.all([salariesStore.fetchSalaries(), empStore.getEmps()])
  } catch (error) {
    console.error('Error loading salaries:', error)
    Notify.create({
      type: 'negative',
      message: 'ไม่สามารถโหลดข้อมูลเงินเดือนได้',
      icon: 'error',
    })
  }
})
</script>

<style scoped>
.header-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: transparent;
  padding-bottom: 22px;
}
.title {
  font-size: 15px;
  font-weight: bold;
  color: #3e2726;
  margin-right: 10px;
}
.search-box {
  height: 40px;
  font-size: 15px;
  width: 30%;
}
.filter-btn {
  background-color: rgb(141, 110, 99, 0.25);
  width: 130px;
  height: 40px;
  border-radius: 15px;
  font-family: 'Nunito', sans-serif;
  font-weight: bold;
  align-items: center;
}
.data-table {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  color: #3e2726;
}
.paid-box {
  border: 2px solid green;
  padding: 6px 16px;
  border-radius: 25px;
  background-color: white;
  color: black;
  font-weight: bold;
  display: inline-block;
  text-align: center;
}
.section-header {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  padding: 16px;
  color: #3e2726;
}
</style>
