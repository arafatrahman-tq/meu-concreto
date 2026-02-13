<template>
  <div class="w-full max-w-7xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-primary uppercase tracking-tight">
          Dashboard BI
        </h1>
        <p class="text-secondary/60 text-xs font-medium mt-1">
          Análise de vendas e performance
        </p>
      </div>
      <div class="flex items-center gap-3">
        <select
          v-model="periodoSelecionado"
          class="px-4 py-3 bg-surface border border-border/60 rounded-2xl text-sm font-bold text-primary focus:border-brand/30 focus:outline-none transition-all hover:border-brand/30"
          @change="carregarDados"
        >
          <option value="7d">
            Últimos 7 dias
          </option>
          <option value="30d">
            Últimos 30 dias
          </option>
          <option value="90d">
            Últimos 90 dias
          </option>
          <option value="6m">
            Últimos 6 meses
          </option>
          <option value="1a">
            Último ano
          </option>
        </select>
        <button
          :disabled="carregando || !dadosCompletos"
          class="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-sm"
          @click="exportarPDF"
        >
          <Download class="w-4 h-4" />
          Exportar PDF
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="carregando"
      class="flex items-center justify-center py-20"
    >
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin mx-auto mb-4" />
        <p class="text-[10px] font-black uppercase tracking-widest text-primary/20">
          Carregando dados...
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="erro"
      class="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-3xl p-8 text-center"
    >
      <AlertCircle class="w-12 h-12 text-rose-500 mx-auto mb-4" />
      <h3 class="text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest mb-2">
        Erro ao carregar dados
      </h3>
      <p class="text-sm font-medium text-secondary/60 mb-6">
        {{ erro }}
      </p>
      <button
        class="px-8 py-3 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
        @click="carregarDados"
      >
        Tentar novamente
      </button>
    </div>

    <!-- Dashboard Content -->
    <div
      v-else-if="dadosCompletos"
      class="space-y-8"
    >
      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="(kpi, index) in kpisList"
          :key="index"
          class="group bg-surface rounded-3xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.02)] p-6 transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.04)] hover:border-brand/30"
        >
          <div class="flex items-start justify-between mb-4">
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border"
              :class="kpi.iconBgClass"
            >
              <component
                :is="kpi.icon"
                class="w-6 h-6"
                :class="kpi.iconColorClass"
              />
            </div>
            <span
              v-if="kpi.trend !== undefined"
              class="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full"
              :class="kpi.trend >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'"
            >
              <TrendingUp
                v-if="kpi.trend >= 0"
                class="w-3 h-3"
              />
              <TrendingDown
                v-else
                class="w-3 h-3"
              />
              {{ Math.abs(kpi.trend || 0) }}%
            </span>
          </div>
          <p class="text-[10px] font-black uppercase tracking-widest text-secondary/40 mb-1">
            {{ kpi.label }}
          </p>
          <p class="text-2xl font-black text-primary tracking-tight">
            {{ kpi.value }}
          </p>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Vendas por Período -->
        <div class="lg:col-span-2 bg-surface rounded-3xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.02)] p-6 transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.04)]">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <TrendingUp class="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 class="text-lg font-black text-primary tracking-tight">
                Vendas por Período
              </h3>
              <p class="text-[10px] font-black uppercase tracking-widest text-secondary/40">
                Evolução das vendas no período selecionado
              </p>
            </div>
          </div>
          <ClientOnly>
            <div class="h-75">
              <LineChart
                :labels="vendasLabels"
                :datasets="vendasDatasets"
                :height="300"
              />
            </div>
            <template #fallback>
              <div class="flex items-center justify-center h-75">
                <div class="w-8 h-8 border-4 border-brand/20 border-t-brand rounded-full animate-spin mr-3" />
                <span class="text-[10px] font-black uppercase tracking-widest text-secondary/40">
                  Carregando gráfico...
                </span>
              </div>
            </template>
          </ClientOnly>
        </div>

        <!-- Status dos Orçamentos -->
        <div class="bg-surface rounded-3xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.02)] p-6 transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.04)]">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <PieChartIcon class="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 class="text-lg font-black text-primary tracking-tight">
                Status
              </h3>
              <p class="text-[10px] font-black uppercase tracking-widest text-secondary/40">
                Distribuição dos orçamentos
              </p>
            </div>
          </div>
          <ClientOnly>
            <div class="h-62.5">
              <PieChart
                :labels="statusOrcamentos?.map(s => s.status) || []"
                :data="statusOrcamentos?.map(s => s.quantidade) || []"
                :colors="statusColors"
              />
            </div>
            <template #fallback>
              <div class="flex items-center justify-center h-62.5">
                <div class="w-8 h-8 border-4 border-brand/20 border-t-brand rounded-full animate-spin mr-3" />
                <span class="text-[10px] font-black uppercase tracking-widest text-secondary/40">
                  Carregando...
                </span>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>

      <!-- Rankings -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Top Vendedores -->
        <div class="bg-surface rounded-3xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.02)] p-6 transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.04)]">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <Award class="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 class="text-lg font-black text-primary tracking-tight">
                Top Vendedores
              </h3>
              <p class="text-[10px] font-black uppercase tracking-widest text-secondary/40">
                Ranking de performance
              </p>
            </div>
          </div>
          <ClientOnly>
            <div class="h-62.5">
              <BarChart
                :labels="topVendedores?.map(v => v.nomeVendedor) || []"
                :data="topVendedores?.map(v => Math.round(v.valorTotal / 100)) || []"
                :horizontal="true"
                :height="250"
              />
            </div>
            <template #fallback>
              <div class="flex items-center justify-center h-62.5">
                <div class="w-8 h-8 border-4 border-brand/20 border-t-brand rounded-full animate-spin mr-3" />
                <span class="text-[10px] font-black uppercase tracking-widest text-secondary/40">
                  Carregando...
                </span>
              </div>
            </template>
          </ClientOnly>
        </div>

        <!-- Top Clientes -->
        <div class="bg-surface rounded-3xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.02)] p-6 transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.04)]">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <Building2 class="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 class="text-lg font-black text-primary tracking-tight">
                Top Clientes
              </h3>
              <p class="text-[10px] font-black uppercase tracking-widest text-secondary/40">
                Clientes com maior volume
              </p>
            </div>
          </div>
          <div class="space-y-3">
            <div
              v-for="(cliente, index) in topClientes?.slice(0, 5) || []"
              :key="cliente.idCliente"
              class="flex items-center gap-4 p-4 bg-primary/1 rounded-2xl border border-border/50 hover:border-brand/30 transition-all group"
            >
              <div class="shrink-0 w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center font-black text-brand text-sm group-hover:scale-110 transition-transform">
                {{ index + 1 }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-primary truncate">
                  {{ cliente.nomeCliente }}
                </p>
                <p class="text-[10px] font-black uppercase tracking-widest text-secondary/40">
                  {{ cliente.totalCompras }} compras
                </p>
              </div>
              <div class="text-right">
                <p class="font-black text-primary">
                  {{ formatarMoeda(cliente.valorTotal) }}
                </p>
              </div>
            </div>
            <div
              v-if="!topClientes?.length"
              class="text-center py-8"
            >
              <Users class="w-12 h-12 text-secondary/20 mx-auto mb-3" />
              <p class="text-[10px] font-black uppercase tracking-widest text-secondary/40">
                Nenhum cliente encontrado
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="bg-surface border border-dashed border-border/60 rounded-3xl p-12 text-center"
    >
      <BarChart3 class="w-16 h-16 text-secondary/20 mx-auto mb-4" />
      <h3 class="text-lg font-black text-primary mb-2">
        Nenhum dado disponível
      </h3>
      <p class="text-[10px] font-black uppercase tracking-widest text-secondary/40">
        Não há dados suficientes para exibir o dashboard.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  DollarSign,
  Receipt,
  Percent,
  Users,
  TrendingUp,
  TrendingDown,
  Download,
  Loader2,
  AlertCircle,
  PieChart as PieChartIcon,
  Award,
  Building2,
  BarChart3,
} from 'lucide-vue-next'
import LineChart from '~/components/charts/LineChart.vue'
import PieChart from '~/components/charts/PieChart.vue'
import BarChart from '~/components/charts/BarChart.vue'
import { useToast } from '~/composables/useToast'
import { exportarDashboardPDF } from '~/utils/pdfExport'

