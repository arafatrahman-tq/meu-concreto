<template>
  <div class="w-full h-full">
    <Line
      v-if="chartData.labels && chartData.labels.length > 0"
      :data="chartData"
      :options="chartOptions"
      :style="{ height: height + 'px' }"
    />
    <div
      v-else
      class="flex items-center justify-center h-full text-secondary opacity-40"
    >
      <span class="text-sm font-black uppercase tracking-widest">Sem dados</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler)

interface Dataset {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
  fill?: boolean
  tension?: number
}

const props = defineProps<{
  labels: string[]
  datasets: Dataset[]
  height?: number
}>()

const chartData = computed(() => ({
  labels: props.labels || [],
  datasets: props.datasets || [],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: 12,
      titleFont: { size: 13, weight: 'bold' },
      bodyFont: { size: 12 },
      callbacks: {
        label: (context: any) => `R$ ${context.parsed.y.toLocaleString('pt-BR')}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => `R$ ${(value / 1000).toFixed(0)}k`,
        font: { size: 11 },
        color: '#6B7280',
      },
      grid: {
        color: 'rgba(107, 114, 128, 0.1)',
      },
    },
    x: {
      ticks: {
        font: { size: 11 },
        color: '#6B7280',
      },
      grid: { display: false },
    },
  },
}
</script>
