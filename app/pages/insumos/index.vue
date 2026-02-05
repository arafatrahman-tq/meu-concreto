<template>
  <div class="flex flex-col gap-6 animate-enter">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Controle de <span class="text-brand">Estoque</span>
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Gestão de insumos, entradas e audit de consumo
        </p>
      </div>
      <div class="flex items-center gap-3 w-full md:w-auto">
        <button
          @click="showAjusteModal = true"
          class="bg-primary/5 text-primary px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/10 transition-all flex items-center gap-2"
        >
          <Settings2 size="18" />
          Ajustar Estoque
        </button>
        <button
          @click="showAddModal = true"
          class="bg-brand text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Plus size="20" />
          Novo Insumo
        </button>
      </div>
    </div>

    <!-- Filtros e Busca -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <BaseInput
        v-model="search"
        placeholder="BUSCAR INSUMO..."
        :icon="Search"
      />
    </div>

    <!-- KPIs de Estoque -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div
        v-for="kpi in kpis"
        :key="kpi.label"
        class="bg-surface p-6 rounded-3xl border border-border shadow-sm"
      >
        <div class="flex items-center gap-3 mb-4">
          <div
            :class="`w-10 h-10 rounded-2xl flex items-center justify-center ${kpi.color}`"
          >
            <component :is="kpi.icon" size="20" />
          </div>
          <span
            class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40"
            >{{ kpi.label }}</span
          >
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black text-primary">{{ kpi.value }}</span>
          <span
            class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40"
            >{{ kpi.unit }}</span
          >
        </div>
      </div>
    </div>

    <!-- Tabs Content -->
    <div
      class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden"
    >
      <div class="flex border-b border-border px-8 bg-primary/2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2',
            activeTab === tab.id
              ? 'border-brand text-brand'
              : 'border-transparent text-secondary/40 hover:text-primary',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="p-8">
        <!-- Tab: Estoque Atual -->
        <div v-if="activeTab === 'estoque'" class="space-y-4">
          <BaseTable
            :headers="['Insumo', 'Estoque / Nível', 'Mínimo', 'Unidade', '']"
          >
            <tr
              v-for="item in filteredInsumos"
              :key="item.id"
              class="group hover:bg-primary/2 transition-colors"
            >
              <td class="px-8 py-5">
                <div class="flex items-center gap-4">
                  <div
                    class="w-12 h-12 rounded-[1.2rem] bg-brand/10 flex items-center justify-center text-brand font-black text-xs border border-brand/20 group-hover:border-brand/40 transition-colors"
                  >
                    {{ item.nome.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex flex-col">
                    <span
                      class="text-sm font-black uppercase tracking-tight text-primary"
                      >{{ item.nome }}</span
                    >
                    <span
                      class="text-[9px] font-black text-secondary opacity-40 uppercase tracking-widest"
                      >{{ item.unidadeMedida }}</span
                    >
                  </div>
                </div>
              </td>
              <td class="px-8 py-5">
                <div class="flex items-center gap-4">
                  <div
                    class="w-24 h-2 bg-primary/3 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full transition-all"
                      :class="getStatusColor(item)"
                      :style="{ width: getPercentage(item) + '%' }"
                    ></div>
                  </div>
                  <span
                    class="text-xs font-black tabular-nums"
                    :class="
                      item.estoqueAtual < item.estoqueMinimo
                        ? 'text-red-500'
                        : 'text-primary'
                    "
                  >
                    {{ item.estoqueAtual }}
                  </span>
                </div>
              </td>
              <td class="px-8 py-5">
                <span
                  class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60 tabular-nums"
                >
                  {{ item.estoqueMinimo }}
                </span>
              </td>
              <td class="px-8 py-5">
                <span
                  class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60"
                >
                  {{ item.unidadeMedida }}
                </span>
              </td>
              <td class="px-8 py-5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <BaseTooltip text="Editar">
                    <button
                      @click="editInsumo(item)"
                      class="p-2.5 rounded-xl bg-primary/3 text-secondary hover:text-brand hover:scale-110 active:scale-95 transition-all"
                    >
                      <Edit3 size="16" />
                    </button>
                  </BaseTooltip>
                </div>
              </td>
            </tr>
          </BaseTable>
        </div>

        <!-- Tab: Relatórios de Consumo -->
        <div v-if="activeTab === 'relatorios'" class="space-y-8">
          <div class="flex items-center justify-between px-2">
            <h3
              class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-40"
            >
              Consumo Teórico vs Real (30 dias)
            </h3>
            <div class="flex items-center gap-2">
              <span
                class="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg uppercase tracking-widest"
                >Eficiência: {{ averageEfficiency }}%</span
              >
            </div>
          </div>

          <div v-if="reportData" class="grid grid-cols-1 gap-4">
            <div
              v-for="row in reportData.data"
              :key="row.id"
              class="p-6 rounded-3xl border border-border flex items-center justify-between gap-8 bg-primary/2 group hover:border-brand/30 transition-all"
            >
              <div class="flex-1">
                <p
                  class="text-sm font-black text-primary uppercase tracking-tight"
                >
                  {{ row.nome }}
                </p>
                <p
                  class="text-[9px] font-black text-secondary opacity-40 uppercase tracking-widest mt-1"
                >
                  Teórico: {{ row.teorico }} {{ row.unidade }}
                </p>
              </div>
              <div class="flex-1 text-center">
                <div class="flex items-center justify-center gap-2">
                  <p
                    class="text-sm font-black tabular-nums"
                    :class="
                      row.desvio > 5 ? 'text-red-500' : 'text-emerald-500'
                    "
                  >
                    {{ row.realCalculado }} {{ row.unidade }}
                  </p>
                  <TrendingDown
                    v-if="row.desvio > 5"
                    size="14"
                    class="text-red-500"
                  />
                  <CheckCircle2 v-else size="14" class="text-emerald-500" />
                </div>
                <p
                  class="text-[9px] font-black text-secondary opacity-40 uppercase tracking-widest mt-1"
                >
                  Real p/ Inventário
                </p>
              </div>
              <div class="w-24 text-right">
                <p
                  class="text-xs font-black tabular-nums"
                  :class="row.desvio > 0 ? 'text-red-500' : 'text-emerald-500'"
                >
                  {{ row.desvio > 0 ? "+" : "" }}{{ row.desvio }}%
                </p>
                <p
                  class="text-[9px] font-black text-secondary opacity-40 uppercase tracking-widest mt-1"
                >
                  Desvio
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modais -->
    <InsumoFormModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @saved="refreshData"
      :insumo="selectedInsumo"
    />
    <InsumoAjusteModal
      v-if="showAjusteModal"
      @close="showAjusteModal = false"
      @saved="refreshData"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  TrendingUp,
  History,
  Settings2,
  Edit3,
  TrendingDown,
  CheckCircle2,
} from "lucide-vue-next";

const search = ref("");
const activeTab = ref("estoque");
const showAddModal = ref(false);
const showAjusteModal = ref(false);
const selectedInsumo = ref(null);

const { data: insumos, pending, refresh } = useFetch("/api/insumos");
const { data: reportData } = useFetch("/api/insumos/relatorio");

const tabs = [
  { id: "estoque", label: "Estoque Atual" },
  { id: "relatorios", label: "Relatório de Consumo" },
];

const headers = [
  { key: "nome", label: "Insumo" },
  { key: "estoqueAtual", label: "Estoque / Nível" },
  { key: "estoqueMinimo", label: "Mínimo" },
  { key: "unidadeMedida", label: "Unidade" },
  { key: "acoes", label: "", align: "right" },
];

const filteredInsumos = computed(() => {
  if (!insumos.value) return [];
  return insumos.value.filter((i) =>
    i.nome.toLowerCase().includes(search.value.toLowerCase()),
  );
});

const kpis = computed(() => [
  {
    label: "Total Itens",
    value: insumos.value?.length || 0,
    unit: "insumos",
    icon: Package,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    label: "Alerta Estoque",
    value:
      insumos.value?.filter((i) => i.estoqueAtual < i.estoqueMinimo).length ||
      0,
    unit: "críticos",
    icon: AlertTriangle,
    color: "bg-red-500/10 text-red-500",
  },
  {
    label: "Movimento Mês",
    value: "+1.2k",
    unit: "toneladas",
    icon: TrendingUp,
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    label: "Divergência",
    value: "2.4",
    unit: "% média",
    icon: History,
    color: "bg-amber-500/10 text-amber-500",
  },
]);

const averageEfficiency = computed(() => {
  if (!reportData.value?.data?.length) return 100;
  const deviations = reportData.value.data.map((d) => Math.abs(d.desvio));
  const avg = deviations.reduce((a, b) => a + b, 0) / deviations.length;
  return (100 - avg).toFixed(1);
});

const getPercentage = (item) => {
  if (!item.estoqueMinimo) return 100;
  return Math.min(100, (item.estoqueAtual / (item.estoqueMinimo * 3)) * 100);
};

const getStatusColor = (item) => {
  if (item.estoqueAtual < item.estoqueMinimo) return "bg-red-500";
  if (item.estoqueAtual < item.estoqueMinimo * 1.5) return "bg-amber-500";
  return "bg-emerald-500";
};

const editInsumo = (item) => {
  selectedInsumo.value = item;
  showAddModal.value = true;
};

const refreshData = () => {
  refresh();
  selectedInsumo.value = null;
};
</script>