definePageMeta({
  layout: 'default',
})

const toast = useToast()
const periodoSelecionado = ref('30d')
const carregando = ref(false)
const erro = ref<string | null>(null)

const kpis = ref<KpisDashboard | null>(null)
const vendasPorPeriodo = ref<VendaPorPeriodo[] | null>(null)
const topVendedores = ref<VendaPorVendedor[] | null>(null)
const topClientes = ref<VendaPorCliente[] | null>(null)
const statusOrcamentos = ref<StatusOrcamento[] | null>(null)

const dadosCompletos = computed(() => {
  return kpis.value && vendasPorPeriodo.value && topVendedores.value && topClientes.value && statusOrcamentos.value
})

const kpisList = computed(() => [
  {
    label: 'Total em Vendas',
    value: formatarMoeda(kpis.value?.valorTotalVendas || 0),
    trend: kpis.value?.crescimentoValor,
    icon: DollarSign,
    iconBgClass: 'bg-brand/10 border-brand/10',
    iconColorClass: 'text-brand',
  },
  {
    label: 'Ticket Médio',
    value: formatarMoeda(kpis.value?.ticketMedio || 0),
    trend: kpis.value?.crescimentoVendas,
    icon: Receipt,
    iconBgClass: 'bg-blue-500/10 border-blue-500/10',
    iconColorClass: 'text-blue-500',
  },
  {
    label: 'Taxa de Conversão',
    value: (kpis.value?.taxaConversao || 0) + '%',
    icon: Percent,
    iconBgClass: 'bg-emerald-500/10 border-emerald-500/10',
    iconColorClass: 'text-emerald-500',
  },
  {
    label: 'Novos Clientes',
    value: String(kpis.value?.novosClientes || 0),
    icon: Users,
    iconBgClass: 'bg-purple-500/10 border-purple-500/10',
    iconColorClass: 'text-purple-500',
  },
])

