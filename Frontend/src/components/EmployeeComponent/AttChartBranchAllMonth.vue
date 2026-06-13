<template>
  <div>
    <!-- ตรวจสอบว่าเป็น Owner หรือไม่ -->
    <div v-if="!isOwner" class="access-denied q-pa-md">
      <div class="text-negative text-h6 text-center">ไม่มีสิทธิ์เข้าถึง</div>
      <div class="text-center q-mt-sm">หน้านี้สำหรับผู้จัดการร้านเท่านั้น</div>
    </div>

    <!-- แสดงกราฟเฉพาะเมื่อเป็น Owner -->
    <div v-else>
      <div class="filter-section q-mb-md">
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
        <div v-else class="no-data-message">กรุณาเลือกอย่างน้อย 1 ปีเพื่อแสดงข้อมูล</div>
      </div>
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

// ตรวจสอบว่าผู้ใช้เป็น Owner หรือไม่
const isOwner = computed(() => authStore.user?.role?.name === 'Owner')

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

// กำหนดสีสำหรับแต่ละปี
const colorMap: Record<string, ColorInfo> = {
  '2022': { background: 'rgba(75, 192, 192, 0.6)', border: 'rgb(75, 192, 192)' },
  '2023': { background: 'rgba(54, 162, 235, 0.6)', border: 'rgb(54, 162, 235)' },
  '2024': { background: 'rgba(255, 159, 64, 0.6)', border: 'rgb(255, 159, 64)' },
  '2025': { background: 'rgba(153, 102, 255, 0.6)', border: 'rgb(153, 102, 255)' },
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
})

// เช็คว่ามีข้อมูลที่พร้อมแสดงหรือไม่
const hasData = computed(() => selectedYears.value.length > 0)

// สร้างข้อมูลกราฟเริ่มต้น
const chartData = ref<ChartData<'bar'>>({
  labels: monthNames,
  datasets: [],
})

// ติดตามการเปลี่ยนแปลงของปีที่เลือก
watch(
  () => selectedYears.value,
  async () => {
    if (selectedYears.value.length > 0) {
      await loadChartData(selectedYears.value)
    } else {
      // รีเซ็ตกราฟเมื่อไม่มีการเลือกปี
      resetChartData()
    }
  },
  { immediate: true },
)

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

// ฟังก์ชันสำหรับดึงข้อมูลพนักงานทั้งหมด
function getAllEmployees(): Employee[] {
  // ใช้ข้อมูลจากการเรียก fetchAtts
  const allAttendances = attendanceStore.attendance || []

  // กรองข้อมูลที่มี employee
  const validAttendances = allAttendances.filter((att) => {
    return att.employee && att.employee_id
  })

  // สร้าง Set เพื่อเก็บ employee_id ที่ไม่ซ้ำ
  const uniqueEmployeeIds = new Set<number>()

  // เก็บ employee_id ที่ไม่ซ้ำจากข้อมูลการเข้างาน
  validAttendances.forEach((att) => {
    if (att.employee_id) {
      uniqueEmployeeIds.add(att.employee_id)
    }
  })

  // แปลง Set เป็น Array
  return Array.from(uniqueEmployeeIds).map((id) => {
    // หา employee ที่มี id ตรงกัน
    const attendanceWithEmployee = validAttendances.find((att) => att.employee_id === id)
    return {
      id: id,
      name: attendanceWithEmployee?.employee?.name || '',
      surname: attendanceWithEmployee?.employee?.surname || '',
    }
  })
}

const loadChartData = async (years: string[]) => {
  console.log('Loading chart data for years:', years)

  // สร้างชุดข้อมูลใหม่
  const newDatasets: DatasetType[] = []

  // ดึงรายชื่อพนักงานทั้งหมด
  const allEmployees = getAllEmployees()

  if (!allEmployees || allEmployees.length === 0) {
    console.warn('No employees found')
    return
  }

  // วนลูปตามปีที่เลือก
  for (const year of years) {
    // สร้างข้อมูลการเข้างานรายเดือน (12 เดือน)
    const monthlyData = Array(12).fill(0)

    // ประมวลผลข้อมูลสำหรับแต่ละพนักงาน
    for (const employee of allEmployees) {
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
          // console.warn(`No attendance data found for employee ${employee.id} in ${year}-${monthNum}`);
          continue
        }

        // เพิ่มจำนวนการเข้างานในเดือนนั้นๆ
        monthlyData[month] += result.length
      }
    }

    // สร้างชุดข้อมูลสำหรับปีนี้
    const colorInfo = colorMap[year] || {
      background: 'rgba(128, 128, 128, 0.5)',
      border: 'rgb(128, 128, 128)',
    }

    const datasetItem: DatasetType = {
      label: `ปี ${year}`,
      data: monthlyData,
      backgroundColor: colorInfo.background,
      borderColor: colorInfo.border,
      borderWidth: 1,
    }
    newDatasets.push(datasetItem)
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
      text: 'จำนวนการเข้างานรวมรายเดือนทุกสาขา',
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

.access-denied {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  padding: 20px;
  margin-top: 20px;
}
</style>
