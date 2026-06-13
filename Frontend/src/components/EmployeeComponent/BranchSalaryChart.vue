<template>
  <div class="chart-box">
    <canvas ref="chartCanvas"></canvas>
    <div v-if="!salaryData || salaryData.length === 0" class="no-data">ไม่มีข้อมูลสำหรับแสดงผล</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, defineProps } from 'vue'
import Chart from 'chart.js/auto'

interface SalaryDataItem {
  label: string
  totalAmount: number
  totalHours: number
}

const props = defineProps<{
  salaryData: SalaryDataItem[]
}>()

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let branchChart: Chart | null = null

const initChart = () => {
  if (!chartCanvas.value) return

  if (branchChart) {
    branchChart.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx || props.salaryData.length === 0) return

  const labels = props.salaryData.map((item) => item.label)
  const amounts = props.salaryData.map((item) => Number(parseFloat(item.totalAmount.toFixed(2))))
  const hours = props.salaryData.map((item) => Number(parseFloat(item.totalHours.toFixed(2))))

  branchChart = new Chart(ctx, {
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
          label: 'ชั่วโมงทำงานรวม',
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
  () => props.salaryData,
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
  height: 400px;
  position: relative;
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