const vendasLabels = computed(() => {
  if (!vendasPorPeriodo.value) return []
  return vendasPorPeriodo.value.map(v => v.periodo)
})

const vendasDatasets = computed(() => {
  if (!vendasPorPeriodo.value) return []
  return [{
    label: 'Vendas',
    data: vendasPorPeriodo.value.map(v => v.valorTotal / 100),
    borderColor: '#FF7A3D',
    backgroundColor: 'rgba(255, 122, 61, 0.1)',
    fill: true,
    tension: 0.4,
  }]
})

const statusColors = ['#FF7A3D', '#10B981', '#3B82F6', '#F59E0B', '#EF4444']

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor / 100)
}

async function carregarDados() {
  carregando.value = true
  erro.value = null

  try {
    const query = `?periodo=${periodoSelecionado.value}`

    const [kpisRes, vendasRes, vendedoresRes, clientesRes, statusRes] = await Promise.all([
      $fetch(`/api/bi/kpis${query}`),
      $fetch(`/api/bi/vendas-por-periodo${query}`),
      $fetch(`/api/bi/vendas-por-vendedor${query}`),
      $fetch(`/api/bi/vendas-por-cliente${query}`),
      $fetch(`/api/bi/status-orcamentos${query}`),
    ])

    kpis.value = kpisRes as KpisDashboard
    vendasPorPeriodo.value = vendasRes as VendaPorPeriodo[]
    topVendedores.value = vendedoresRes as VendaPorVendedor[]
    topClientes.value = clientesRes as VendaPorCliente[]
    statusOrcamentos.value = statusRes as StatusOrcamento[]
  }
  catch (error: any) {
    console.error('Erro ao carregar dados:', error)
    erro.value = error?.data?.message || error?.message || 'Erro ao carregar dados do dashboard'
    toast.add({ title: 'Erro ao carregar dados', description: erro.value, type: 'error' })
  }
  finally {
    carregando.value = false
  }
}

function exportarPDF() {
  if (!dadosCompletos.value) return

  try {
    exportarDashboardPDF({
      kpis: kpis.value,
      vendasPorPeriodo: vendasPorPeriodo.value,
      topVendedores: topVendedores.value,
      topClientes: topClientes.value,
      statusOrcamentos: statusOrcamentos.value,
      periodo: periodoSelecionado.value,
    })
    toast.add('PDF exportado com sucesso!', 'success')
  }
  catch (error) {
    console.error('Erro ao exportar PDF:', error)
    toast.add({ title: 'Erro ao exportar PDF', type: 'error' })
  }
}

onMounted(() => {
  carregarDados()
})
</script>
