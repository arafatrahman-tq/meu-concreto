<template>
  <div class="w-full h-full">
    <Bar
      v-if="chartData.labels && chartData.labels.length > 0"
      :data="chartData"
      :options="chartOptions"
      :style="{ height: height + 'px' }"
    />
    <div v-else class="flex items-center justify-center h-full text-secondary opacity-40">
      <span class="text-sm font-black uppercase tracking-widest">Sem dados</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps<{
  labels: string[];
  data: number[];
  height?: number;
  horizontal?: boolean;
}>();

const chartData = computed(() => ({
  labels: props.labels || [],
  datasets: [{
    label: 'Vendas',
    data: props.data || [],
    backgroundColor: (props.data || []).map((_: number, i: number) => 
      i === 0 ? '#FF7A3D' : `rgba(255, 122, 61, ${Math.max(0.3, 0.7 - i * 0.1)})`
    ),
    borderRadius: 6,
    borderSkipped: false
  }]
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: props.horizontal ? 'y' : 'x',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: 12,
      callbacks: {
        label: (context: any) => `R$ ${(context.parsed.y || context.parsed.x).toLocaleString('pt-BR')}`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => `R$ ${(value/1000).toFixed(0)}k`,
        font: { size: 11 },
        color: '#6B7280'
      },
      grid: { 
        color: 'rgba(107, 114, 128, 0.1)'
      }
    },
    x: {
      ticks: { 
        font: { size: 11 },
        color: '#6B7280'
      },
      grid: { display: false }
    }
  }
}));
</script>
