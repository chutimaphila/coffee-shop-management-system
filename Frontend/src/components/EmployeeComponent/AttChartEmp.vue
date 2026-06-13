<template>
  <div>
    <div class="filter-section q-mb-md">
      <div class="row items-center q-gutter-md">
        <div class="text-subtitle1">เลือกปีที่ต้องการแสดงข้อมูล:</div>
        <q-checkbox v-model="selectedYears" label="2024" val="2024" />
        <q-checkbox v-model="selectedYears" label="2025" val="2025" />
      </div>
    </div>

    <div class="chart-box q-mb-xl" style="height: 400px">
      <Line v-if="hasData" :data="monthlyTimeChartData" :options="lineChartOptions" />
      <div v-else class="no-data-message">กรุณาเลือกอย่างน้อย 1 ปีเพื่อแสดงข้อมูล</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { onMounted, ref, watch, computed } from 'vue'
import { useAttendanceStore } from 'src/stores/attStore'
import type { ChartData, ChartDataset, ChartOptions } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)
const attendanceStore = useAttendanceStore()

// เพิ่มตัวแปรสำหรับเลือกปี
const selectedYears = ref<string[]>(['2025']) // ค่าเริ่มต้นเป็นปีปัจจุบัน

onMounted(async () => {
  await attendanceStore.fetchAtts()
  console.log('Fetched attendance data:', attendanceStore.attendance)
})

const props = defineProps<{
  selectedEmployeeId: number | null
}>()

// เช็คว่ามีการเลือกปีหรือไม่
const hasData = computed(() => selectedYears.value.length > 0)

// เตรียมกราฟ
const monthlyTimeChartData = ref<ChartData<'line'>>({
  labels: [],
  datasets: [],
})
const store = useAttendanceStore()

// ติดตามการเปลี่ยนแปลงทั้งพนักงานที่เลือกและปีที่เลือก
watch(
  [() => props.selectedEmployeeId, () => selectedYears.value],
  async ([newId, years]) => {
    if (newId !== null && years.length > 0) {
      await loadChartData(newId, years)
    } else {
      // รีเซ็ตกราฟเมื่อไม่มีการเลือกปี
      resetChartData()
    }
  },
  { immediate: true },
)

function resetChartData() {
  monthlyTimeChartData.value = {
    labels: [],
    datasets: [],
  }
}

// เพิ่มฟังก์ชันช่วยเหลือในการแปลงรูปแบบวันที่และเวลา
function parseDateTime(dateTimeStr: string): Date {
  if (!dateTimeStr) return new Date()

  try {
    // ตรวจสอบรูปแบบของสตริงเวลา
    if (dateTimeStr.includes('T')) {
      // รูปแบบ ISO: '2025-04-24T10:52:36'
      return new Date(dateTimeStr)
    } else if (dateTimeStr.includes(' ')) {
      // รูปแบบ: '2025-04-24 10:52:36'
      return new Date(dateTimeStr.replace(' ', 'T'))
    } else if (dateTimeStr.includes(':') && !dateTimeStr.includes('-')) {
      // รูปแบบเวลาอย่างเดียว: '10:52:36'
      const today = new Date()
      const parts = dateTimeStr.split(':').map(Number)
      const hours = parts[0] || 0
      const minutes = parts[1] || 0
      const seconds = parts[2] || 0
      today.setHours(hours, minutes, seconds)
      return today
    } else {
      // รูปแบบวันที่อย่างเดียว: '2025-04-24'
      return new Date(dateTimeStr)
    }
  } catch (error) {
    console.error('Error parsing date:', dateTimeStr, error)
    return new Date()
  }
}

