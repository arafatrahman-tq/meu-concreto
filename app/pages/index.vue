<template>
  <div class="flex flex-col gap-10 pb-16" v-if="dashboard">
    <!-- Visão Consolidada Header -->
    <div
      v-if="hasMultipleCompanies"
      class="relative overflow-hidden group bg-surface rounded-3xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.04)]"
    >
      <!-- Background Elements -->
      <div
        class="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
      ></div>
      <div
        class="absolute -right-20 -top-20 w-64 h-64 bg-brand/5 rounded-full blur-[80px]"
      ></div>

      <div
        class="relative z-10 flex flex-col lg:flex-row justify-between items-stretch lg:items-center"
      >
        <!-- Text Section -->
        <div
          class="p-8 sm:p-10 lg:pr-0 flex-1 border-b lg:border-b-0 lg:border-r border-border/50"
        >
          <div class="flex items-center gap-4 mb-4">
            <div
              class="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand shadow-sm border border-brand/10"
            >
              <Globe2 size="24" stroke-width="2.5" />
            </div>
            <div>
              <h2
                class="text-2xl sm:text-4xl font-black text-primary tracking-tighter uppercase leading-none mt-1"
              >
                Visão Consolidada
              </h2>
            </div>
          </div>
          <p
            class="text-secondary/60 text-xs font-medium max-w-md leading-relaxed"
          >
            Monitore o desempenho global do seu grupo econômico e alterne entre
            unidades para uma gestão estratégica e unificada.
          </p>
        </div>

        <!-- Action Section -->
        <div
          class="p-8 sm:p-10 bg-primary/1 flex flex-col sm:flex-row items-stretch sm:items-center gap-8 min-w-fit lg:min-w-112.5"
        >
          <div class="flex flex-col gap-1">
            <span
              class="text-[10px] font-black uppercase tracking-widest text-secondary/40"
              >Selecione a Unidade</span
            >
            <div class="relative group/select">
              <BaseSelect
                v-model="selectedEmpresa"
                :options="empresaOptions"
                placeholder="Selecione a Unidade Operacional"
                :icon="Building2"
                class="bg-surface! border-border/60! hover:border-brand/30! transition-all h-14! rounded-2xl! text-sm! font-bold! shadow-sm"
              />
            </div>
          </div>

          <!-- Summary Mini Stats -->
          <div
            class="hidden sm:flex items-center gap-6 pl-6 border-l border-border/50"
          >
            <div class="flex flex-col">
              <span
                class="text-[10px] font-black uppercase tracking-widest text-secondary/30"
                >Unidades</span
              >
              <span class="text-2xl font-black text-primary">{{
                empresaOptions.length - 1
              }}</span>
            </div>
            <div class="w-px h-8 bg-border/50"></div>
            <div class="flex flex-col">
              <span
                class="text-[10px] font-black uppercase tracking-widest text-secondary/30"
                >Status</span
              >
              <div class="flex items-center gap-2 mt-1">
                <div
                  class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-tighter border border-emerald-500/10"
                >
                  Online
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <SetupWizard :id-empresa="selectedEmpresa" />

    <!-- Summary Row -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 overflow-visible! py-2"
    >
      <StatCard
        label="Faturamento"
        :value="formatCurrency(dashboard.stats.faturamento.total)"
        :subtext="
          'Ticket Médio: ' +
          formatCurrency(dashboard.stats.faturamento.ticketMedio)
        "
        :trend="dashboard.stats.faturamento.trend"
        :trend-up="dashboard.stats.faturamento.trend?.startsWith('+')"
        :icon="CreditCard"
      />
      <StatCard
        label="Volume Total"
        :value="formatNumber(dashboard.stats.volume.total) + ' m³'"
        :trend="dashboard.stats.volume.trend"
        :trend-up="dashboard.stats.volume.trend?.startsWith('+')"
        :icon="Layers"
      />
      <StatCard
        label="Pedidos Realizados"
        :value="dashboard.stats.pedidos.realizados"
        :trend="dashboard.stats.pedidos.trend"
        :trend-up="dashboard.stats.pedidos.trend?.startsWith('+')"
        :icon="FileStack"
      />
      <StatCard
        label="Custos Operacionais"
        :value="formatCurrency(dashboard.stats.custos.operacao)"
        :subtext="'Margem Bruta: ' + grossMargin + '%'"
        :trend="dashboard.stats.custos.trend"
        :trend-up="!dashboard.stats.custos.trend?.startsWith('+')"
        :icon="Wallet"
      />
      <StatCard
        label="Receita Disponível"
        :value="formatCurrency(dashboard.stats.faturamento.disponivel)"
        :trend="dashboard.stats.faturamento.trend"
        :trend-up="dashboard.stats.faturamento.trend?.startsWith('+')"
        :icon="CheckCircle2"
      />
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 flex-1">
      <!-- Row 1: Chart & Schedule -->
      <OverviewChart
        v-model:period="currentPeriod"
        :data="formattedChartData"
        class="lg:col-span-2"
        style="animation-delay: 0.1s"
      />
      <ScheduleWidget
        :events="formattedEvents"
        class="lg:col-span-1"
        style="animation-delay: 0.4s"
      />

      <!-- Row 2: Bottom Details -->
      <MajorExpenses
        :average-monthly="formatCurrency(dashboard.stats.custos.operacao / 12)"
        :expenses="formattedExpensesList"
        class="lg:col-span-1"
        style="animation-delay: 0.2s"
      />

      <OperationalIntelligence
        :stats="dashboard.stats"
        class="lg:col-span-1"
        style="animation-delay: 0.3s"
      />

      <TeamList
        :people="formattedTeam"
        class="lg:col-span-1"
        style="animation-delay: 0.5s"
      />
    </div>
  </div>

  <!-- Loading/Error State -->
  <div
    v-if="pending || fetchError"
    class="flex flex-col items-center justify-center min-h-[60vh] gap-4"
  >
    <template v-if="fetchError">
      <div
        class="p-6 bg-rose-50 dark:bg-rose-500/10 rounded-3xl border border-rose-100 dark:border-rose-500/20 text-center max-w-md"
      >
        <p
          class="text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest mb-4"
        >
          Erro ao Carregar Dashboard
        </p>
        <p class="text-sm font-medium text-secondary opacity-60 mb-6">
          {{
            fetchError.data?.statusMessage ||
            fetchError.message ||
            "Erro de conexão com o servidor"
          }}
        </p>
        <button
          @click="refresh"
          class="px-8 py-3 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    </template>
    <template v-else>
      <div
        class="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin mb-4"
      ></div>
      <p
        class="text-[10px] font-black uppercase tracking-widest text-primary opacity-20"
      >
        Sincronizando Dashboard...
      </p>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useCookie, useFetch, useAuth } from "#imports";
