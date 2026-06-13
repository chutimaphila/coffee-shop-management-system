<template>
  <div class="chart-box">
    <div class="view-mode-selector" style="margin-bottom: 12px">
      <!-- <label>
        <input type="radio" value="monthly" v-model="viewMode" />
        รายเดือน
      </label>
      <label style="margin-left: 16px">
        <input type="radio" value="yearly" v-model="viewMode" />
        รายปี
      </label> -->
    </div>
    <canvas ref="chartCanvas"></canvas>
    <div v-if="!filteredSalaries || filteredSalaries.length === 0" class="no-data">
      ไม่มีข้อมูลเงินเดือนสำหรับแสดงผล
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, defineProps, computed } from 'vue'
import Chart from 'chart.js/auto'
import type { Salary } from 'src/models'

const props = defineProps({
  filteredSalaries: {
    type: Array as () => Salary[],
    required: true,
  },
})

const viewMode = ref<'monthly' | 'yearly'>('monthly')

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let salaryChart: Chart | null = null

function formatYearMonth(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${month}`
}

function formatYear(date: Date): string {
  return date.getFullYear().toString()
}

const chartData = computed(() => {
  if (!props.filteredSalaries || props.filteredSalaries.length === 0) {
    return {
      labels: [],
      amounts: [],
      hours: [],
    }
  }

  const groupMap = new Map<string, { totalAmount: number; totalHours: number }>()

  props.filteredSalaries.forEach((salary) => {
    let dateObj: Date
    if (typeof salary.salary_date === 'string') {
      dateObj = new Date(salary.salary_date)
    } else {
      dateObj = new Date(salary.salary_date)
    }

    let key = ''
    if (viewMode.value === 'monthly') {
      key = formatYearMonth(dateObj)
    } else {
      key = formatYear(dateObj)
    }

    if (!groupMap.has(key)) {
      groupMap.set(key, { totalAmount: 0, totalHours: 0 })
    }
    const group = groupMap.get(key)!
    group.totalAmount += Number(salary.total_amount)
    group.totalHours += Number(salary.working_hours)
  })

  const sortedKeys = Array.from(groupMap.keys()).sort()

  const labels = sortedKeys
  const amounts = sortedKeys.map((key) => parseFloat(groupMap.get(key)!.totalAmount.toFixed(2)))
  const hours = sortedKeys.map((key) => parseFloat(groupMap.get(key)!.totalHours.toFixed(2)))

  return {
    labels,
    amounts,
    hours,
  }
})

const initChart = () => {
  if (!chartCanvas.value) return

  if (salaryChart) {
    salaryChart.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  const { labels, amounts, hours } = chartData.value

  salaryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'ค่าจ้างรวม (บาท)',
          data: amounts,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'ชั่วโมงทำงาน',
          data: hours,
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          type: 'line',
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'จำนวนเงิน (บาท)',
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'ชั่วโมงทำงาน',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    },
  })
}

watch(
  () => [props.filteredSalaries, viewMode.value],
  () => {
    initChart()
  },
  { deep: true },
)

onMounted(() => {
  initChart()
})
</script>

<style scoped>
.chart-box {
  width: 100%;
  height: 300px;
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  box-sizing: border-box;
}

.no-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #999;
  font-style: italic;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
