<template>
  <div class="q-pa-md">
    <h6 class="q-mb-md">สรุปค่าใช้จ่ายรายปี</h6>
    <div
      class="chart-container"
      style="
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      "
    >
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { useExpenseStore } from 'src/stores/expenseStore'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { useAuthStore } from 'src/stores/authStore'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const store = useExpenseStore()
const authStore = useAuthStore()

// กำหนดปีที่ต้องการดูสรุป (ย้อนหลัง 5 ปี)
const years = ref([2021, 2022, 2023, 2024, 2025])

// ฟังก์ชั่นในการดึงข้อมูลและแปลงเป็นกราฟ
const chartData = computed(() => {
  const groupedByYear: Record<number, { 'สาขา 1': number; 'สาขา 2': number }> = {}

  // เริ่มต้นกลุ่มข้อมูลตามปี
  years.value.forEach((year) => {
    groupedByYear[year] = { 'สาขา 1': 0, 'สาขา 2': 0 }
  })

  // Get current user from the auth store
  const currentUser = computed(() => authStore.user)

  let filteredExpenses = store.expenses

  // If the current user is an Admin, filter expenses by their branch
  const isAdmin = computed(() => currentUser.value?.role?.name === 'Admin')
  const isOwner = computed(() => currentUser.value?.role?.name === 'Owner')

  if (isAdmin.value) {
    filteredExpenses = store.expenses.filter(
      (exp) => exp.branch === currentUser.value?.branch?.name,
    )
  } else if (!isOwner.value) {
    // If it's not Owner, limit access to User's own branch
    filteredExpenses = store.expenses.filter(
      (exp) => exp.branch === currentUser.value?.branch?.name,
    )
  }

  filteredExpenses.forEach((exp) => {
    const expYear = new Date(exp.datetime).getFullYear()
    // Ensure groupedByYear[expYear] is initialized before accessing it
    if (years.value.includes(expYear)) {
      // Initialize the year object if not already initialized
      if (!groupedByYear[expYear]) {
        groupedByYear[expYear] = { 'สาขา 1': 0, 'สาขา 2': 0 }
      }

      // Safely update the amount based on the branch
      if (exp.branch === 'สาขา 1') {
        groupedByYear[expYear]['สาขา 1'] += exp.amount
      } else if (exp.branch === 'สาขา 2') {
        groupedByYear[expYear]['สาขา 2'] += exp.amount
      }
    }
  })

  return {
    labels: years.value, // แสดงปีในแกน X
    datasets: [
      {
        label: 'สาขา 1',
        backgroundColor: 'rgba(255, 99, 132, 0.6)', // Red color for branch 1
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        // Use safe access to avoid undefined errors
        data: years.value.map((year) => (groupedByYear[year] ? groupedByYear[year]['สาขา 1'] : 0)),
      },
      {
        label: 'สาขา 2',
        backgroundColor: 'rgba(255, 159, 64, 0.6)', // Yellow color for branch 2
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        // Use safe access to avoid undefined errors
        data: years.value.map((year) => (groupedByYear[year] ? groupedByYear[year]['สาขา 2'] : 0)),
      },
    ],
  }
})

// กำหนดการตั้งค่ากราฟ
const chartOptions = computed(() => ({
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: 'สรุปค่าใช้จ่ายรายปี',
    },
    legend: {
      display: true,
      position: 'top' as const, // Corrected position to a valid value
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'ปี',
      },
    },
    y: {
      title: {
        display: true,
        text: 'จำนวนค่าใช้จ่าย (บาท)',
      },
      beginAtZero: true,
    },
  },
}))
</script>

<style scoped>
/* Add custom styles for the chart container */
.chart-container {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