const loadChartData = async (employeeId: number, years: string[]) => {
  console.log('Loading chart data for employee ID:', employeeId, 'Years:', years)

  // สร้าง Map เพื่อเก็บข้อมูลแยกตามปี
  const yearlyCheckInMap = new Map<string, Map<number, number[]>>()
  const yearlyCheckOutMap = new Map<string, Map<number, number[]>>()

  // สร้าง Maps สำหรับแต่ละปีที่เลือก
  for (const year of years) {
    const checkInMap = new Map<number, number[]>()
    const checkOutMap = new Map<number, number[]>()

    // เตรียม arrays สำหรับทั้ง 12 เดือนในแต่ละปี
    for (let month = 0; month < 12; month++) {
      checkInMap.set(month, [])
      checkOutMap.set(month, [])
    }

    yearlyCheckInMap.set(year, checkInMap)
    yearlyCheckOutMap.set(year, checkOutMap)
  }

  // ดึงข้อมูลสำหรับแต่ละปีที่เลือก
  for (const year of years) {
    const filterOptions = {
      role: 'User',
      userId: employeeId,
      filterType: 'ทั้งหมด',
      dateRange: {
        from: `${year}-01-01`,
        to: `${year}-12-31`,
      },
    }

    const result = await store.filteredAttendance(filterOptions)
    console.log(`Filtered attendance data for ${year}:`, result)

    if (!result || result.length === 0) {
      console.warn(`No data found for selected employee in year ${year}`)
      continue
    }

    // ประมวลผลข้อมูลการเข้างาน
    result.forEach((att) => {
      if (!att.work_date) {
        console.warn('Record missing work_date:', att)
        return
      }

      try {
        // แปลงวันที่เป็น Date object
        const workDate = new Date(att.work_date)
        if (isNaN(workDate.getTime())) {
          console.warn('Invalid date:', att.work_date)
          return
        }

        const month = workDate.getMonth() // 0-11 for Jan-Dec
        const workYear = workDate.getFullYear().toString()

        // ตรวจสอบว่าปีของข้อมูลตรงกับปีที่กำลังประมวลผลหรือไม่
        if (workYear !== year) {
          return
        }

        const checkInMap = yearlyCheckInMap.get(year)
        const checkOutMap = yearlyCheckOutMap.get(year)

        // เก็บข้อมูลเวลาเข้างาน
        if (att.check_in_time && checkInMap) {
          try {
            const checkInHour = toHourFloat(att.check_in_time)
            if (!isNaN(checkInHour) && checkInHour >= 0 && checkInHour <= 24) {
              checkInMap.get(month)?.push(checkInHour)
            }
          } catch (e) {
            console.error('Error processing check-in time:', att.check_in_time, e)
          }
        }

        // เก็บข้อมูลเวลาออกงาน
        if (att.check_out_time && checkOutMap) {
          try {
            const checkOutHour = toHourFloat(att.check_out_time)
            if (!isNaN(checkOutHour) && checkOutHour >= 0 && checkOutHour <= 24) {
              checkOutMap.get(month)?.push(checkOutHour)
            }
          } catch (e) {
            console.error('Error processing check-out time:', att.check_out_time, e)
          }
        }
      } catch (error) {
        console.error('Error processing attendance record:', att, error)
      }
    })
  }

  // สร้างชื่อเดือนภาษาไทย
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

  // สร้างข้อมูลสำหรับกราฟ
  const labels = monthNames
  // กำหนดประเภทของอาร์เรย์ datasets ให้ชัดเจน
  const datasets: ChartDataset<'line'>[] = []

  // กำหนดสีสำหรับแต่ละปี
  const yearColors: Record<
    string,
    {
      checkIn: { border: string; background: string }
      checkOut: { border: string; background: string }
    }
  > = {
    '2024': {
      checkIn: { border: '#42a5f5', background: 'rgba(66, 165, 245, 0.2)' },
      checkOut: { border: '#66bb6a', background: 'rgba(102, 187, 106, 0.2)' },
    },
    '2025': {
      checkIn: { border: '#ef5350', background: 'rgba(239, 83, 80, 0.2)' },
      checkOut: { border: '#ff9800', background: 'rgba(255, 152, 0, 0.2)' },
    },
  }

  // สร้างชุดข้อมูลสำหรับแต่ละปีที่เลือก
  for (const year of years) {
    const checkInMap = yearlyCheckInMap.get(year)
    const checkOutMap = yearlyCheckOutMap.get(year)

    if (checkInMap) {
      const checkInData = Array(12)
        .fill(null)
        .map((_, month) => {
          const times = checkInMap.get(month) || []
          return times.length ? average(times) : null
        })

      // สำหรับ check-in dataset
      datasets.push({
        label: `เวลาเช็คอินเฉลี่ย ${year}`,
        data: checkInData,
        borderColor: yearColors[year as keyof typeof yearColors]?.checkIn.border || '#42a5f5',
        backgroundColor:
          yearColors[year as keyof typeof yearColors]?.checkIn.background ||
          'rgba(66, 165, 245, 0.2)',
        tension: 0.3,
        spanGaps: true,
        pointRadius: 4,
      })
    }

    if (checkOutMap) {
      const checkOutData = Array(12)
        .fill(null)
        .map((_, month) => {
          const times = checkOutMap.get(month) || []
          return times.length ? average(times) : null
        })

      // สำหรับ check-out dataset
      datasets.push({
        label: `เวลาเช็คเอาท์เฉลี่ย ${year}`,
        data: checkOutData,
        borderColor: yearColors[year as keyof typeof yearColors]?.checkOut.border || '#66bb6a',
        backgroundColor:
          yearColors[year as keyof typeof yearColors]?.checkOut.background ||
          'rgba(102, 187, 106, 0.2)',
        tension: 0.3,
        spanGaps: true,
        pointRadius: 4,
      })
    }
  }

  // อัปเดตข้อมูลกราฟ
  monthlyTimeChartData.value = {
    labels,
    datasets,
  }
}

// ฟังก์ชันแปลงเวลาเป็นเลขทศนิยม
function toHourFloat(timeStr: string): number {
  try {
    // รองรับหลายรูปแบบของเวลา
    let date: Date

    if (timeStr.includes('-') || timeStr.includes('T')) {
      // รูปแบบวันที่และเวลา
      date = parseDateTime(timeStr)
    } else {
      // รูปแบบเวลาอย่างเดียว (HH:MM:SS)
      const parts = timeStr.split(':').map(Number)
      const hours = parts[0] || 0
      const minutes = parts[1] || 0
      const seconds = parts[2] || 0

      date = new Date()
      date.setHours(hours, minutes, seconds)
    }

    return date.getHours() + date.getMinutes() / 60
  } catch (error) {
    console.error('Error parsing time:', timeStr, error)
    return 0
  }
}

function average(nums: number[]): number {
  if (!nums.length) return 0
  const sum = nums.reduce((a, b) => a + b, 0)
  return parseFloat((sum / nums.length).toFixed(2))
}

const lineChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      title: {
        display: true,
        text: 'เวลา (ชั่วโมง)',
      },
      min: 0,
      max: 24,
      ticks: {
        stepSize: 2,
        callback: (value) => `${value}:00`,
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
      text: 'เวลาเข้า - ออกงานเฉลี่ยรายเดือน',
      font: { size: 18 },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.raw as number
          if (value === null) return 'ไม่มีข้อมูล'

          const hours = Math.floor(value)
          const minutes = Math.round((value - hours) * 60)
          return `${context.dataset.label}: ${hours}:${minutes.toString().padStart(2, '0')}`
        },
      },
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
</style>
