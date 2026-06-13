<template>
  <div>
    <div class="section-header q-mb-md">
      <h4 class="q-ma-none">รายงานการเข้าออกของพนักงาน</h4>
    </div>
    <div class="header-row">
      <q-input filled v-model="search" label="ค้นหา..." class="search-box" dense>
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-select
        filled
        v-model="filterType"
        :options="['ทั้งหมด', 'สาขา 1', 'สาขา 2']"
        label="Filter"
        class="q-mb-md"
        style="width: 200px"
      />
      <div class="q-pa-md">
        <div class="q-mb-sm">
          <q-badge v-if="displayDateRange" color="indigo" class="date-badge">
            {{ displayDateRange }}
          </q-badge>
        </div>

        <q-btn icon="event" round color="primary">
          <q-popup-proxy
            cover
            @before-show="updateProxy"
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date v-model="proxyDate" range>
              <div class="row items-center justify-end q-gutter-sm">
                <q-btn label="Cancel" color="primary" flat v-close-popup />
                <q-btn label="OK" color="primary" flat @click="save" v-close-popup />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-btn>
      </div>
      <!-- ตาราง -->

      <div class="btn-group">
        <q-btn
          dense
          class="checkin-btn"
          icon-right="fa-solid fa-check"
          @click="handleCheck('checkIn')"
          >Check in</q-btn
        >
        <q-btn
          dense
          class="checkout-btn"
          icon-right="fa-solid fa-xmark"
          @click="handleCheck('checkOut')"
          >Check out</q-btn
        >
      </div>
    </div>
    <q-table :rows="filteredAttendance" :columns="columns" row-key="id" class="q-mt-md" />
  </div>
</template>

<script setup lang="ts">
import type { QTableColumn } from 'quasar'
import { useAttendanceStore } from 'src/stores/attStore'
import { useAuthStore } from 'src/stores/authStore'
import { useBranchStore } from 'src/stores/branchStore'
import { computed, onMounted, ref, watch } from 'vue'

// ค่าจริงที่แสดงให้ผู้ใช้เห็น
const dateRange = ref({
  from: '',
  to: '',
})

const proxyDate = ref({ ...dateRange.value })

const displayDateRange = computed(() => {
  if (!dateRange.value.from && !dateRange.value.to) return 'กรุณาเลือกวันที่'
  const format = (dateStr: string) => (dateStr ? dateStr.replace(/\//g, '-') : '...')
  return `${format(dateRange.value.from)} ถึง ${format(dateRange.value.to)}`
})

function updateProxy() {
  proxyDate.value = { ...dateRange.value }
}
const save = () => {
  dateRange.value = { ...proxyDate.value }
}
const loading = ref(false)
const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)
const search = ref('')
const dateFilterTrigger = ref(0)
const branchStore = useBranchStore()
const filterType = ref('ทั้งหมด')
const columns: QTableColumn[] = [
  {
    name: 'employee_name',
    label: 'ชื่อ',
    field: (row) => `${row.employee?.name ?? ''} ${row.employee?.surname ?? ''}`.trim(),
    align: 'center',
    sortable: true,
  },
  {
    name: 'branch_name',
    label: 'สาขา',
    field: (row) => row.branch?.id || row.branch_id || '-',
    align: 'center',
    sortable: true,
  },
  {
    name: 'work_date',
    label: 'วันที่',
    field: 'work_date',
    // field: (row) => new Date(row.work_date).toLocaleDateString('th-TH'),

    align: 'center',
  },
  { name: 'check_in_time', label: 'เข้า', field: 'check_in_time', align: 'center' },
  { name: 'check_out_time', label: 'ออก', field: 'check_out_time', align: 'center' },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' },
  { name: 'actions', label: 'จัดการ', field: 'actions', align: 'center' },
]
const attendanceStore = useAttendanceStore()

function normalizeDate(date: string | Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

async function handleCheck(action: 'checkIn' | 'checkOut') {
  const user = currentUser.value
  console.log(user)
  if (!user || !user.id) {
    alert('กรุณาเข้าสู่ระบบก่อน')
    return
  }
  try {
    if (action === 'checkIn') {
      console.log('Checking in with user ID:', user.id)
      await attendanceStore.checkIn(user.id)
    } else if (action === 'checkOut') {
      await attendanceStore.checkOut()
    }
  } catch (err) {
    console.error('Check action failed:', err)
  }

  // navigator.geolocation.getCurrentPosition((pos) => {
  //   const lat = pos.coords.latitude
  //   const lng = pos.coords.longitude

  //   await api.post('/attendance/check-in', {
  //     employee_id: currentUser.value.id,
  //     latitude: lat,
  //     longitude: lng,
  //   })
  // })
}

// const pagination = ref({
//   sortBy: 'id',
//   descending: true,
//   page: 1,
//   rowsPerPage: 5,
//   rowsNumber: 0,
// })
// onMounted(() => {
//   // employeeStore.getEmps()
//   attendanceStore.getAllAttendance()
//   branchStore.getBranches()
// })
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([attendanceStore.getAllAttendance(), branchStore.getBranches()])
  } finally {
    loading.value = false
  }
})
// const searchTerm = ref('')

