<template>
  <div>
    <q-card>
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">กราฟแสดงปริมาณสินค้าคงเหลือ</div>
        <q-select
          dense
          outlined
          v-model="selectedRange"
          :options="['รายเดือน', 'รายปี']"
          style="max-width: 150px"
        />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <Bar :data="chartData" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// 📌 กำหนดช่วงเวลาเริ่มต้น
const selectedRange = ref<'รายเดือน' | 'รายปี'>('รายเดือน')

// 📊 ข้อมูลกราฟเริ่มต้น
const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'จำนวน',
      data: [],
      backgroundColor: ['#f44336', '#2196f3', '#4caf50'],
    },
  ],
})

// // 🎯 mock data สำหรับรายเดือนและรายปี
// const monthlyData = {
//   labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.'],
//   data: [40, 25, 35, 45],
// }

// const yearlyData = {
//   labels: ['2564', '2565', '2566', '2567'],
//   data: [300, 280, 340, 390],
// }

// // 🔁 อัปเดต chartData ตามช่วงที่เลือก
// const updateChart = () => {
//   if (selectedRange.value === 'รายเดือน') {
//     chartData.value.labels = monthlyData.labels
//     chartData.value.datasets[0].data = monthlyData.data
//   } else {
//     chartData.value.labels = yearlyData.labels
//     chartData.value.datasets[0].data = yearlyData.data
//   }
// }

// watch(selectedRange, updateChart, { immediate: true })
</script>
