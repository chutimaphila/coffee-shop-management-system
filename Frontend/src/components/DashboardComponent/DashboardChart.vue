<template>
  <div>
    <!-- กราฟยอดขายรายเดือน -->
    <div class="chart-box q-mb-xl">
      <Bar :data="monthlyData" :options="monthlyOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { computed } from 'vue'
import { useOrderStore } from 'src/stores/orderStore'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const store = useOrderStore()

// === กราฟยอดขายรายเดือน (ย้อนหลัง 12 เดือน) ===
const monthlyData = computed<ChartData<'bar'>>(() => {
  const data = new Array(12).fill(0)
  const currentYear = new Date().getFullYear()

  store.orders.forEach((order) => {
    if (!order.createdAt) return
    const date = new Date(order.createdAt)
    const year = date.getFullYear()
    const monthIndex = date.getMonth()
    const total = Number(order.total)

    if (!isNaN(total) && year === currentYear) {
      data[monthIndex] += total
    }
  })

  return {
    labels: [
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
    ],
    datasets: [
      {
        label: 'ยอดขายรายเดือน (บาท)',
        data,
        backgroundColor: '#42a5f5',
      },
    ],
  }
})

const monthlyOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'สถิติยอดขายทั้ง 12 เดือน',
      font: { size: 24 },
    },
  },
}
</script>

<style scoped>
.chart-box {
  width: 100%;
  height: 400px;
  position: relative;
  background: white; /* พื้นหลังขาว */
  border-radius: 12px; /* มุมโค้ง */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* เงาเบาๆ */
  padding: 16px; /* ระยะห่างภายใน */
  box-sizing: border-box;
}
canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
