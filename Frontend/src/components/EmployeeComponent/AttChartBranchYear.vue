<template>
  <div>
    <div class="filter-section q-mb-md">
      <div class="row items-center q-gutter-md">
        <div class="text-subtitle1">เลือกสาขาที่ต้องการแสดงข้อมูล:</div>
        <!-- เข้าถึงได้เฉพาะ Admin ทั่วไปหรือ Admin ของสาขานั้นๆ หรือ Owner -->
        <q-checkbox
          v-if="canAccessBranch1"
          v-model="selectedBranches"
          label="สาขา 1"
          val="branch1"
        />
        <q-checkbox
          v-if="canAccessBranch2"
          v-model="selectedBranches"
          label="สาขา 2"
          val="branch2"
        />
        <div v-if="!canAccessBranch1 && !canAccessBranch2" class="text-negative">
          คุณไม่มีสิทธิ์เข้าถึงข้อมูลสาขาใดๆ
        </div>
      </div>
    </div>

    <div class="chart-box q-mb-xl" style="height: 400px">
      <Bar v-if="hasData" :data="chartData" :options="barChartOptions" />
      <div v-else class="no-data-message">กรุณาเลือกอย่างน้อย 1 สาขาเพื่อแสดงข้อมูล</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { onMounted, ref, watch, computed } from 'vue'
import { useAttendanceStore } from 'src/stores/attStore'
import { useAuthStore } from 'src/stores/authStore' // เพิ่ม import authStore
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
const attendanceStore = useAttendanceStore()
const authStore = useAuthStore() // เพิ่ม authStore

// ตรวจสอบว่าผู้ใช้เป็น Admin หรือไม่
const isAdmin = computed(() => authStore.user?.role?.name === 'Admin')

// ตรวจสอบว่าผู้ใช้เป็น Owner หรือไม่
const isOwner = computed(() => authStore.user?.role?.name === 'Owner')

// ตรวจสอบสิทธิ์การเข้าถึงสาขา 1
const canAccessBranch1 = computed(() => {
  // ถ้าเป็น Owner สามารถเข้าถึงได้ทุกสาขา
  if (isOwner.value) return true

  // ถ้าเป็น Admin ทั่วไป หรือ Admin ของสาขา 1
  return (
    isAdmin.value && (authStore.user?.branch?.id === 1 || authStore.user?.branch?.id === undefined)
  )
})

// ตรวจสอบสิทธิ์การเข้าถึงสาขา 2
const canAccessBranch2 = computed(() => {
  // ถ้าเป็น Owner สามารถเข้าถึงได้ทุกสาขา
  if (isOwner.value) return true

  // ถ้าเป็น Admin ทั่วไป หรือ Admin ของสาขา 2
  return (
    isAdmin.value && (authStore.user?.branch?.id === 2 || authStore.user?.branch?.id === undefined)
  )
})

// กำหนดค่าเริ่มต้นสำหรับ selectedBranches ตามสิทธิ์การเข้าถึง
const initialSelectedBranches = computed(() => {
  if (canAccessBranch1.value && canAccessBranch2.value) {
    return ['branch1'] // เริ่มต้นที่สาขา 1 ถ้าเข้าถึงได้ทั้งสองสาขา
  } else if (canAccessBranch1.value) {
    return ['branch1']
  } else if (canAccessBranch2.value) {
    return ['branch2']
  } else {
    return [] // ไม่มีสิทธิ์เข้าถึงสาขาใดๆ
  }
})

// เพิ่มตัวแปรสำหรับเลือกสาขา
const selectedBranches = ref<string[]>(initialSelectedBranches.value)

// กำหนดปีที่จะแสดงข้อมูล (แบบคงที่)
const yearsToShow = ['2022', '2023', '2024', '2025']

// กำหนดประเภทข้อมูลสำหรับ dataset
type DatasetType = {
  label: string
  data: number[]
  backgroundColor: string
  borderColor: string
  borderWidth: number
}

onMounted(async () => {
  await attendanceStore.fetchAtts()
  console.log('Fetched attendance data:', attendanceStore.attendance)

  // ตรวจสอบและปรับค่า selectedBranches ตามสิทธิ์หลังจาก mount component
  updateSelectedBranchesBasedOnPermissions()
})

// ฟังก์ชันสำหรับปรับค่า selectedBranches ตามสิทธิ์
function updateSelectedBranchesBasedOnPermissions() {
  // กรองเฉพาะสาขาที่มีสิทธิ์เข้าถึง
  selectedBranches.value = selectedBranches.value.filter((branch) => {
    if (branch === 'branch1' && !canAccessBranch1.value) return false
    if (branch === 'branch2' && !canAccessBranch2.value) return false
    return true
  })

  // ถ้าไม่มีสาขาที่เลือกแต่มีสิทธิ์เข้าถึงบางสาขา ให้เลือกสาขาแรกที่เข้าถึงได้
  if (selectedBranches.value.length === 0) {
    if (canAccessBranch1.value) selectedBranches.value.push('branch1')
    else if (canAccessBranch2.value) selectedBranches.value.push('branch2')
  }
}

// เช็คว่ามีการเลือกสาขาหรือไม่
const hasData = computed(() => selectedBranches.value.length > 0)

// สร้างข้อมูลกราฟเริ่มต้น
const chartData = ref<ChartData<'bar'>>({
  labels: yearsToShow,
  datasets: [],
})

// ติดตามการเปลี่ยนแปลงของสาขาที่เลือก
watch(
  () => selectedBranches.value,
  async (branches) => {
    if (branches.length > 0) {
      await loadChartData(branches)
    } else {
      // รีเซ็ตกราฟเมื่อไม่มีการเลือกสาขา
      resetChartData()
    }
  },
  { immediate: true },
)

