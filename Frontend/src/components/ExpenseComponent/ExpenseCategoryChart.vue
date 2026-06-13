<template>
  <q-card flat bordered class="q-mb-lg q-pa-md shadow-1" style="background-color: #ffffff">
    <q-card-section class="q-pb-sm">
      <div class="text-h6">{{ title }}</div>
    </q-card-section>
    <div style="width: 100%; max-width: 100%; overflow-x: auto">
      <Bar :data="chartData" :options="chartOptions" style="min-height: 300px" />
    </div>
  </q-card>
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
import type { Expense } from 'src/stores/expenseStore'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  title: string
  expenses: Expense[]
  typeFilter: string | null
}>()

const chartData = computed<ChartData<'bar'>>(() => {
  const grouped: Record<string, number[]> = {}
  const months = Array.from({ length: 12 }, (_, i) => i)
  const branches = [...new Set(props.expenses.map((e) => e.branch))]

  for (const branch of branches) {
    grouped[branch] = new Array(12).fill(0)
  }

  props.expenses.forEach((exp) => {
    if (props.typeFilter && exp.type !== props.typeFilter) return
    const month = new Date(exp.datetime).getMonth()
    const amount = Number(exp.amount)
    const group = grouped[exp.branch]
    if (group && typeof group[month] === 'number' && !isNaN(amount)) {
      group[month] += amount
    }
  })

  return {
    labels: months.map((m) => `เดือน ${String(m + 1).padStart(2, '0')}`),
    datasets: branches.map((branch, i) => ({
      label: branch,
      backgroundColor: `hsl(${i * 60}, 70%, 60%)`,
      data: grouped[branch] ?? [],
    })),
  }
})

const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    title: { display: false },
  },
  scales: {
    y: {
      ticks: {
        font: {
          size: 12,
        },
      },
      title: {
        display: true,
        text: 'จำนวนเงิน (บาท)',
      },
    },
    x: {
      ticks: {
        font: {
          size: 12,
        },
      },
    },
  },
}
</script>