const isOwner = computed(() => currentUser.value?.role?.name === 'Owner')
const isAdmin = computed(() => currentUser.value?.role?.name === 'Admin')
const isUser = computed(() => currentUser.value?.role?.name === 'User')

const branchNameFromId = (id?: number) => {
  if (id === 1) return 'สาขา 1'
  if (id === 2) return 'สาขา 2'
  return 'ไม่ทราบสาขา'
}

const filteredAttendance = computed(() => {
  if (!attendanceStore.attendance || attendanceStore.attendance.length === 0) {
    return []
  }

  let result = [...attendanceStore.attendance]

  console.log(
    'Role | RoleID | BranchID:',
    currentUser.value?.role?.name,
    currentUser.value?.role?.id,
    currentUser.value?.branchId,
  )

  // กรองตามบทบาทผู้ใช้
  if (isAdmin.value) {
    const adminBranchId = currentUser.value?.branch?.id || currentUser.value?.branchId
    if (adminBranchId) {
      result = result.filter((item) => item.branch?.id === adminBranchId)
      result = result.filter((item) => item.branch?.id === adminBranchId)
    }
  } else if (isUser.value) {
    result = result.filter((item) => item.employee?.user_id === currentUser.value?.id)
  } else if (isOwner.value) {
    // Owner เห็นทั้งหมด
    result = [...result]
  }

  // กรองตามสาขาที่เลือก
  // if (filterType.value && filterType.value !== 'ทั้งหมด') {
  //   const branchName = filterType.value
  //   result = result.filter((item) => {
  //     const itemBranchName = item.branch_id === 1 ? 'สาขา 1' : 'สาขา 2'
  //     return itemBranchName === branchName
  //   })
  //   const matchSearch =
  //     item.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
  //     item.datetime.toLowerCase().includes(searchTerm.value.toLowerCase())
  // }
  if (filterType.value && filterType.value !== 'ทั้งหมด') {
    const branchName = filterType.value
    result = result.filter((item) => {
      const itemBranchName = branchNameFromId(item.branch?.id)
      return itemBranchName === branchName
    })
  }

  // กรองตามช่วงวันที่ (normalize date เทียบแบบไม่สนใจเวลา)
  if (dateRange.value.from && dateRange.value.to) {
    const fromDate = normalizeDate(dateRange.value.from)
    const toDate = normalizeDate(dateRange.value.to)

    result = result.filter((item) => {
      if (!item.work_date) return false
      try {
        const itemDate = normalizeDate(item.work_date)
        return itemDate >= fromDate && itemDate <= toDate
      } catch {
        return false
      }
    })
  }

  // กรองตามคำค้นหา
  if (search.value) {
    const searchTerm = search.value.toLowerCase()
    result = result.filter((item) => {
      const employeeName =
        `${item.employee?.name || ''} ${item.employee?.surname || ''}`.toLowerCase()
      const branchName = item.branch_id === 1 ? 'สาขา 1' : 'สาขา 2'
      return employeeName.includes(searchTerm) || branchName.toLowerCase().includes(searchTerm)
    })
  }

  // แปลง branch_id เป็นชื่อสาขา
  return result.map((item) => ({
    ...item,
    branch: {
      ...item.branch,
      name: item.branch_id === 1 ? 'สาขา 1' : 'สาขา 2',
    },
  }))
})

watch(
  dateRange,
  () => {
    console.log('Date range changed, refreshing data...')
    dateFilterTrigger.value = Date.now()
  },
  { deep: true, immediate: true },
)
onMounted(async () => {
  await attendanceStore.fetchAtts() // รอจนกว่าข้อมูลจะถูกดึงมา
  console.log(attendanceStore.attendance) // ตรวจสอบว่า store.expenses มีข้อมูลหรือไม่
})
</script>
<style scoped>
.header-row {
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
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
  width: 20%;
}
.filter-btn {
  width: 150px;
  font-weight: bold;
  align-items: center;
}
.btn-group {
  align-items: center;
  justify-content: center;
  margin-left: auto;
  display: flex;
  gap: 10px;
}
.checkin-btn {
  background-color: #71fd67;
  color: #3e2726;
  font-weight: bold;
  width: 140px;
  height: 40px;
  margin-left: 20px;
  border-radius: 15px;
  font-family: 'Nunito', sans-serif;
  align-items: center;
}
.checkout-btn {
  background-color: #ff6e6e;
  color: #3e2726;
  font-weight: bold;
  width: 140px;
  height: 40px;
  margin-left: 10px;
  border-radius: 15px;
  font-family: 'Nunito', sans-serif;
  align-items: center;
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
