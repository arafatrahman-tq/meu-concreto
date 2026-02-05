<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Pagamentos
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Controle de contas a receber e fluxo de caixa
        </p>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <div class="relative flex-1 md:flex-none">
          <Search
            class="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40"
            size="18"
          />
          <input
            v-model="searchTerm"
            placeholder="Buscar por cliente, ID ou venda..."
            class="pl-12 pr-4 py-3.5 bg-primary/2 border border-border rounded-2xl text-sm font-black uppercase tracking-widest text-primary placeholder:text-secondary/20 w-full md:w-80 focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Quick Stats Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-surface p-6 rounded-3xl border border-border group hover:border-brand/30 transition-all"
      >
        <div class="flex justify-between items-start mb-4">
          <div :class="['p-3 rounded-2xl bg-primary/3', stat.color]">
            <component :is="stat.icon" size="20" />
          </div>
          <span
            :class="[
              'text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border',
              stat.badgeBg,
              stat.badgeText,
            ]"
          >
            {{ stat.trend }}
          </span>
        </div>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1"
        >
          {{ stat.label }}
        </p>
        <p class="text-2xl font-black tracking-tighter text-primary uppercase">
          {{ stat.value }}
        </p>
      </div>
    </div>

    <!-- Table Container -->
    <div
      class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden"
    >
      <BaseTable
        :headers="[
          'ID',
          'Vencimento',
          'Cliente',
          'Valor',
          'Status',
          'Método',
          '',
        ]"
      >
        <tr
          v-for="pgto in displayedPagamentos"
          :key="pgto.id"
          class="group hover:bg-primary/2 transition-colors"
        >
          <td class="px-8 py-5">
            <span
              class="text-xs font-black text-secondary opacity-40 tabular-nums"
              >#{{ String(pgto.id).padStart(4, "0") }}</span
            >
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col">
              <span
                class="text-xs font-black uppercase tracking-tight"
                :class="
                  isOverdue(pgto)
                    ? 'text-rose-500'
                    : 'text-secondary opacity-60'
                "
              >
                {{ formatDate(pgto.dataVencimento) }}
              </span>
              <span
                v-if="pgto.dataPagamento"
                class="text-[9px] font-black uppercase opacity-30 tracking-widest mt-0.5"
              >
                Pago em: {{ formatDate(pgto.dataPagamento) }}
              </span>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col">
              <span
                class="text-sm font-black uppercase tracking-tight text-primary"
                >{{
                  pgto.venda?.orcamento?.nomeCliente ||
                  "Cliente não identificado"
                }}</span
              >
              <span
                class="text-[10px] font-black uppercase opacity-30 mt-0.5 tracking-widest"
                >Venda #{{ String(pgto.idVenda).padStart(4, "0") }}</span
              >
            </div>
          </td>
          <td class="px-8 py-5">
            <span
              class="text-sm font-black uppercase tracking-tight text-brand"
            >
              {{ formatCurrency(pgto.valor) }}
            </span>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full shadow-[0_0_10px]',
                  statusColor[getDisplayStatus(pgto)],
                ]"
              ></div>
              <span
                class="text-[10px] font-black uppercase tracking-widest"
                :class="statusTextColor[getDisplayStatus(pgto)]"
              >
                {{ getDisplayStatus(pgto) }}
              </span>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col gap-1.5">
              <span
                class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60"
              >
                {{ pgto.metodo || "---" }}
              </span>
              <div class="flex items-center gap-1">
                <span
                  v-if="pgto.sicoobId?.startsWith('MANUAL_')"
                  class="px-1.5 py-0.5 bg-slate-500/10 text-slate-500 text-[7px] font-black rounded-md uppercase tracking-widest border border-slate-500/20"
                >
                  Manual
                </span>
                <span
                  v-else-if="pgto.sicoobId"
                  class="px-1.5 py-0.5 bg-[#7db61c]/10 text-[#7db61c] text-[7px] font-black rounded-md uppercase tracking-widest border border-[#7db61c]/20"
                >
                  Sicoob
                </span>
                <span
                  v-else-if="pgto.asaasId"
                  class="px-1.5 py-0.5 bg-brand/10 text-brand text-[7px] font-black rounded-md uppercase tracking-widest border border-brand/20"
                >
                  Asaas
                </span>
              </div>
            </div>
          </td>
          <td class="px-8 py-5 text-right">
            <div class="flex items-center justify-end gap-2">
              <BaseTooltip
                v-if="pgto.status === 'PENDENTE'"
                text="Registrar Pagamento"
              >
                <button
                  @click="openPaymentModal(pgto)"
                  class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:scale-110 active:scale-95 transition-all"
                >
                  <CheckCircle2 size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Visualizar">
                <button
                  @click="openViewModal(pgto)"
                  class="p-2.5 rounded-xl text-secondary hover:text-brand hover:bg-primary/3 hover:scale-110 transition-all"
                >
                  <Eye size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip v-if="isAdmin" text="Excluir">
                <button
                  @click="confirmDelete(pgto)"
                  class="p-2.5 rounded-xl text-secondary hover:text-rose-500 hover:bg-rose-500/10 hover:scale-110 transition-all"
                >
                  <Trash2 size="16" />
                </button>
              </BaseTooltip>
            </div>
          </td>
        </tr>
      </BaseTable>

      <!-- Empty State & Load More -->
      <div
        v-if="!filteredPagamentos.length && !pending"
        class="p-20 text-center"
      >
        <div
          class="w-16 h-16 bg-primary/2 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border"
        >
          <CreditCard size="32" class="text-secondary/20" />
        </div>
        <h3 class="text-lg font-black uppercase tracking-tight text-primary">
          Nenhum pagamento registrado
        </h3>
        <p
          class="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-50"
        >
          Pagamentos são gerados automaticamente através das vendas.
        </p>
      </div>

      <div
        v-else-if="itemsToShow < filteredPagamentos.length"
        class="p-8 flex justify-center border-t border-border"
      >
        <button
          @click="itemsToShow += 20"
          class="flex items-center gap-2 px-6 py-3 bg-primary/2 hover:bg-primary/3 text-primary text-xs font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-105"
        >
          <RefreshCw size="14" class="opacity-40" />
          Carregar mais pagamentos
        </button>
      </div>
    </div>

    <!-- Register Payment Modal -->
    <BaseModal v-model="showPaymentModal" title="Confirmar Pagamento" size="md">
      <div v-if="selectedPgto" class="space-y-6 pt-4">
        <div class="bg-primary/2 p-6 rounded-3xl border border-border">
          <p
            class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2"
          >
            Valor a Receber
          </p>
          <p class="text-4xl font-black text-brand tracking-tighter">
            {{ formatCurrency(selectedPgto.valor) }}
          </p>
          <div class="mt-4 pt-4 border-t border-border/50">
            <p class="text-[11px] font-bold text-primary uppercase">
              {{ selectedPgto.venda?.orcamento?.nomeCliente }}
            </p>
            <p
              class="text-[9px] font-black text-secondary uppercase opacity-40 tracking-widest mt-1"
            >
              Venda #{{ selectedPgto.idVenda }}
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="space-y-2">
            <label
              class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60 ml-1"
              >Método de Pagamento</label
            >
            <BaseSelect
              v-model="paymentForm.metodo"
              :options="paymentMethods"
            />
          </div>
          <div class="space-y-2">
            <label
              class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60 ml-1"
              >Data do Recebimento</label
            >
            <BaseInput v-model="paymentForm.dataPagamento" type="date" />
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            @click="showPaymentModal = false"
            class="flex-1 py-4 bg-primary/2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-primary/5 transition-all"
          >
            Cancelar
          </button>
          <button
            @click="confirmPayment"
            :disabled="submitting"
            class="flex-2 py-4 bg-brand text-background rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {{ submitting ? "Processando..." : "Confirmar Recebimento" }}
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- Detailed View Modal -->
    <BaseModal v-model="showViewModal" title="Detalhes do Lançamento" size="lg">
      <div v-if="selectedPgto" class="space-y-6 pt-4">
        <!-- Status Banner -->
        <div
          :class="[
            'p-4 rounded-2xl flex items-center justify-between border',
            selectedPgto.status === 'PAGO'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
              : isOverdue(selectedPgto)
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-500',
          ]"
        >
          <div class="flex items-center gap-3">
            <CheckCircle2 v-if="selectedPgto.status === 'PAGO'" size="20" />
            <AlertCircle v-else size="20" />
            <span class="text-[10px] font-black uppercase tracking-widest">{{
              getDisplayStatus(selectedPgto)
            }}</span>
          </div>
          <span
            class="text-[10px] font-black uppercase tracking-widest opacity-60"
            >ID #{{ String(selectedPgto.id).padStart(4, "0") }}</span
          >
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Dados do Cliente -->
          <div class="bg-primary/2 p-6 rounded-3xl border border-border">
            <p
              class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40 mb-4"
            >
              Informações do Cliente
            </p>
            <div class="space-y-3">
              <div>
                <p
                  class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-30"
                >
                  Nome
                </p>
                <p class="text-sm font-black text-primary uppercase">
                  {{ selectedPgto.venda?.orcamento?.nomeCliente }}
                </p>
              </div>
              <div v-if="selectedPgto.venda?.orcamento?.cpfCnpj">
                <p
                  class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-30"
                >
                  CPF/CNPJ
                </p>
                <p class="text-xs font-bold text-primary">
                  {{ selectedPgto.venda?.orcamento?.cpfCnpj }}
                </p>
              </div>
            </div>
          </div>

          <!-- Dados do Pagamento -->
          <div class="bg-primary/2 p-6 rounded-3xl border border-border">
            <p
              class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40 mb-4"
            >
              Detalhes Financeiros
            </p>
            <div class="space-y-3">
              <div class="flex justify-between items-end">
                <div>
                  <p
                    class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-30"
                  >
                    Vencimento
                  </p>
                  <p class="text-sm font-black text-primary">
                    {{ formatDate(selectedPgto.dataVencimento) }}
                  </p>
                </div>
                <div class="text-right">
                  <p
                    class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-30"
                  >
                    Valor
                  </p>
                  <p class="text-lg font-black text-brand">
                    {{ formatCurrency(selectedPgto.valor) }}
                  </p>
                </div>
              </div>
              <div
                v-if="selectedPgto.status === 'PAGO'"
                class="pt-3 border-t border-border/50"
              >
                <div class="flex justify-between">
                  <div>
                    <p
                      class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-30"
                    >
                      Recebido em
                    </p>
                    <p class="text-xs font-bold text-emerald-500">
                      {{ formatDate(selectedPgto.dataPagamento) }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p
                      class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-30"
                    >
                      Método
                    </p>
                    <div class="flex items-center justify-end gap-2 mt-0.5">
                      <span
                        v-if="selectedPgto.sicoobId?.startsWith('MANUAL_')"
                        class="px-1.5 py-0.5 bg-slate-500/10 text-slate-500 text-[7px] font-black rounded uppercase border border-slate-500/20"
                      >
                        Manual
                      </span>
                      <span
                        v-else-if="selectedPgto.sicoobId"
                        class="px-1.5 py-0.5 bg-[#7db61c]/10 text-[#7db61c] text-[7px] font-black rounded uppercase border border-[#7db61c]/20"
                      >
                        Sicoob
                      </span>
                      <span
                        v-else-if="selectedPgto.asaasId"
                        class="px-1.5 py-0.5 bg-brand/10 text-brand text-[7px] font-black rounded uppercase border border-brand/20"
                      >
                        Asaas
                      </span>
                      <p class="text-xs font-bold text-primary uppercase">
                        {{ selectedPgto.metodo }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Links de Pagamento e Pix QR Code -->
        <div
          v-if="
            selectedPgto.status === 'PENDENTE' &&
            (selectedPgto.sicoobQrCode || selectedPgto.asaasUrl)
          "
          class="space-y-4"
        >
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-4 bg-brand rounded-full"></div>
            <h3
              class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
            >
              Integrações de Pagamento
            </h3>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <!-- Sicoob Pix -->
            <div
              v-if="selectedPgto.sicoobQrCode"
              class="bg-primary/2 p-6 rounded-3xl border border-border flex flex-col gap-4"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h4
                    class="text-xs font-black uppercase tracking-widest text-[#7db61c]"
                  >
                    Pix Copia e Cola
                  </h4>
                  <p
                    class="text-[9px] font-bold text-secondary uppercase opacity-60 mt-1"
                  >
                    {{
                      selectedPgto.sicoobId?.startsWith("MANUAL_")
                        ? "Gerado Manualmente"
                        : "Gerado via Sicoob"
                    }}
                  </p>
                </div>
                <div class="p-2 bg-[#7db61c]/10 text-[#7db61c] rounded-lg">
                  <Zap size="16" />
                </div>
              </div>

              <div
                class="bg-surface p-4 rounded-xl border border-border/50 break-all font-mono text-[10px] text-secondary relative group"
              >
                <p class="line-clamp-2">{{ selectedPgto.sicoobQrCode }}</p>
                <button
                  @click="copyPixCode(selectedPgto.sicoobQrCode)"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-brand/20"
                >
                  <Copy size="14" />
                </button>
              </div>
              <p
                class="text-[8px] font-black text-secondary uppercase opacity-30 text-center tracking-widest"
              >
                Clique no ícone de cópia ao passar o mouse
              </p>
            </div>

            <!-- Asaas Link -->
            <div
              v-if="selectedPgto.asaasUrl"
              class="bg-primary/2 p-6 rounded-3xl border border-border flex items-center justify-between"
            >
              <div class="flex items-center gap-4">
                <div class="p-3 bg-brand/10 text-brand rounded-2xl">
                  <ExternalLink size="20" />
                </div>
                <div>
                  <h4
                    class="text-xs font-black uppercase tracking-widest text-primary"
                  >
                    Link da Fatura
                  </h4>
                  <p
                    class="text-[9px] font-bold text-secondary uppercase opacity-60 mt-0.5"
                  >
                    Gerado via Asaas
                  </p>
                </div>
              </div>
              <a
                :href="selectedPgto.asaasUrl"
                target="_blank"
                class="px-5 py-2.5 bg-brand text-background text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/20"
              >
                Abrir Link
              </a>
            </div>
          </div>
        </div>

        <!-- Origem do Faturamento -->
        <div class="bg-primary/2 p-6 rounded-3xl border border-border">
          <p
            class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40 mb-4"
          >
            Origem do Faturamento
          </p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-brand/10 text-brand rounded-2xl">
                <ShoppingBag size="20" />
              </div>
              <div>
                <p class="text-xs font-black text-primary uppercase">
                  Venda #{{ String(selectedPgto.idVenda).padStart(4, "0") }}
                </p>
                <p
                  class="text-[9px] font-black uppercase text-secondary opacity-40 tracking-widest"
                >
                  Gerado em: {{ formatDate(selectedPgto.createdAt) }}
                </p>
              </div>
            </div>
            <div
              class="text-right"
              v-if="selectedPgto.venda?.orcamento?.produtoNome"
            >
              <p
                class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-30"
              >
                Produto base
              </p>
              <p class="text-xs font-bold text-primary uppercase">
                {{ selectedPgto.venda?.orcamento?.produtoNome }} ({{
                  selectedPgto.venda?.orcamento?.qtd
                }}
                m³)
              </p>
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            @click="showViewModal = false"
            class="w-full py-4 bg-primary/2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-primary/5 transition-all outline-none"
          >
            Fechar Detalhes
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- Delete Confirmation Dialog -->
    <BaseDialog
      v-model="showDeleteDialog"
      title="Remover Lançamento"
      :message="`Tem certeza que deseja remover o pagamento #${String(pgtoToDelete?.id).padStart(4, '0')}? Esta ação não pode ser desfeita.`"
      variant="danger"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  Search,
  Eye,
  Trash2,
  CreditCard,
  ShoppingBag,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Clock,
  RefreshCw,
  Copy,
  ExternalLink,
} from "lucide-vue-next";
import { useFetch, useToast } from "#imports";
import { useRoute } from "vue-router";

definePageMeta({ layout: "default" });

const { user } = useAuth();
const { add: addToast } = useToast();
const route = useRoute();
const searchTerm = ref("");
const itemsToShow = ref(20);
const submitting = ref(false);

const isAdmin = computed(() => user.value?.admin === 1);

// Data Fetching
const {
  data: pagamentos,
  pending,
  refresh,
} = await useFetch("/api/pagamentos");

onMounted(() => {
  if (route.query.id) {
    const id = parseInt(route.query.id);
    const pgto = pagamentos.value?.find((p) => p.id === id);
    if (pgto) {
      openViewModal(pgto);
    }
  }
});

const filteredPagamentos = computed(() => {
  if (!pagamentos.value) return [];
  return pagamentos.value.filter((p) => {
    const term = searchTerm.value.toLowerCase();
    const cliente = p.venda?.orcamento?.nomeCliente?.toLowerCase() || "";
    const id = String(p.id);
    const idVenda = String(p.idVenda);
    return (
      cliente.includes(term) || id.includes(term) || idVenda.includes(term)
    );
  });
});

const displayedPagamentos = computed(() =>
  filteredPagamentos.value.slice(0, itemsToShow.value),
);

// Modais
const showPaymentModal = ref(false);
const showViewModal = ref(false);
const showDeleteDialog = ref(false);
const selectedPgto = ref(null);
const pgtoToDelete = ref(null);

const paymentForm = ref({
  metodo: "PIX",
  dataPagamento: new Date().toISOString().split("T")[0],
});

const paymentMethods = [
  { value: "PIX", label: "PIX" },
  { value: "DINHEIRO", label: "DINHEIRO" },
  { value: "CARTAO_CREDITO", label: "CARTÃO DE CRÉDITO" },
  { value: "CARTAO_DEBITO", label: "CARTÃO DE DÉBITO" },
  { value: "BOLETO", label: "BOLETO" },
  { value: "TRANSFERENCIA", label: "TRANSFERÊNCIA" },
];

// Stats Calculation
const stats = computed(() => {
  const list = pagamentos.value || [];
  const totalRecebido = list
    .filter((p) => p.status === "PAGO")
    .reduce((acc, p) => acc + p.valor, 0);
  const pendentesNormal = list.filter((p) => p.status === "PENDENTE");
  const totalReceber = pendentesNormal.reduce((acc, p) => acc + p.valor, 0);

  const atrasadosList = pendentesNormal.filter(
    (p) => new Date(p.dataVencimento) < new Date(),
  );
  const totalAtrasado = atrasadosList.reduce((acc, p) => acc + p.valor, 0);

  const totalGeral = totalRecebido + totalReceber;
  const percPago =
    totalGeral > 0 ? Math.round((totalRecebido / totalGeral) * 100) : 0;
  const percAtrasado =
    totalReceber > 0 ? Math.round((totalAtrasado / totalReceber) * 100) : 0;

  return [
    {
      label: "Total Recebido",
      value: formatCurrency(totalRecebido),
      icon: DollarSign,
      color: "text-emerald-500",
      trend: `${percPago}% liquidez`,
      badgeBg: "bg-emerald-500/10",
      badgeText: "text-emerald-500",
    },
    {
      label: "A Receber",
      value: formatCurrency(totalReceber),
      icon: Clock,
      color: "text-brand",
      trend: `${pendentesNormal.length} parcelas`,
      badgeBg: "bg-brand/10",
      badgeText: "text-brand",
    },
    {
      label: "Em Atraso",
      value: formatCurrency(totalAtrasado),
      icon: AlertCircle,
      color: "text-rose-500",
      trend: `${percAtrasado}% de risco`,
      badgeBg: "bg-rose-500/10",
      badgeText: "text-rose-500",
    },
  ];
});

// Mapeamento de Cores Status
const statusColor = {
  PENDENTE: "bg-amber-500 shadow-amber-500/50",
  PAGO: "bg-emerald-500 shadow-emerald-500/50",
  CANCELADO: "bg-rose-500 shadow-rose-500/50",
  ATRASADO: "bg-rose-600 shadow-rose-600/50",
};

const statusTextColor = {
  PENDENTE: "text-amber-500",
  PAGO: "text-emerald-500",
  CANCELADO: "text-rose-500",
  ATRASADO: "text-rose-600",
};

// Helpers
const formatCurrency = (val) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val / 100);
};

