<template>
  <div>
    <div class="filter-section q-mb-md">
      <div class="row items-center q-gutter-md">
        <div class="text-subtitle1">เลือกปีที่ต้องการแสดงข้อมูล:</div>
        <q-checkbox v-model="selectedYears" label="2022" val="2022" />
        <q-checkbox v-model="selectedYears" label="2023" val="2023" />
        <q-checkbox v-model="selectedYears" label="2024" val="2024" />
        <q-checkbox v-model="selectedYears" label="2025" val="2025" />
      </div>
    </div>

    <div class="chart-box q-mb-xl" style="height: 400px">
      <Bar v-if="hasData" :data="yearlyAttendanceData" :options="barChartOptions" />
      <div v-else class="no-data-message">กรุณาเลือกอย่างน้อย 1 ปีเพื่อแสดงข้อมูล</div>
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
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
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

// เตรียมกราฟแท่ง
const yearlyAttendanceData = ref<ChartData<'bar'>>({
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
  yearlyAttendanceData.value = {
    labels: [],
    datasets: [],
  }
}

const loadChartData = async (employeeId: number, years: string[]) => {
  console.log('Loading chart data for employee ID:', employeeId, 'Years:', years)

  // สร้าง Map เพื่อเก็บข้อมูลจำนวนวันที่เข้าทำงานแยกตามปี
  const yearlyAttendanceCounts: Record<string, number> = {}

  // เตรียมข้อมูลเริ่มต้นสำหรับแต่ละปี
  for (const year of years) {
    yearlyAttendanceCounts[year] = 0
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

    // Set เพื่อเก็บวันที่ไม่ซ้ำกันในแต่ละปี
    const uniqueWorkDays = new Set<string>()

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

        const workYear = workDate.getFullYear().toString()
        // ตรวจสอบว่าปีของข้อมูลตรงกับปีที่กำลังประมวลผลหรือไม่
        if (workYear !== year) {
          return
        }

        // แน่ใจว่า dayStr จะเป็น string เสมอเมื่อมาถึงจุดนี้
        const dayStr = workDate.toISOString().split('T')[0] as string
        uniqueWorkDays.add(dayStr)
      } catch (error) {
        console.error('Error processing attendance record:', att, error)
      }
    })

    // เก็บจำนวนวันที่เข้าทำงานในปีนั้น
    yearlyAttendanceCounts[year] = uniqueWorkDays.size
  }

  // กำหนดสีสำหรับกราฟแท่ง
  const barColor = 'rgba(75, 192, 192, 0.6)'
  const borderColor = 'rgb(75, 192, 192)'

  // สร้างข้อมูลสำหรับกราฟ
  const filteredYears = years.sort()
  // เพิ่ม || 0 เพื่อให้แน่ใจว่าไม่มีค่า undefined
  const workdayCounts = filteredYears.map((year) => yearlyAttendanceCounts[year] || 0)

  // อัปเดตข้อมูลกราฟ
  yearlyAttendanceData.value = {
    labels: filteredYears,
    datasets: [
      {
        label: 'จำนวนวันที่เข้าทำงาน',
        data: workdayCounts,
        backgroundColor: barColor,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  }
}

const barChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      title: {
        display: true,
        text: 'จำนวนวัน',
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
      text: 'จำนวนวันที่เข้าทำงานรายปี',
      font: { size: 18 },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.raw as number
          return `${context.dataset.label}: ${value} วัน`
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
</style>
