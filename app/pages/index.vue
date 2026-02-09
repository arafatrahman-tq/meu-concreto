<template>
  <div class="flex flex-col gap-6 pb-12" v-if="dashboard">
    <!-- Empresa Selector -->
    <div
      v-if="hasMultipleCompanies"
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-primary/2 p-6 rounded-3xl border border-border"
    >
      <div>
        <h2
          class="text-2xl font-black text-primary tracking-tighter uppercase leading-none"
        >
          Visão Consolidada
        </h2>
        <p
          class="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 mt-1"
        >
          Alternar entre unidades do grupo
        </p>
      </div>

      <div class="flex items-center gap-4 w-full md:w-auto">
        <label
          class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 hidden md:block"
          >Unidade:</label
        >
        <div class="w-full md:w-80">
          <BaseSelect
            v-model="selectedEmpresa"
            :options="empresaOptions"
            placeholder="Selecione a Empresa"
            :icon="Building2"
          />
        </div>
      </div>
    </div>

    <SetupWizard :id-empresa="selectedEmpresa" />

    <!-- Summary Row -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-visible! py-2"
    >
      <StatCard
        label="Faturamento"
        :value="formatCurrency(dashboard.stats.faturamento.total)"
        :trend="dashboard.stats.faturamento.trend"
        :trend-up="dashboard.stats.faturamento.trend?.startsWith('+')"
        :icon="CreditCard"
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
        :trend="dashboard.stats.custos.trend"
        :trend-up="!dashboard.stats.custos.trend?.startsWith('+')"
        :icon="TrendingDown"
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
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-1">
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
      <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
        <MajorExpenses
          :average-monthly="
            formatCurrency(dashboard.stats.custos.operacao / 12)
          "
          :expenses="formattedExpensesList"
          class=""
          style="animation-delay: 0.2s"
        />

        <!-- Operational Intelligence Card -->
        <div
          class="bg-brand rounded-3xl p-10 text-white flex flex-col justify-between relative overflow-hidden group shadow-[0_20px_50px_rgba(var(--color-brand),0.3)] border border-white/10"
          style="animation-delay: 0.3s"
        >
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-8">
              <div
                class="p-2.5 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/10 group-hover:scale-110 transition-transform duration-500"
              >
                <Activity size="20" class="text-white" />
              </div>
              <div class="flex flex-col">
                <span
                  class="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 leading-none"
                  >Live Intelligence</span
                >
                <span class="text-[10px] font-black uppercase text-white mt-1"
                  >Status de Operação</span
                >
              </div>
            </div>
            <h3
              class="text-4xl font-black tracking-tighter mb-4 leading-[0.9] uppercase italic"
            >
              Inteligência<br /><span class="text-white/40">Concreta.</span>
            </h3>
            <p class="text-white/70 text-xs font-bold leading-relaxed max-w-55">
              Otimize sua produção monitorando
              <span class="text-white font-black">volume, FCK e logística</span>
              em tempo real.
            </p>

            <!-- Fiscal Compliance Progress -->
            <div
              class="mt-8 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md"
            >
              <div class="flex justify-between items-end mb-2">
                <span
                  class="text-[9px] font-black uppercase tracking-widest text-white/60"
                  >Conformidade Fiscal</span
                >
                <span class="text-xs font-black text-white tabular-nums"
                  >{{ dashboard.stats.fiscal.percentual }}%</span
                >
              </div>
              <div
                class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"
              >
                <div
                  class="h-full bg-white transition-all duration-1000 ease-out"
                  :style="{ width: `${dashboard.stats.fiscal.percentual}%` }"
                ></div>
              </div>
              <p
                class="text-[8px] font-bold text-white/40 uppercase tracking-tighter mt-2"
              >
                {{ dashboard.stats.fiscal.emitidas }} de
                {{ dashboard.stats.fiscal.total }} notas emitidas
              </p>
            </div>
          </div>

          <div
            class="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-12 gap-4"
          >
            <div class="flex gap-2">
              <NuxtLink
                to="/orcamentos/vendedor"
                class="flex-1 sm:flex-none bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-brand transition-all border border-white/20 text-center flex items-center justify-center gap-2"
              >
                <Smartphone size="14" />
                Mobile
              </NuxtLink>
            </div>
          </div>

          <!-- Decorative Elements -->
          <div
            class="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] group-hover:bg-white/20 transition-all duration-1000"
          ></div>
          <div
            class="absolute -left-20 -bottom-20 w-64 h-64 bg-black/20 rounded-full blur-[80px]"
          ></div>
          <Zap
            class="absolute right-0 top-1/2 -translate-y-1/2 text-white/5 w-56 h-56 rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-all duration-1000 opacity-50"
          />
        </div>
      </div>

      <TeamList
        :people="formattedTeam"
        class="lg:col-span-1 flex-1"
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
} from "lucide-vue-next";
import StatCard from "~/components/dashboard/StatCard.vue";
import OverviewChart from "~/components/dashboard/OverviewChart.vue";
import MajorExpenses from "~/components/dashboard/MajorExpenses.vue";
import ScheduleWidget from "~/components/dashboard/ScheduleWidget.vue";
import TeamList from "~/components/dashboard/TeamList.vue";

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
  () => (listEmpresas.value?.length || 0) > 1,
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
      const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
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
        Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7),
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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
      30,
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
</script>
