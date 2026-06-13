<template>
  <div>
    <div class="filter-section q-mb-md">
      <div class="row items-center q-gutter-md">
        <div class="text-subtitle1">เลือกสาขาที่ต้องการแสดงข้อมูล:</div>
        <!-- เข้าถึงได้เฉพาะ Admin ของสาขานั้นๆ หรือ Owner -->
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

      <!-- เพิ่มส่วนเลือกปีที่ต้องการแสดงข้อมูล -->
      <div class="row items-center q-gutter-md q-mt-md">
        <div class="text-subtitle1">เลือกปีที่ต้องการแสดงข้อมูล:</div>
        <q-checkbox
          v-for="year in availableYears"
          :key="year"
          v-model="selectedYears"
          :label="year"
          :val="year"
        />
      </div>
    </div>

    <div class="chart-box q-mb-xl" style="height: 400px">
      <Bar v-if="hasData" :data="chartData" :options="barChartOptions" />
      <div v-else class="no-data-message">กรุณาเลือกอย่างน้อย 1 สาขาและ 1 ปีเพื่อแสดงข้อมูล</div>
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
import { useAuthStore } from 'src/stores/authStore'
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()

// กำหนดปีที่มีให้เลือก
const availableYears = ['2022', '2023', '2024', '2025']
const selectedYears = ref<string[]>(['2024']) // เริ่มต้นที่ปี 2024

// ตรวจสอบว่าผู้ใช้เป็น Admin หรือไม่
const isAdmin = computed(() => authStore.user?.role?.name === 'Admin')

// ตรวจสอบว่าผู้ใช้เป็น Owner หรือไม่
const isOwner = computed(() => authStore.user?.role?.name === 'Owner')

// ดึงค่า branch id ของผู้ใช้
const userBranchId = computed(() => authStore.user?.branch?.id)

// ปรับเงื่อนไขการเข้าถึงสาขา 1 - เฉพาะ Owner หรือ Admin ที่มี branch.id = 1
const canAccessBranch1 = computed(() => {
  return isOwner.value || (isAdmin.value && userBranchId.value === 1)
})

// ปรับเงื่อนไขการเข้าถึงสาขา 2 - เฉพาะ Owner หรือ Admin ที่มี branch.id = 2
const canAccessBranch2 = computed(() => {
  return isOwner.value || (isAdmin.value && userBranchId.value === 2)
})

// กำหนดค่าเริ่มต้นสำหรับ selectedBranches ตามสิทธิ์การเข้าถึง
const initialSelectedBranches = computed(() => {
  if (canAccessBranch1.value && canAccessBranch2.value) {
    return ['branch1'] // เริ่มต้นที่สาขา 1 ถ้าเข้าถึงได้ทั้งสองสาขา (กรณี Owner)
  } else if (canAccessBranch1.value) {
    return ['branch1'] // Admin สาขา 1
  } else if (canAccessBranch2.value) {
    return ['branch2'] // Admin สาขา 2
  } else {
    return [] // ไม่มีสิทธิ์เข้าถึงสาขาใดๆ
  }
})

// เพิ่มตัวแปรสำหรับเลือกสาขา
const selectedBranches = ref<string[]>(initialSelectedBranches.value)

// ชื่อเดือนทั้ง 12 เดือนสำหรับแสดงในกราฟ
const monthNames = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
]

// แก้ไขโครงสร้างข้อมูลสีเพื่อให้ TypeScript ทำงานได้ถูกต้อง
interface ColorInfo {
  background: string
  border: string
}