import {
  FileStack,
  Clock,
  CheckCircle2,
  CreditCard,
  TrendingDown,
  Activity,
  Zap,
  Building2,
  Smartphone,
  Layers,
  Globe2,
  Wallet,
} from "lucide-vue-next";
import StatCard from "~/components/dashboard/StatCard.vue";
import OverviewChart from "~/components/dashboard/OverviewChart.vue";
import MajorExpenses from "~/components/dashboard/MajorExpenses.vue";
import ScheduleWidget from "~/components/dashboard/ScheduleWidget.vue";
import TeamList from "~/components/dashboard/TeamList.vue";
import OperationalIntelligence from "~/components/dashboard/OperationalIntelligence.vue";

definePageMeta({
  layout: "default",
});

const { user } = useAuth();
const currentPeriod = ref("monthly");
const selectedEmpresa = ref(user.value?.idEmpresa);

// Buscar empresas que o usuário tem acesso
const { data: listEmpresas } = useFetch("/api/empresas", {
  immediate: !!user.value,
});

const hasMultipleCompanies = computed(
  () => (listEmpresas.value?.length || 0) > 1 && user.value?.admin === 1
);

const empresaOptions = computed(() => {
  if (!listEmpresas.value) return [];
  return listEmpresas.value.map((e) => ({
    label: e.filial ? `${e.empresa} - ${e.filial}` : e.empresa,
    value: e.id,
    logo: e.logo,
  }));
});

