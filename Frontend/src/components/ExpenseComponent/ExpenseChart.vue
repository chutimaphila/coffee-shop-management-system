<template>
  <div>
    <Bar :data="chartData" :options="chartOptions" />
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
import { useExpenseStore } from 'src/stores/expenseStore'

// ลงทะเบียน component และ plugin ที่จำเป็น
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const store = useExpenseStore()

// คำนวณข้อมูลกราฟจาก expenses
const chartData = computed<ChartData<'bar'>>(() => {
  const grouped: Record<string, number[]> = {}
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
  const branches = [...new Set(store.expenses.map((e) => e.branch))]

  // เตรียม array ยอดรวมรายเดือนให้แต่ละสาขา
  for (const branch of branches) {
    grouped[branch] = new Array(12).fill(0)
  }

  // รวมค่าใช้จ่ายในแต่ละเดือนตามสาขา
  store.expenses.forEach((exp) => {
    const date = new Date(exp.datetime)
    const month = date.getMonth()
    const branch = exp.branch
    const amount = Number(exp.amount)

    const group = grouped[branch]
    if (!group || isNaN(amount)) return

    if (typeof group[month] === 'number') {
      group[month] += amount
    }
  })

  return {
    labels: months.map((m) => `เดือน ${m}`),
    datasets: branches.map((branch, index) => ({
      label: branch,
      backgroundColor: `hsl(${index * 70}, 70%, 60%)`,
      data: grouped[branch] as number[],
    })),
  }
})

// ตัวเลือกของ chart.js
const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'สรุปค่าใช้จ่ายรายเดือนตามสาขา',
    },
  },
}
</script>