// ติดตามการเปลี่ยนแปลงของสิทธิ์ผู้ใช้
watch([canAccessBranch1, canAccessBranch2], () => {
  updateSelectedBranchesBasedOnPermissions()
})

function resetChartData() {
  chartData.value = {
    labels: yearsToShow,
    datasets: [],
  }
}

// กำหนดประเภทข้อมูลสำหรับพนักงาน
interface Employee {
  id: number
  name: string
  surname: string
}

// ฟังก์ชันสำหรับดึงข้อมูลพนักงานตามสาขา
function getEmployeesByBranch(branch: string): Employee[] {
  // ใช้ข้อมูลจากการเรียก fetchAtts
  const allAttendances = attendanceStore.attendance || []

  // กรองข้อมูลที่มี employee และ branch
  const branchAttendances = allAttendances.filter((att) => {
    // ตรวจสอบว่ามี employee และ branch หรือไม่
    if (!att.employee || !att.employee.branch) {
      return false
    }

    // ตรวจสอบว่าเป็นสาขาที่เลือกหรือไม่
    // สมมติว่า branch1 คือสาขาที่มี id เป็น 1 และ branch2 คือสาขาที่มี id เป็น 2
    const branchId = branch === 'branch1' ? 1 : 2
    return att.employee.branch.id === branchId
  })

  // สร้าง Set เพื่อเก็บ employee_id ที่ไม่ซ้ำ
  const uniqueEmployeeIds = new Set<number>()

  // เก็บ employee_id ที่ไม่ซ้ำจากข้อมูลการเข้างาน
  branchAttendances.forEach((att) => {
    if (att.employee_id) {
      uniqueEmployeeIds.add(att.employee_id)
    }
  })

  // แปลง Set เป็น Array
  return Array.from(uniqueEmployeeIds).map((id) => {
    // หา employee ที่มี id ตรงกัน
    const attendanceWithEmployee = branchAttendances.find((att) => att.employee_id === id)
    return {
      id: id,
      name: attendanceWithEmployee?.employee?.name || '',
      surname: attendanceWithEmployee?.employee?.surname || '',
    }
  })
}

const loadChartData = async (branches: string[]) => {
  console.log('Loading chart data for branches:', branches)

  // กำหนดสีสำหรับแต่ละสาขา
  const branchColors = {
    branch1: {
      background: 'rgba(75, 192, 192, 0.6)',
      border: 'rgb(75, 192, 192)',
    },
    branch2: {
      background: 'rgba(255, 159, 64, 0.6)',
      border: 'rgb(255, 159, 64)',
    },
  }

  // สร้างชุดข้อมูลใหม่ พร้อมกำหนดประเภทข้อมูล
  const newDatasets: DatasetType[] = []

  for (const branch of branches) {
    // ตรวจสอบสิทธิ์การเข้าถึง
    if (
      (branch === 'branch1' && !canAccessBranch1.value) ||
      (branch === 'branch2' && !canAccessBranch2.value)
    ) {
      console.warn(`User has no permission to access ${branch}`)
      continue
    }

    // ดึงรายชื่อพนักงานในสาขา
    const branchEmployees = getEmployeesByBranch(branch)

    if (!branchEmployees || branchEmployees.length === 0) {
      console.warn(`No employees found in branch ${branch}`)
      continue
    }

    // สร้างข้อมูลการเข้างานรายปี
    const yearlyData = Array(yearsToShow.length).fill(0)

    // ประมวลผลข้อมูลสำหรับแต่ละพนักงาน
    for (const employee of branchEmployees) {
      for (let i = 0; i < yearsToShow.length; i++) {
        const year = yearsToShow[i]
        const filterOptions = {
          role: 'User',
          userId: employee.id,
          filterType: 'ทั้งหมด',
          dateRange: {
            from: `${year}-01-01`,
            to: `${year}-12-31`,
          },
        }

        const result = await attendanceStore.filteredAttendance(filterOptions)

        if (!result || result.length === 0) {
          console.warn(`No attendance data found for employee ${employee.id} in year ${year}`)
          continue
        }

        // เพิ่มจำนวนการเข้างานในปีนั้นๆ
        yearlyData[i] += result.length
      }
    }

    // สร้างชุดข้อมูลสำหรับสาขานี้
    const branchKey = branch as keyof typeof branchColors
    const datasetItem: DatasetType = {
      label: branch === 'branch1' ? 'สาขา 1' : 'สาขา 2',
      data: yearlyData,
      backgroundColor: branchColors[branchKey].background,
      borderColor: branchColors[branchKey].border,
      borderWidth: 1,
    }
    newDatasets.push(datasetItem)
  }

  // อัปเดตข้อมูลกราฟ
  chartData.value = {
    labels: yearsToShow,
    datasets: newDatasets,
  }
}

const barChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      title: {
        display: true,
        text: 'จำนวนการเข้างานรวม',
      },
      beginAtZero: true,
      ticks: {
        precision: 0, // แสดงเป็นจำนวนเต็ม
      },
    },
    x: {
      title: {
        display: true,
        text: 'ปี',
      },
    },
  },
  plugins: {
    title: {
      display: true,
      text: 'จำนวนการเข้างานรวมรายปีตามสาขา',
      font: { size: 18 },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.raw as number
          return `${context.dataset.label}: ${value} ครั้ง`
        },
      },
    },
    legend: {
      display: true,
      position: 'top',
    },
  },
}
</script>

<style scoped>
.chart-box {
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.filter-section {
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
}

.no-data-message {
  font-size: 18px;
  color: #666;
  text-align: center;
}

.text-negative {
  color: #c10015;
  font-weight: 500;
}
</style>
