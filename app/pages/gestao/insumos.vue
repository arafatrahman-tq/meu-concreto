<template>
  <div class="p-6 space-y-6">
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl font-bold text-primary tracking-tight">
          Gestão de Insumos
        </h1>
        <p class="text-secondary/60 text-sm">
          Controle de estoque de agregados, cimento e aditivos.
        </p>
      </div>
      <button
        @click="openAjusteModal()"
        class="bg-white border border-border hover:bg-secondary/5 text-primary px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
      >
        <Scale size="20" class="text-secondary" />
        Ajuste de Inventário
      </button>
      <button
        @click="openModal()"
        class="bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
      >
        <Plus size="20" />
        Novo Insumo
      </button>
    </div>

    <!-- Seção de Relatório Rápido -->
    <div
      v-if="relatorio"
      class="bg-primary/2 border border-border rounded-3xl p-6"
    >
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-sm font-black uppercase tracking-widest text-primary">
            Relatório de Consumo (30 dias)
          </h3>
          <p
            class="text-[10px] font-bold text-secondary opacity-40 uppercase mt-1"
          >
            Comparativo Teórico vs Real
          </p>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span
            class="text-[10px] font-black uppercase tracking-widest text-emerald-600"
            >Sincronizado</span
          >
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          v-for="item in relatorio.data.slice(0, 4)"
          :key="item.id"
          class="bg-surface p-4 rounded-2xl border border-border"
        >
          <p
            class="text-[10px] font-black uppercase text-secondary/40 tracking-wider mb-1"
          >
            {{ item.nome }}
          </p>
          <div class="flex items-end justify-between">
            <span class="text-lg font-black text-primary"
              >{{ item.realCalculado.toFixed(1) }}
              <small class="text-[10px] opacity-40">{{
                item.unidade
              }}</small></span
            >
            <span
              :class="[
                'text-[10px] font-black px-2 py-0.5 rounded-lg',
                item.desvio > 5
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-emerald-100 text-emerald-600',
              ]"
            >
              {{ item.desvio > 0 ? "+" : "" }}{{ item.desvio }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <BaseCard title="Total em Estoque" :icon="Package">
        <div class="text-3xl font-bold text-primary">{{ totalInsumos }}</div>
        <p class="text-secondary/60 text-xs mt-1">Materiais cadastrados</p>
      </BaseCard>
      <BaseCard
        title="Estoque Baixo"
        :icon="AlertTriangle"
        class="text-amber-600"
      >
        <div class="text-3xl font-bold">{{ insumosBaixos }}</div>
        <p class="text-secondary/60 text-xs mt-1">Abaixo do estoque mínimo</p>
      </BaseCard>
      <BaseCard title="Última Atualização" :icon="Clock">
        <div class="text-lg font-bold text-primary">
          {{ ultimaAtualizacao }}
        </div>
        <p class="text-secondary/60 text-xs mt-1">Sincronizado com DB</p>
      </BaseCard>
    </div>

    <!-- Tabela de Insumos -->
    <BaseCard>
      <div
        v-if="pending"
        class="py-12 flex flex-col items-center justify-center space-y-4"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"
        ></div>
        <p class="text-secondary/60 text-sm">Carregando insumos...</p>
      </div>

      <div v-else-if="insumos.length === 0" class="py-12 text-center">
        <div
          class="bg-secondary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Package class="text-secondary/30" size="32" />
        </div>
        <h3 class="text-lg font-bold text-primary">Nenhum insumo encontrado</h3>
        <p class="text-secondary/60 text-sm max-w-xs mx-auto mt-1">
          Comece cadastrando cimento, areia ou brita para compor seus traços.
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="border-b border-border/50 text-secondary/50 text-xs font-bold uppercase tracking-wider"
            >
              <th class="px-6 py-4">Insumo</th>
              <th class="px-6 py-4">Unidade</th>
              <th class="px-6 py-4">Estoque Atual</th>
              <th class="px-6 py-4">Estoque Mínimo</th>
              <th class="px-6 py-4">Custo Unit.</th>
              <th class="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/50">
            <tr
              v-for="insumo in insumos"
              :key="insumo.id"
              class="group hover:bg-secondary/2 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="font-bold text-primary">{{ insumo.nome }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-secondary">
                {{ insumo.unidadeMedida }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-3 py-1 rounded-lg text-sm font-bold',
                    insumo.estoqueAtual <= insumo.estoqueMinimo
                      ? 'bg-red-100 text-red-600'
                      : 'bg-brand/10 text-brand',
                  ]"
                >
                  {{ insumo.estoqueAtual }} {{ insumo.unidadeMedida }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-secondary">
                {{ insumo.estoqueMinimo }} {{ insumo.unidadeMedida }}
              </td>
              <td class="px-6 py-4 text-sm font-bold text-primary">
                {{ formatCurrency(insumo.custoUnitario / 100) }}
              </td>
              <td class="px-6 py-4 text-right">
                <div
                  class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    @click="openModal(insumo)"
                    class="p-2 hover:bg-brand/10 text-brand rounded-lg transition-colors"
                  >
                    <Edit2 size="18" />
                  </button>
                  <button
                    @click="deleteInsumo(insumo.id)"
                    class="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 size="18" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <!-- Modal de Cadastro/Edição -->
    <BaseModal
      :show="showModal"
      @close="showModal = false"
      :title="editingInsumo ? 'Editar Insumo' : 'Novo Insumo'"
    >
      <form @submit.prevent="saveInsumo" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="col-span-2">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
              >Nome do Material <span class="text-brand">*</span></label
            >
            <BaseInput
              v-model="form.nome"
              placeholder="Ex: Cimento CP-II"
              required
              :icon="Package"
            />
          </div>
          <div>
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
              >Unidade <span class="text-brand">*</span></label
            >
            <BaseSelect
              v-model="form.unidadeMedida"
              :options="unidades"
              placeholder="Selecione"
              required
            />
          </div>
          <div>
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
              >Custo Unitário (R$)</label
            >
            <BaseInput
              v-model="form.custoUnitarioDisplay"
              placeholder="0,00"
              :icon="DollarSign"
            />
          </div>
          <div>
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
              >Estoque Atual</label
            >
            <BaseInput
              v-model="form.estoqueAtual"
              type="number"
              step="0.01"
              :icon="Layers"
            />
          </div>
          <div>
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
              >Estoque Mínimo</label
            >
            <BaseInput
              v-model="form.estoqueMinimo"
              type="number"
              step="0.01"
              :icon="AlertCircle"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button
            type="button"
            @click="showModal = false"
            class="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-primary/5 transition-all outline-none"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="bg-brand text-background px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand/20 disabled:opacity-50 outline-none"
          >
            {{ saving ? "Salvando..." : "Salvar Insumo" }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Modal de Ajuste de Inventário -->
    <BaseModal
      :show="showAjusteModal"
      @close="showAjusteModal = false"
      title="Ajuste de Inventário / Perda"
    >
      <div class="p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-6">
        <div class="flex gap-3">
          <AlertCircle class="text-amber-600 shrink-0" size="20" />
          <p class="text-xs text-amber-700 leading-relaxed font-medium">
            Use este formulário para lançar compras, perdas identificadas ou
            correções de inventário físico. O estoque atual será atualizado e o
            histórico registrado.
          </p>
        </div>
      </div>

      <form @submit.prevent="saveAjuste" class="space-y-4">
        <div class="space-y-4">
          <div>
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
              >Selecione o Material <span class="text-brand">*</span></label
            >
            <BaseSelect
              v-model="ajusteForm.idInsumo"
              :options="insumos?.map((i) => ({ label: i.nome, value: i.id }))"
              placeholder="Escolher insumo..."
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
                >Tipo de Ajuste <span class="text-brand">*</span></label
              >
              <BaseSelect
                v-model="ajusteForm.tipo"
                :options="tiposAjuste"
                required
              />
            </div>
            <div>
              <label
                class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
              >
                {{
                  ajusteForm.tipo === "AJUSTE"
                    ? "Nova Quantidade Real"
                    : "Quantidade do Ajuste"
                }}
                <span class="text-brand">*</span>
              </label>
              <BaseInput
                v-model.number="ajusteForm.quantidade"
                type="number"
                step="0.01"
                required
                :icon="Layers"
              />
            </div>
          </div>

          <div>
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
              >Observação (Motivo)</label
            >
            <BaseInput
              v-model="ajusteForm.observacao"
              placeholder="Ex: Quebra detectada na descarga ou Inventário Mensal"
              :icon="FileText"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button
            type="button"
            @click="showAjusteModal = false"
            class="px-8 py-4 rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-primary/2 transition-all outline-none"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="savingAjuste"
            class="bg-brand text-background px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand/20 disabled:opacity-50 outline-none"
          >
            {{ savingAjuste ? "Processando..." : "Confirmar Ajuste" }}
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  Plus,
  Package,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  Scale,
  AlertCircle,
  FileText,
  DollarSign,
  Layers,
} from "lucide-vue-next";

const { data: insumos, pending, refresh } = await useFetch("/api/insumos");
const { data: relatorio, refresh: refreshRelatorio } = await useFetch(
  "/api/insumos/relatorio",
);

const showModal = ref(false);
const showAjusteModal = ref(false);
const saving = ref(false);
const savingAjuste = ref(false);
const editingInsumo = ref(null);

const unidades = [
  { label: "Kilograma (kg)", value: "kg" },
  { label: "Metro Cúbico (m³)", value: "m³" },
  { label: "Litro (L)", value: "L" },
  { label: "Unidade (un)", value: "un" },
  { label: "Tonelada (ton)", value: "ton" },
];

const tiposAjuste = [
  { label: "Entrada de Material (Compra)", value: "ENTRADA" },
  { label: "Perda/Quebra (Saída Real)", value: "SAIDA_REAL" },
  { label: "Correção de Inventário (Saldo Físico)", value: "AJUSTE" },
];

const form = ref({
  nome: "",
  unidadeMedida: "kg",
  estoqueAtual: 0,
  estoqueMinimo: 0,
  custoUnitarioDisplay: "",
});

const ajusteForm = ref({
  idInsumo: null,
  tipo: "AJUSTE",
  quantidade: 0,
  observacao: "",
});

const openAjusteModal = () => {
  ajusteForm.value = {
    idInsumo: null,
    tipo: "AJUSTE",
    quantidade: 0,
    observacao: "",
  };
  showAjusteModal.value = true;
};

const saveAjuste = async () => {
  savingAjuste.value = true;
  try {
    await $fetch("/api/insumos/ajuste", {
      method: "POST",
      body: ajusteForm.value,
    });
    await refresh();
    await refreshRelatorio();
    showAjusteModal.value = false;
  } catch (error) {
    alert("Erro ao processar ajuste: " + error.message);
  } finally {
    savingAjuste.value = false;
  }
};

const totalInsumos = computed(() => insumos.value?.length || 0);
const insumosBaixos = computed(
  () =>
    insumos.value?.filter((i) => i.estoqueAtual <= i.estoqueMinimo).length || 0,
);
const ultimaAtualizacao = useState("ultima_atualizacao_insumos", () =>
  new Date().toLocaleTimeString("pt-BR"),
);

const formatCurrency = (val) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val);
};