// กำหนดสีสำหรับแต่ละการรวมกันของสาขาและปี
const colorMap: Record<string, ColorInfo> = {
  'branch1-2022': { background: 'rgba(75, 192, 192, 0.6)', border: 'rgb(75, 192, 192)' },
  'branch1-2023': { background: 'rgba(75, 192, 192, 0.4)', border: 'rgb(75, 192, 192)' },
  'branch1-2024': { background: 'rgba(75, 192, 192, 0.8)', border: 'rgb(75, 192, 192)' },
  'branch1-2025': { background: 'rgba(75, 192, 192, 1.0)', border: 'rgb(75, 192, 192)' },
  'branch2-2022': { background: 'rgba(255, 159, 64, 0.6)', border: 'rgb(255, 159, 64)' },
  'branch2-2023': { background: 'rgba(255, 159, 64, 0.4)', border: 'rgb(255, 159, 64)' },
  'branch2-2024': { background: 'rgba(255, 159, 64, 0.8)', border: 'rgb(255, 159, 64)' },
  'branch2-2025': { background: 'rgba(255, 159, 64, 1.0)', border: 'rgb(255, 159, 64)' },
}

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

// เช็คว่ามีข้อมูลที่พร้อมแสดงหรือไม่
const hasData = computed(() => selectedBranches.value.length > 0 && selectedYears.value.length > 0)

// สร้างข้อมูลกราฟเริ่มต้น
const chartData = ref<ChartData<'bar'>>({
  labels: monthNames,
  datasets: [],
})

// ติดตามการเปลี่ยนแปลงของสาขาที่เลือกและปีที่เลือก
watch(
  [() => selectedBranches.value, () => selectedYears.value],
  async () => {
    if (selectedBranches.value.length > 0 && selectedYears.value.length > 0) {
      await loadChartData(selectedBranches.value, selectedYears.value)
    } else {
      // รีเซ็ตกราฟเมื่อไม่มีการเลือกสาขาหรือปี
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
    labels: monthNames,
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

const loadChartData = async (branches: string[], years: string[]) => {
  console.log('Loading chart data for branches:', branches, 'years:', years)

  // สร้างชุดข้อมูลใหม่
  const newDatasets: DatasetType[] = []

  // วนลูปตามสาขาและปีที่เลือก
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

    // วนลูปตามปีที่เลือก
    for (const year of years) {
      // สร้างข้อมูลการเข้างานรายเดือน (12 เดือน)
      const monthlyData = Array(12).fill(0)

      // ประมวลผลข้อมูลสำหรับแต่ละพนักงาน
      for (const employee of branchEmployees) {
        // วนลูปตามเดือน (1-12)
        for (let month = 0; month < 12; month++) {
          // สร้างช่วงวันที่สำหรับเดือนนั้นๆ
          const monthNum = month + 1 // เดือนเริ่มจาก 1
          const daysInMonth = new Date(parseInt(year), monthNum, 0).getDate() // หาจำนวนวันในเดือน

          const filterOptions = {
            role: 'User',
            userId: employee.id,
            filterType: 'ทั้งหมด',
            dateRange: {
              from: `${year}-${monthNum.toString().padStart(2, '0')}-01`,
              to: `${year}-${monthNum.toString().padStart(2, '0')}-${daysInMonth}`,
            },
          }

          const result = await attendanceStore.filteredAttendance(filterOptions)

          if (!result || result.length === 0) {
            console.warn(
              `No attendance data found for employee ${employee.id} in ${year}-${monthNum}`,
            )
            continue
          }

          // เพิ่มจำนวนการเข้างานในเดือนนั้นๆ
          monthlyData[month] += result.length
        }
      }

      // สร้างชุดข้อมูลสำหรับสาขาและปีนี้
      const branchLabel = branch === 'branch1' ? 'สาขา 1' : 'สาขา 2'
      const colorKey = `${branch}-${year}`
      const colorInfo = colorMap[colorKey] || {
        background: 'rgba(128, 128, 128, 0.5)',
        border: 'rgb(128, 128, 128)',
      }

      const datasetItem: DatasetType = {
        label: `${branchLabel} (${year})`,
        data: monthlyData,
        backgroundColor: colorInfo.background,
        borderColor: colorInfo.border,
        borderWidth: 1,
      }
      newDatasets.push(datasetItem)
    }
  }

  // อัปเดตข้อมูลกราฟ
  chartData.value = {
    labels: monthNames,
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
        text: 'เดือน',
      },
    },
  },
  plugins: {
    title: {
      display: true,
      text: 'จำนวนการเข้างานรวมรายเดือนตามสาขา',
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
