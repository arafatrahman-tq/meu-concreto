<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Clientes
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Base de clientes e endereços de entrega
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
            placeholder="Buscar por..."
            class="pl-12 pr-4 py-3.5 bg-primary/2 border border-border rounded-2xl text-sm font-black uppercase tracking-widest text-primary placeholder:text-secondary/20 w-full md:w-64 focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all outline-none"
          >
        </div>
        <button
          class="bg-brand text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-brand/20 outline-none"
          @click="openAddModal"
        >
          <Plus size="20" />
          Novo Cliente
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div
      class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden"
    >
      <BaseTable
        :headers="['Cliente', 'Documento', 'Contato', 'Localização', '']"
      >
        <tr
          v-for="cliente in displayedClientes"
          :key="cliente.id"
          class="group hover:bg-primary/2 transition-colors"
        >
          <td class="px-8 py-5">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-[1.2rem] bg-brand/10 flex items-center justify-center text-brand font-black text-xs border border-brand/10 group-hover:border-brand/30 transition-colors"
              >
                {{ cliente.nome.charAt(0).toUpperCase() }}
              </div>
              <span
                class="text-sm font-black uppercase tracking-tight text-primary"
              >{{ cliente.nome }}</span>
            </div>
          </td>
          <td class="px-8 py-5">
            <span
              class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60 tabular-nums"
            >{{ formatCpfCnpj(cliente.cpfCnpj) }}</span>
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col gap-0.5">
              <span
                class="text-xs font-black uppercase tracking-widest text-primary"
              >{{ formatTelefone(cliente.telefone) || "---" }}</span>
              <span
                class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-40"
              >{{ cliente.email || "---" }}</span>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center gap-2 text-secondary">
              <MapPin
                size="14"
                class="opacity-40"
              />
              <span class="text-[10px] font-black uppercase tracking-widest">{{
                cliente.cidade || "---"
              }}</span>
              <span
                v-if="cliente.estado"
                class="text-[10px] font-black opacity-30"
              >
                {{ cliente.estado }}</span>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center justify-end gap-2">
              <BaseTooltip text="Histórico do Cliente">
                <button
                  class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:scale-110 active:scale-95 transition-all"
                  @click="openHistoryModal(cliente)"
                >
                  <History size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Editar">
                <button
                  class="p-2.5 rounded-xl bg-primary/3 text-secondary hover:text-brand hover:scale-110 active:scale-95 transition-all"
                  @click="openEditModal(cliente)"
                >
                  <Edit3 size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Excluir">
                <button
                  class="p-2.5 rounded-xl bg-primary/3 text-secondary hover:text-rose-500 hover:scale-110 active:scale-95 transition-all"
                  @click="confirmDelete(cliente)"
                >
                  <Trash2 size="16" />
                </button>
              </BaseTooltip>
            </div>
          </td>
        </tr>
      </BaseTable>

      <!-- Empty State -->
      <div
        v-if="!filteredClientes.length"
        class="p-20 text-center"
      >
        <div
          class="w-16 h-16 bg-primary/2 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border"
        >
          <UsersIcon
            size="32"
            class="text-secondary/20"
          />
        </div>
        <h3 class="text-lg font-black uppercase tracking-tight text-primary">
          Nenhum cliente encontrado
        </h3>
        <p
          class="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-50"
        >
          Cadastre seus clientes para começar a gerar orçamentos.
        </p>
      </div>
    </div>

    <!-- Pagination / Infinite Load -->
    <div
      v-if="filteredClientes.length > itemsToShow"
      class="flex justify-center py-8"
    >
      <button
        class="bg-surface border border-border px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-secondary hover:text-brand hover:border-brand/30 transition-all flex items-center gap-3 group"
        @click="itemsToShow += 10"
      >
        <RefreshCw
          size="14"
          class="group-hover:rotate-180 transition-transform duration-500"
        />
        Carregar mais clientes
      </button>
    </div>

    <!-- Create/Edit Modal -->
    <BaseModal
      v-model="showModal"
      :title="isEditing ? 'Editar Cliente' : 'Novo Cliente'"
      :subtitle="
        isEditing
          ? 'Atualize os dados cadastrais e endereços'
          : 'Cadastre um novo cliente para faturamento e entrega'
      "
      size="lg"
    >
      <form
        class="space-y-8"
        @submit.prevent="onSubmit"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
            >Nome / Razão Social <span class="text-brand">*</span></label>
            <BaseInput
              v-model="form.nome"
              placeholder="Ex: Construções Silva Ltda"
              :icon="UsersIcon"
              :error="errors.nome"
              @blur="validateField('nome', form.nome)"
            />
          </div>
          <div class="space-y-2">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
            >CPF / CNPJ <span class="text-brand">*</span></label>
            <BaseInput
              :model-value="form.cpfCnpj"
              placeholder="00.000.000/0000-00"
              :icon="IdCard"
              :error="errors.cpfCnpj"
              @update:model-value="onCpfCnpjInput"
              @blur="validateField('cpfCnpj', form.cpfCnpj)"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
            >E-mail</label>
            <BaseInput
              v-model="form.email"
              type="email"
              placeholder="cliente@email.com"
              :icon="Mail"
              :error="errors.email"
              @blur="validateField('email', form.email)"
            />
          </div>
          <div class="space-y-2">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
            >Telefone</label>
            <BaseInput
              :model-value="form.telefone"
              placeholder="(00) 00000-0000"
              :icon="Phone"
              :error="errors.telefone"
              @update:model-value="onTelefoneInput"
              @blur="validateField('telefone', form.telefone)"
            />
          </div>
        </div>

        <div class="space-y-6 pt-4">
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-lg bg-brand/5 border border-brand/10 flex items-center justify-center text-brand"
            >
              <MapPin size="16" />
            </div>
            <h4 class="text-sm font-bold text-primary tracking-tight">
              Endereço de Faturamento
            </h4>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2 space-y-2">
              <label
                class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
              >Logradouro, Número, Compl.</label>
              <BaseInput
                v-model="form.endereco"
                placeholder="Ex: Rua das Flores, 123"
              />
            </div>
            <div class="space-y-2">
              <label
                class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
              >Bairro</label>
              <BaseInput
                v-model="form.bairro"
                placeholder="Centro"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label
                class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
              >Cidade</label>
              <BaseInput
                v-model="form.cidade"
                placeholder="São Paulo"
              />
            </div>
            <div class="space-y-2">
              <label
                class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 block"
              >UF</label>
              <BaseInput
                v-model="form.estado"
                placeholder="SP"
                maxlength="2"
              />
            </div>
            <div class="space-y-2">
              <label
                class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1 flex items-center gap-1.5"
              >
                CEP
                <BaseTooltip
                  text="O endereço será preenchido automaticamente após digitar o CEP"
                >
                  <HelpCircle
                    size="14"
                    class="text-brand/50 hover:text-brand transition-colors cursor-help"
                  />
                </BaseTooltip>
              </label>
              <BaseInput
                :model-value="form.cep"
                placeholder="00000-000"
                @update:model-value="onCepInput"
              >
                <template
                  v-if="cepLoading"
                  #suffix
                >
                  <Loader2
                    class="animate-spin text-brand"
                    size="16"
                  />
                </template>
              </BaseInput>
            </div>
          </div>
        </div>

        <div class="space-y-6 pt-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-lg bg-brand/5 border border-brand/10 flex items-center justify-center text-brand"
              >
                <Truck size="16" />
              </div>
              <h4
                class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
              >
                Endereço de Entrega (Obra)
              </h4>
            </div>
            <button
              type="button"
              class="text-[9px] font-black uppercase tracking-widest text-brand hover:opacity-70 transition-colors"
              @click="copyAddress"
            >
              Copiar do faturamento
            </button>
          </div>
          <BaseInput
            v-model="form.enderecoEntrega"
            placeholder="Endereço completo da obra..."
            :icon="MapPin"
          />
        </div>

        <!-- Validation Summary -->
        <div
          v-if="hasErrors"
          class="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-500/20"
        >
          <p
            class="text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest"
          >
            Corrija os erros acima antes de salvar
          </p>
        </div>

        <div class="flex gap-4 pt-4">
          <button
            type="button"
            class="flex-1 px-8 py-4 border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-primary/2 transition-all outline-none"
            @click="showModal = false"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-2 px-8 py-4 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand/20 disabled:opacity-50 outline-none"
          >
            {{ loading ? "Salvando..." : "Salvar Cliente" }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- History Modal -->
    <BaseModal
      v-model="showHistoryModal"
      title="Histórico do Cliente"
      size="xl"
    >
      <div
        v-if="historyLoading"
        class="p-20 flex flex-col items-center justify-center gap-4"
      >
        <Loader2 class="w-12 h-12 text-brand animate-spin" />
        <p
          class="text-xs font-black uppercase tracking-widest text-secondary opacity-40"
        >
          Buscando inteligência do cliente...
        </p>
      </div>

      <div
        v-else-if="selectedHistory"
        class="space-y-8 pt-4"
      >
        <!-- Cliente Header Info -->
        <div
          class="bg-primary/2 p-6 rounded-3xl border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h4
              class="text-2xl font-black text-primary uppercase tracking-tighter"
            >
              {{ selectedHistory.client.nome }}
            </h4>
            <p
              class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-40 mt-1"
            >
              {{ formatCpfCnpj(selectedHistory.client.cpfCnpj) }}
            </p>
          </div>
          <div class="flex gap-6">
            <div class="text-right">
              <p
                class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
              >
                Orçamentos
              </p>
              <p class="text-xl font-black text-primary">
                {{ selectedHistory.orcamentos.length }}
              </p>
            </div>
            <div class="text-right">
              <p
                class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
              >
                Vendas
              </p>
              <p class="text-xl font-black text-brand">
                {{ selectedHistory.vendas.length }}
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Coluna 1: Orçamentos -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 px-2">
              <FileText
                size="18"
                class="text-brand"
              />
              <h5
                class="text-[10px] font-black uppercase tracking-widest text-primary"
              >
                Orçamentos Recentes
              </h5>
            </div>
            <div class="space-y-3">
              <div
                v-for="orc in selectedHistory.orcamentos"
                :key="orc.id"
                class="p-4 bg-surface border border-border rounded-2xl flex justify-between items-center group hover:border-brand/30 transition-all cursor-pointer"
                @click="navigateToOrcamento(orc.id)"
              >
                <div>
                  <p
                    class="text-xs font-black text-primary uppercase line-clamp-1 group-hover:text-brand transition-colors"
                  >
                    {{ orc.produto?.produto || orc.produtoNome }}
                  </p>
                  <p
                    class="text-[9px] font-bold text-secondary opacity-60 mt-0.5"
                  >
                    {{ formatDate(orc.createdAt) }} • {{ orc.qtd }} m³
                  </p>
                </div>
                <div class="text-right flex items-center gap-3">
                  <div class="text-right">
                    <p class="text-xs font-black text-primary">
                      {{ formatCurrency(orc.total) }}
                    </p>
                    <span
                      class="text-[8px] font-black px-1.5 py-0.5 rounded bg-primary/3 text-secondary opacity-60 uppercase"
                    >{{ orc.status }}</span>
                  </div>
                  <button
                    class="p-1.5 rounded-lg bg-primary/2 text-secondary hover:text-brand transition-colors"
                    @click.stop="navigateToOrcamento(orc.id)"
                  >
                    <ArrowUpRight size="14" />
                  </button>
                </div>
              </div>
              <div
                v-if="!selectedHistory.orcamentos.length"
                class="p-8 text-center bg-primary/1 rounded-2xl border border-dashed border-border"
              >
                <p
                  class="text-[10px] font-bold text-secondary opacity-40 uppercase tracking-widest"
                >
                  Nenhum orçamento encontrado
                </p>
              </div>
            </div>
          </div>

          <!-- Coluna 2: Vendas e Pagamentos -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 px-2">
              <CreditCard
                size="18"
                class="text-emerald-500"
              />
              <h5
                class="text-[10px] font-black uppercase tracking-widest text-primary"
              >
                Status Financeiro
              </h5>
            </div>

            <!-- Mini resumo de pagamentos pendentes -->
            <div
              v-if="
                selectedHistory.pagamentos.some((p) => p.status === 'PENDENTE')
              "
              class="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-4"
            >
              <div class="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <Clock size="20" />
              </div>
              <div>
                <p class="text-xs font-black text-amber-600 uppercase">
                  Pagamentos em Aberto
                </p>
                <p class="text-[10px] font-bold text-amber-600/60 uppercase">
                  {{
                    selectedHistory.pagamentos.filter(
                      (p) => p.status === "PENDENTE",
                    ).length
                  }}
                  parcelas pendetes identificadas
                </p>
              </div>
            </div>

            <div class="space-y-3">
              <div
                v-for="pgto in selectedHistory.pagamentos"
                :key="pgto.id"
                class="p-4 bg-surface border border-border rounded-2xl flex justify-between items-center group hover:border-emerald-500/30 transition-all"
              >
                <div class="flex items-center gap-3">
                  <div
                    :class="[
                      'p-2 rounded-xl shrink-0',
                      pgto.status === 'PAGO'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-rose-500/10 text-rose-500',
                    ]"
                  >
                    <CheckCircle2
                      v-if="pgto.status === 'PAGO'"
                      size="16"
                    />
                    <AlertCircle
                      v-else
                      size="16"
                    />
                  </div>
                  <div>
                    <p class="text-xs font-black text-primary uppercase">
                      Parcela #{{ pgto.id }}
                    </p>
                    <p
                      class="text-[9px] font-bold text-secondary opacity-60 mt-0.5"
                    >
                      Venc: {{ formatDate(pgto.dataVencimento) }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-xs font-black text-emerald-600">
                    {{ formatCurrency(pgto.valor) }}
                  </p>
                  <p
                    :class="[
                      'text-[8px] font-black uppercase tracking-widest mt-0.5',
                      pgto.status === 'PAGO'
                        ? 'text-emerald-500'
                        : 'text-rose-500',
                    ]"
                  >
                    {{ pgto.status }}
                  </p>
                </div>
              </div>
              <div
                v-if="!selectedHistory.pagamentos.length"
                class="p-8 text-center bg-primary/1 rounded-2xl border border-dashed border-border"
              >
                <p
                  class="text-[10px] font-bold text-secondary opacity-40 uppercase tracking-widest"
                >
                  Nenhum faturamento registrado
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumo Geral das Vendas -->
        <div class="space-y-4">
          <div class="flex items-center gap-2 px-2">
            <ShoppingBag
              size="18"
              class="text-primary"
            />
            <h5
              class="text-[10px] font-black uppercase tracking-widest text-primary"
            >
              Resumo de Vendas Concluídas
            </h5>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              v-for="venda in selectedHistory.vendas.slice(0, 3)"
              :key="venda.id"
              class="bg-primary/2 p-5 rounded-3xl border border-border"
            >
              <div class="flex justify-between items-start mb-3">
                <span
                  class="text-[8px] font-black text-secondary opacity-40 uppercase tracking-widest"
                >VENDA #{{ venda.id }}</span>
                <span
                  class="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[7px] font-black"
                >{{ venda.status }}</span>
              </div>
              <p class="text-lg font-black text-primary tracking-tighter">
                {{ formatCurrency(venda.valorTotal) }}
              </p>
              <p
                class="text-[9px] font-bold text-secondary opacity-60 mt-1 uppercase"
              >
                {{ formatDate(venda.dataVenda) }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex pt-4">
          <button
            class="w-full py-4 bg-primary text-background rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
            @click="showHistoryModal = false"
          >
            Fechar Histórico do Cliente
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- Delete Confirmation Dialog -->
    <BaseDialog
      v-model="showDeleteDialog"
      title="Excluir Cliente"
      :message="`Tem certeza que deseja excluir ${clienteToDelete?.nome}? Esta ação removerá o vínculo com futuros orçamentos.`"
      type="danger"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue'
import {
  Users as UsersIcon,
  Plus,
  Search,
  Edit3,
  Trash2,
  Mail,
  Phone,
  MapPin,
  IdCard,
  Truck,
  Loader2,
  HelpCircle,
  History,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ShoppingBag,
  Clock,
  RefreshCw,
} from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'
import { useLogger } from '~/composables/useLogger'
import {
  useValidation,
  useInputMask,
  useCurrencyFormat,
} from '~/composables/useValidation'

definePageMeta({ layout: 'default' })

const { add: addToast } = useToast()
const { info, error: logError } = useLogger()
const {
  validate,
  errors,
  validateField,
  clearError,
  hasErrors,
  clearAllErrors,
} = useValidation(clienteSharedSchema)
const {
  cpfCnpj: maskCpfCnpj,
  telefone: maskTelefone,
  cep: maskCep,
} = useInputMask()
const { formatarCentavos } = useCurrencyFormat()

const { data: clientesData, refresh } = await useFetch('/api/clientes')

const searchTerm = ref('')
const itemsToShow = ref(20)
const loading = ref(false)
const cepLoading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const showDeleteDialog = ref(false)
const showHistoryModal = ref(false)
const historyLoading = ref(false)
const selectedHistory = ref(null)
const clienteToDelete = ref(null)

const form = reactive({
  id: undefined,
  nome: '',
  cpfCnpj: '',
  email: '',
  telefone: '',
  endereco: '',
  enderecoEntrega: '',
  bairro: '',
  cidade: '',
  cep: '',
  estado: '',
})

// Busca CEP Automática
watch(
  () => form.cep,
  async (newCep) => {
    const cleanCep = newCep?.replace(/\D/g, '')
    if (cleanCep?.length === 8) {
      cepLoading.value = true
      try {
        const data = await $fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        if (data.erro) {
          addToast('CEP não encontrado', 'error')
        }
        else {
          form.endereco = data.logradouro
          form.bairro = data.bairro
          form.cidade = data.localidade
          form.estado = data.uf
          addToast('Endereço preenchido!', 'success')
        }
      }
      catch (err) {
        addToast('Erro ao buscar CEP', 'error')
      }
      finally {
        cepLoading.value = false
      }
    }
  },
)

// Auto-fill search from URL query (Global Search integration)
const route = useRoute()
onMounted(() => {
  if (route.query.q) {
    searchTerm.value = String(route.query.q)
  }
})

const filteredClientes = computed(() => {
  if (!clientesData.value) return []
  const term = searchTerm.value.toLowerCase()
  return clientesData.value.filter(
    (c: any) =>
      c.nome.toLowerCase().includes(term)
      || c.cpfCnpj?.toLowerCase().includes(term)
      || (c.email && c.email.toLowerCase().includes(term)),
  )
})

const displayedClientes = computed(() => {
  return filteredClientes.value.slice(0, itemsToShow.value)
})

// Máscaras de input
const onCpfCnpjInput = (value: string) => {
  form.cpfCnpj = maskCpfCnpj(value)
  clearError('cpfCnpj')
}

const onTelefoneInput = (value: string) => {
  form.telefone = maskTelefone(value)
  clearError('telefone')
}

const onCepInput = (value: string) => {
  form.cep = maskCep(value)
}

// Formatação para exibição
const formatCpfCnpj = (value?: string) => {
  if (!value) return ''
  return maskCpfCnpj(value)
}

const formatTelefone = (value?: string) => {
  if (!value) return ''
  return maskTelefone(value)
}

const openAddModal = () => {
  isEditing.value = false
  clearAllErrors()
  Object.assign(form, {
    id: undefined,
    nome: '',
    cpfCnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    enderecoEntrega: '',
    bairro: '',
    cidade: '',
    cep: '',
    estado: '',
  })
  showModal.value = true
}

const openEditModal = (cliente: any) => {
  isEditing.value = true
  clearAllErrors()
  Object.assign(form, { ...cliente })
  showModal.value = true
}

const openHistoryModal = async (cliente: any) => {
  historyLoading.value = true
  selectedHistory.value = null
  showHistoryModal.value = true
  try {
    const data = await $fetch(`/api/clientes/${cliente.id}/historico`)
    selectedHistory.value = data
  }
  catch (err) {
    addToast('Erro ao carregar histórico', 'error')
    showHistoryModal.value = false
  }
  finally {
    historyLoading.value = false
  }
}

const navigateToOrcamento = (id: number) => {
  navigateTo(`/orcamentos?id=${id}`)
}

const formatDate = (date: string | Date) => {
  if (!date) return '---'
  return new Date(date).toLocaleDateString('pt-BR')
}

const formatCurrency = (value: number) => {
  return formatarCentavos(value)
}

const copyAddress = () => {
  form.enderecoEntrega = `${form.endereco}, ${form.bairro}, ${form.cidade} - ${form.estado}`
}

const onSubmit = async () => {
  loading.value = true

  // Validar formulário
  const result = validate(form)
  if (!result.success) {
    loading.value = false
    addToast({
      title: 'Erro de Validação',
      description: 'Corrija os campos destacados',
      type: 'error',
    })
    return
  }

  try {
    const { user: authUser } = useAuth()
    if (!authUser.value) throw new Error('Sessão expirada')

    const payload = { ...result.data, idEmpresa: authUser.value.idEmpresa }
    const url = isEditing.value ? `/api/clientes/${form.id}` : '/api/clientes'
    const method = isEditing.value ? 'PUT' : 'POST'

    await $fetch(url, {
      method,
      body: payload,
    })

    addToast(isEditing.value ? 'Cliente atualizado!' : 'Cliente cadastrado!')
    info(
      'CLIENTES',
      `${isEditing.value ? 'Edição' : 'Cadastro'} de cliente: ${form.nome}`,
      { cliente: form },
    )
    showModal.value = false
    refresh()
  }
  catch (err: any) {
    // Tratar erros de validação do backend
    if (err.data?.data) {
      const backendErrors = err.data.data
      if (Array.isArray(backendErrors)) {
        backendErrors.forEach((e: any) => {
          if (e.path) {
            errors.value[e.path[0]] = e.message
          }
        })
      }
    }

    addToast({
      title: 'Erro',
      description: err.data?.message || err.message || 'Erro ao salvar cliente',
      type: 'error',
    })
    logError(
      'CLIENTES',
      `Erro ao ${isEditing.value ? 'editar' : 'cadastrar'} cliente`,
      { error: err.message, form },
    )
  }
  finally {
    loading.value = false
  }
}

const confirmDelete = (cliente: any) => {
  clienteToDelete.value = cliente
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  try {
    await $fetch(`/api/clientes/${clienteToDelete.value.id}`, {
      method: 'DELETE',
    })

    addToast('Cliente removido com sucesso!', 'success')
    info('CLIENTES', `Cliente deletado: ${clienteToDelete.value.nome}`, {
      id: clienteToDelete.value.id,
    })
    showDeleteDialog.value = false
    refresh()
  }
  catch (err: any) {
    addToast(
      err.data?.message || 'Não foi possível remover este cliente no momento.',
      'error',
    )
    logError(
      'CLIENTES',
      `Erro ao deletar cliente: ${clienteToDelete.value?.nome}`,
      { error: err.message, id: clienteToDelete.value?.id },
    )
  }
}
</script>