const {
  data: dashboard,
  error: fetchError,
  pending,
  refresh,
} = await useFetch("/api/dashboard", {
  server: true,
  query: computed(() => ({
    period: currentPeriod.value,
    idEmpresa: selectedEmpresa.value,
  })),
  watch: [currentPeriod, selectedEmpresa],
});

const grossMargin = computed(() => {
  if (!dashboard.value?.stats?.faturamento?.total) return 0;
  const faturamento = dashboard.value.stats.faturamento.total;
  const custos = dashboard.value.stats.custos.operacao;
  return Math.round(((faturamento - custos) / faturamento) * 100);
});

const formattedChartData = computed(() => {
  if (!dashboard.value?.chart) return [];

  const period = currentPeriod.value;
  const rawData = dashboard.value.chart;
  let fullData = [];

  // Usamos useState para garantir que 'now' seja idêntico entre server e client na hidratação
  const now = useState("dashboard_now", () => new Date()).value;

  if (period === "daily") {
    // Gerar últimos 7 dias
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = `${String(d.getDate()).padStart(2, "0")}/${String(
        d.getMonth() + 1
      ).padStart(2, "0")}`;
      const found = rawData.find((item) => item.label === label);
      fullData.push({ label, total: found ? found.total : 0 });
    }
  } else if (period === "weekly") {
    // Gerar últimas 8 semanas
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i * 7);
      // Cálculo simplificado de semana para bater com strftime %W do SQLite
      const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
      const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
      const weekNum = String(
        Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
      ).padStart(2, "0");
      const label = `Sem ${weekNum}`;
      const found = rawData.find((item) => item.label === label);
      fullData.push({ label, total: found ? found.total : 0 });
    }
  } else {
    // Mensal: Meses do ano atual até o atual
    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    const currentMonth = now.getMonth() + 1;
    for (let i = 1; i <= 12; i++) {
      const label = String(i).padStart(2, "0");
      const found = rawData.find((item) => item.label === label);
      fullData.push({
        label: monthNames[i - 1],
        total: found ? found.total : 0,
      });
    }
  }

  const values = fullData.map((c) => c.total || 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  return fullData.map((c) => ({
    label: c.label,
    value: c.total || 0,
    height: Math.round(((c.total - min) / range) * 100),
  }));
});

const getLocalDateStr = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

const formattedEvents = computed(() => {
  if (!dashboard.value?.recentDeliveries) return [];
  return dashboard.value.recentDeliveries.map((d) => ({
    id: d.id,
    title: d.nomeCliente,
    date: getLocalDateStr(d.dataEntrega),
    time: d.dataEntrega
      ? new Date(d.dataEntrega).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "08:00",
    location: (d.enderecoEntrega || d.bairro || "Bairro Não Inf.").substring(
      0,
      30
    ),
    tag:
      d.vendaStatus === "NF_EMITIDA"
        ? "DOC. EMITIDO"
        : d.status === "APROVADO"
        ? "CONCLUÍDO"
        : "AGENDADO",
    status:
      d.vendaStatus === "NF_EMITIDA" || d.status === "APROVADO"
        ? "done"
        : "pending",
    hasNf: !!d.vendaNfse,
  }));
});

const formattedExpensesList = computed(() => {
  if (!dashboard.value?.majorExpenses) return [];
  const total = dashboard.value.stats.custos.operacao || 1;
  return dashboard.value.majorExpenses.map((e) => ({
    name: e.name,
    percentage: Math.round((e.value / total) * 100),
  }));
});

const formattedTeam = computed(() => {
  if (!dashboard.value?.teamRanking) return [];
  return dashboard.value.teamRanking.map((item) => ({
    id: item.id,
    name: item.nome,
    vendasCount: item.vendasCount,
    totalFormatted: formatCurrency(item.total),
    orcamentosCount: item.orcamentosCount,
  }));
});

const formatCurrency = (value) => {
  if (!value) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
};

const formatNumber = (value) => {
  if (!value) return "0";
  return new Intl.NumberFormat("pt-BR").format(value);
};
</script>
