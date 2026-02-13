<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex-1 relative">
      <Doughnut
        v-if="chartData.labels && chartData.labels.length > 0"
        :data="chartData"
        :options="chartOptions"
      />
      <div
        v-else
        class="flex items-center justify-center h-full text-secondary opacity-40"
      >
        <span class="text-sm font-black uppercase tracking-widest">Sem dados</span>
      </div>
    </div>
    <div
      v-if="chartData.labels && chartData.labels.length > 0"
      class="mt-4 flex flex-wrap justify-center gap-3"
    >
      <div
        v-for="(label, index) in chartData.labels"
        :key="String(label)"
        class="flex items-center gap-2"
      >
        <div
          class="w-3 h-3 rounded-full"
          :style="{ backgroundColor: chartData.datasets[0].backgroundColor[index] }"
        />
        <span class="text-xs font-bold text-secondary">
          {{ label }} ({{ chartData.datasets[0].data[index] }})
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps<{
  labels: string[]
  data: number[]
  colors?: string[]
}>()

const defaultColors = ['#FF7A3D', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']

const chartData = computed(() => ({
  labels: props.labels || [],
  datasets: [{
    data: props.data || [],
    backgroundColor: props.colors || defaultColors,
    borderWidth: 0,
    hoverOffset: 4,
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: 12,
      callbacks: {
        label: (context: any) => {
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentual = ((context.parsed / total) * 100).toFixed(1)
          return `${context.label}: ${context.parsed} (${percentual}%)`
        },
      },
    },
  },
}
</script>