const openModal = (insumo = null) => {
  if (insumo) {
    editingInsumo.value = insumo;
    form.value = {
      ...insumo,
      custoUnitarioDisplay: (insumo.custoUnitario / 100)
        .toFixed(2)
        .replace(".", ","),
    };
  } else {
    editingInsumo.value = null;
    form.value = {
      nome: "",
      unidadeMedida: "kg",
      estoqueAtual: 0,
      estoqueMinimo: 0,
      custoUnitarioDisplay: "",
    };
  }
  showModal.value = true;
};

const saveInsumo = async () => {
  saving.value = true;
  try {
    const custoCentavos =
      Math.round(
        parseFloat(form.value.custoUnitarioDisplay.replace(",", ".")) * 100,
      ) || 0;
    const payload = {
      ...form.value,
      custoUnitario: custoCentavos,
    };

    if (editingInsumo.value) {
      await $fetch(`/api/insumos/${editingInsumo.value.id}`, {
        method: "PUT",
        body: payload,
      });
    } else {
      await $fetch("/api/insumos", {
        method: "POST",
        body: payload,
      });
    }

    await refresh();
    showModal.value = false;
    ultimaAtualizacao.value = new Date().toLocaleTimeString();
  } catch (error) {
    alert("Erro ao salvar insumo: " + error.message);
  } finally {
    saving.value = false;
  }
};

const deleteInsumo = async (id) => {
  if (!confirm("Deseja realmente excluir este insumo?")) return;

  try {
    await $fetch(`/api/insumos/${id}`, { method: "DELETE" });
    await refresh();
  } catch (error) {
    alert("Erro ao excluir: " + error.message);
  }
};
</script>