const formatDate = (date) => {
  if (!date) return "---";
  return new Date(date).toLocaleDateString("pt-BR");
};

const isOverdue = (pgto) => {
  if (pgto.status !== "PENDENTE") return false;
  return new Date(pgto.dataVencimento) < new Date();
};

const getDisplayStatus = (pgto) => {
  if (pgto.status === "PENDENTE" && isOverdue(pgto)) return "ATRASADO";
  return pgto.status;
};

const copyPixCode = (code) => {
  if (!code) return;
  navigator.clipboard.writeText(code);
  addToast({
    title: "Copiado!",
    description: "Código Pix copiado para a área de transferência.",
    type: "success",
  });
};

// Handlers
const openPaymentModal = (pgto) => {
  selectedPgto.value = pgto;
  showPaymentModal.value = true;
};

const openViewModal = (pgto) => {
  selectedPgto.value = pgto;
  showViewModal.value = true;
};

const confirmPayment = async () => {
  submitting.value = true;
  try {
    await $fetch(`/api/pagamentos/${selectedPgto.value.id}`, {
      method: "PUT",
      body: {
        ...paymentForm.value,
        status: "PAGO",
      },
    });

    addToast({
      title: "Sucesso!",
      description: "Pagamento registrado com sucesso.",
    });
    showPaymentModal.value = false;
    refresh();
  } catch (e) {
    addToast(
      { title: "Erro", description: "Falha ao registrar pagamento." },
      "error",
    );
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (pgto) => {
  pgtoToDelete.value = pgto;
  showDeleteDialog.value = true;
};

const handleDelete = async () => {
  try {
    await $fetch(`/api/pagamentos/${pgtoToDelete.value.id}`, {
      method: "DELETE",
    });
    addToast({
      title: "Removido!",
      description: "Lançamento removido com sucesso.",
    });
    refresh();
  } catch (e) {
    addToast(
      { title: "Erro", description: "Falha ao remover lançamento." },
      "error",
    );
  } finally {
    showDeleteDialog.value = false;
  }
};
</script>
