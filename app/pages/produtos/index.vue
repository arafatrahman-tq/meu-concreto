<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Produtos
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Gestão de traços de concreto e insumos
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
            class="pl-12 pr-4 py-3.5 bg-primary/2 border border-border rounded-2xl text-sm font-black uppercase tracking-widest text-primary placeholder:text-secondary/20 w-full md:w-80 focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all outline-none"
          >
        </div>
        <button
          class="bg-brand text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-brand/20 outline-none"
          @click="openAddModal"
        >
          <Plus size="20" />
          Novo Produto
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div
      class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden"
    >
      <BaseTable
        :headers="['Produto', 'Especificações', 'Preço Venda', 'Status', '']"
      >
        <tr
          v-for="produto in displayedProdutos"
          :key="produto.id"
          class="group hover:bg-primary/2 transition-colors"
        >
          <td class="px-8 py-5">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-[1.2rem] bg-brand/10 flex items-center justify-center text-brand font-black text-xs border border-brand/20 group-hover:border-brand/40 transition-colors"
              >
                {{ produto.produto.charAt(0).toUpperCase() }}
              </div>
              <div class="flex flex-col">
                <span
                  class="text-sm font-black uppercase tracking-tight text-primary"
                >{{ produto.produto }}</span>
                <span
                  class="text-[10px] font-black uppercase opacity-30 mt-0.5"
                >{{ produto.unidadeMedida }}</span>
              </div>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center gap-3">
              <div
                v-if="produto.fck"
                class="flex flex-col"
              >
                <span
                  class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40"
                >FCK</span>
                <span
                  class="text-xs font-black uppercase text-primary tracking-tight"
                >{{ produto.fck }}</span>
              </div>
              <div
                v-if="produto.slump"
                class="flex flex-col"
              >
                <span
                  class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40"
                >Slump</span>
                <span
                  class="text-xs font-black uppercase text-primary tracking-tight"
                >{{ produto.slump }}</span>
              </div>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col">
              <span
                class="text-sm font-black uppercase tracking-tight text-brand"
              >
                {{ formatCurrency(produto.valorVenda) }}
              </span>
              <span
                v-if="produto.valorCusto"
                class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
              >
                Custo: {{ formatCurrency(produto.valorCusto) }}
              </span>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full shadow-[0_0_10px]',
                  produto.ativo
                    ? 'bg-emerald-500 shadow-emerald-500/50'
                    : 'bg-rose-500 shadow-rose-500/50',
                ]"
              />
              <span
                class="text-[10px] font-black uppercase tracking-widest"
                :class="
                  produto.ativo
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                "
              >
                {{ produto.ativo ? "Ativo" : "Inativo" }}
              </span>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center justify-end gap-2">
              <BaseTooltip text="Mix Design (Traço)">
                <button
                  class="p-2.5 rounded-xl bg-primary/3 text-secondary hover:text-emerald-500 hover:scale-110 active:scale-95 transition-all"
                  @click="openMixDesignModal(produto)"
                >
                  <FlaskConical size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Editar">
                <button
                  class="p-2.5 rounded-xl bg-primary/3 text-secondary hover:text-brand hover:scale-110 active:scale-95 transition-all"
                  @click="openEditModal(produto)"
                >
                  <Edit3 size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Excluir">
                <button
                  class="p-2.5 rounded-xl bg-primary/3 text-secondary hover:text-rose-500 hover:scale-110 active:scale-95 transition-all"
                  @click="confirmDelete(produto)"
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
        v-if="!filteredProdutos.length && !loading"
        class="p-20 text-center"
      >
        <div
          class="w-16 h-16 bg-primary/2 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border"
        >
          <PackageIcon
            size="32"
            class="text-secondary/20"
          />
        </div>
        <h3 class="text-lg font-black uppercase tracking-tight text-primary">
          Nenhum produto encontrado
        </h3>
        <p
          class="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-50"
        >
          Cadastre novos traços de concreto ou insumos para orçamentos.
        </p>
      </div>
    </div>

    <!-- Pagination / Infinite Load -->
    <div
      v-if="filteredProdutos.length > itemsToShow"
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
        Carregar mais produtos
      </button>
    </div>

    <!-- Add/Edit Modal -->
    <BaseModal
      v-model="showModal"
      :title="isEditing ? 'Editar Produto' : 'Novo Produto'"
      size="lg"
    >
      <form
        class="space-y-6 pt-4"
        @submit.prevent="onSubmit"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5 col-span-2">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
            >Nome do Produto <span class="text-brand">*</span></label>
            <BaseInput
              v-model="form.produto"
              placeholder="Ex: Concreto FCK 25 Mpa"
              :icon="Package"
              :error="errors.produto"
              @blur="validateField('produto', form.produto)"
            />
          </div>

          <div class="space-y-1.5">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
            >Valor Unitário Venda <span class="text-brand">*</span></label>
            <BaseCurrency
              v-model="form.valorVenda"
              :centavos="true"
              placeholder="R$ 0,00"
              :icon="DollarSign"
              :error="errors.valorVenda"
              @blur="validateField('valorVenda', form.valorVenda)"
            />
          </div>

          <div class="space-y-1.5">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
            >Valor Unitário Custo</label>
            <BaseCurrency
              v-model="form.valorCusto"
              :centavos="true"
              placeholder="R$ 0,00"
              :icon="TrendingDown"
              :error="errors.valorCusto"
              @blur="validateField('valorCusto', form.valorCusto)"
            />
          </div>

          <div class="space-y-1.5">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
            >Unidade Medida</label>
            <BaseSelect
              v-model="form.unidadeMedida"
              :options="unidadeOptions"
              :icon="Ruler"
            />
          </div>

          <div class="space-y-1.5">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
            >FCK (Mpa)</label>
            <BaseInput
              v-model="form.fck"
              placeholder="Ex: 30"
              :icon="Activity"
              :error="errors.fck"
            />
          </div>

          <div class="space-y-1.5">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
            >Slump (mm)</label>
            <BaseInput
              v-model.number="form.slump"
              type="number"
              placeholder="Ex: 100"
              :icon="Layers"
              :error="errors.slump"
            />
          </div>

          <div class="space-y-1.5">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
            >Tipo de Brita</label>
            <BaseInput
              v-model="form.britaTipo"
              placeholder="Ex: Brita 1"
              :icon="Box"
            />
          </div>

          <div class="space-y-1.5">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
            >Aditivo</label>
            <BaseInput
              v-model="form.aditivo"
              placeholder="Ex: Plastificante"
              :icon="Activity"
            />
          </div>

          <div class="space-y-2 col-span-2">
            <label
              class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary ml-1 opacity-60"
            >Descrição / Observações</label>
            <BaseInput
              v-model="form.descricao"
              placeholder="Detalhes adicionais do produto..."
            />
          </div>
        </div>

        <div
          class="p-6 bg-primary/2 rounded-3xl border border-border space-y-4"
        >
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span
                class="text-xs font-black uppercase tracking-tight text-primary"
              >Produto Ativo</span>
              <span class="text-[10px] font-black uppercase opacity-40">Disponível para novos orçamentos</span>
            </div>
            <BaseToggle v-model="form.ativo" />
          </div>
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
            class="flex-1 px-8 py-4 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand/20 disabled:opacity-50 flex items-center justify-center gap-3 outline-none"
          >
            <template v-if="loading">
              <div
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              />
              Processando...
            </template>
            <template v-else>
              {{ isEditing ? "Salvar Alterações" : "Criar Produto" }}
            </template>
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Confirmation Dialog -->
    <BaseDialog
      v-model="showDeleteDialog"
      title="Excluir Produto"
      :message="`Tem certeza que deseja remover ${produtoToDelete?.produto}? Esta ação não pode ser desfeita.`"
      variant="danger"
      @confirm="handleDelete"
    />

    <!-- Mix Design (Traço) Modal -->
    <BaseModal
      v-model="showMixModal"
      :title="`Mix Design: ${selectedProduto?.produto}`"
      size="xl"
    >
      <div class="space-y-6 pt-4">
        <div class="p-6 bg-brand/5 border border-brand/10 rounded-3xl">
          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand"
            >
              <FlaskConical size="24" />
            </div>
            <div class="flex-1">
              <h4
                class="text-sm font-black uppercase tracking-tight text-primary"
              >
                Composição do Produto
              </h4>
              <p
                class="text-[10px] font-black uppercase opacity-40 mt-1 leading-relaxed"
              >
                Defina os insumos e quantidades necessárias por unidade ({{
                  selectedProduto?.unidadeMedida
                }}) de produto. Estas quantidades serão abatidas do estoque
                automaticamente.
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="loadingMix"
          class="py-12 flex flex-col items-center justify-center space-y-4"
        >
          <div
            class="w-8 h-8 border-4 border-brand/20 border-t-brand rounded-full animate-spin"
          />
          <span
            class="text-[10px] font-black uppercase tracking-widest opacity-40"
          >Carregando dados...</span>
        </div>

        <div
          v-else
          class="space-y-6"
        >
          <!-- Tabela de Composição -->
          <div class="space-y-3">
            <div class="flex items-center justify-between mb-2">
              <span
                class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-60"
              >
                Insumos Requeridos
              </span>
              <button
                class="text-[10px] font-black uppercase tracking-widest text-brand hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                @click="addInsumoAoTraco"
              >
                <Plus size="14" />
                Adicionar Insumo
              </button>
            </div>

            <div
              v-if="tracoForm.itens.length === 0"
              class="py-12 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center px-6"
            >
              <div
                class="w-12 h-12 bg-primary/2 rounded-full flex items-center justify-center mb-4"
              >
                <Plus
                  size="24"
                  class="text-secondary/20"
                />
              </div>
              <span
                class="text-xs font-black uppercase text-primary tracking-tight"
              >Nenhum insumo adicionado</span>
              <p class="text-[10px] font-black uppercase opacity-30 mt-1">
                Este produto ainda não possui um traço definido.
              </p>
            </div>

            <div
              v-else
              class="space-y-3"
            >
              <div
                v-for="(item, index) in tracoForm.itens"
                :key="index"
                class="flex items-center gap-4 bg-primary/2 p-4 rounded-2xl border border-border group"
              >
                <div class="flex-1">
                  <BaseSelect
                    v-model="item.idInsumo"
                    :options="
                      insumosDisponiveis.map((i) => ({
                        label: `${i.nome} (${i.unidadeMedida})`,
                        value: i.id,
                      }))
                    "
                    placeholder="Selecione o Insumo"
                  />
                </div>
                <div class="w-40 relative group/input">
                  <input
                    v-model.number="item.quantidade"
                    type="number"
                    step="0.0001"
                    class="w-full pl-5 pr-12 py-3.5 bg-white border border-border rounded-xl text-sm font-black uppercase tracking-widest text-primary focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all outline-none"
                    placeholder="Qtd"
                  >
                  <span
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase opacity-30"
                  >
                    {{
                      insumosDisponiveis.find((i) => i.id === item.idInsumo)
                        ?.unidadeMedida || ""
                    }}
                  </span>
                </div>
                <button
                  class="p-2.5 rounded-xl bg-white text-rose-500 border border-border hover:bg-rose-50 hover:border-rose-200 transition-all"
                  @click="removeInsumoDoTraco(index)"
                >
                  <X size="16" />
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label
                class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary ml-1 opacity-60"
              >Nome do Traço</label>
              <BaseInput
                v-model="tracoForm.nome"
                placeholder="Ex: Traço Padrão FCK 30"
              />
            </div>
            <div class="space-y-2">
              <label
                class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary ml-1 opacity-60"
              >Observação</label>
              <BaseInput
                v-model="tracoForm.descricao"
                placeholder="Ex: Rendimento esperado..."
              />
            </div>
          </div>

          <div class="flex gap-4 pt-4 border-t border-border">
            <button
              type="button"
              class="flex-1 py-4 text-xs font-black uppercase tracking-widest text-secondary hover:bg-primary/3 rounded-2xl transition-all"
              @click="showMixModal = false"
            >
              Fechar
            </button>
            <button
              :disabled="loadingMix"
              class="flex-1 py-4 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              @click="saveMixDesign"
            >
              <template v-if="loadingMix">
                <div
                  class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                />
                Salvando...
              </template>
              <template v-else>
                Atualizar Traço
              </template>
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
  Package,
  Package as PackageIcon,
  Search,
  Plus,
  Edit3,
  Trash2,
  Activity,
  Layers,
  Box,
  DollarSign,
  TrendingDown,
  Ruler,
  RefreshCw,
  FlaskConical,
  X,
} from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'
import { useLogger } from '~/composables/useLogger'
import { useValidation, useCurrencyFormat } from '~/composables/useValidation'

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
} = useValidation(produtoSharedSchema)
const { formatarCentavos } = useCurrencyFormat()

const {
  data: produtos,
  refresh,
  pending: loadingFetch,
} = await useFetch('/api/produtos')

const loading = ref(false)
watch(
  loadingFetch,
  (val) => {
    loading.value = val
  },
  { immediate: true },
)

const searchTerm = ref('')
const itemsToShow = ref(20)
const showModal = ref(false)
const isEditing = ref(false)
const showDeleteDialog = ref(false)
const produtoToDelete = ref(null)

// Mix Design (Traço) State
const showMixModal = ref(false)
const selectedProduto = ref(null)
const insumosDisponiveis = ref([])
const tracoForm = reactive({
  id: null,
  nome: '',
  descricao: '',
  itens: [],
})
const loadingMix = ref(false)

const form = reactive({
  id: undefined,
  produto: '',
  valorVenda: 0,
  valorCusto: 0,
  unidadeMedida: 'm³',
  fck: '',
  slump: null,
  britaTipo: '',
  aditivo: '',
  descricao: '',
  ativo: true,
})

const unidadeOptions = [
  { label: 'Metro Cúbico (m³)', value: 'm³' },
  { label: 'Unidade (un)', value: 'un' },
  { label: 'Quilo (kg)', value: 'kg' },
  { label: 'Tonelada (t)', value: 't' },
]

// Auto-fill search from URL query (Global Search integration)
const route = useRoute()
onMounted(() => {
  if (route.query.q) {
    searchTerm.value = String(route.query.q)
  }
})

const filteredProdutos = computed(() => {
  if (!produtos.value) return []
  const term = searchTerm.value.toLowerCase()
  return produtos.value.filter(
    (p: any) =>
      p.produto.toLowerCase().includes(term)
      || (p.fck && p.fck.toLowerCase().includes(term)),
  )
})

const displayedProdutos = computed(() => {
  return filteredProdutos.value.slice(0, itemsToShow.value)
})

const openMixDesignModal = async (produto: any) => {
  selectedProduto.value = produto
  tracoForm.nome = `Traço - ${produto.produto}`
  tracoForm.descricao = `Composição padrão para ${produto.produto}`
  tracoForm.itens = []
  tracoForm.id = null

  showMixModal.value = true
  loadingMix.value = true

  try {
    // Buscar insumos para o select
    const insumosData = await $fetch('/api/insumos')
    insumosDisponiveis.value = insumosData as any[]

    // Buscar traço existente para este produto
    const tracos = await $fetch(`/api/tracos?idProduto=${produto.id}`)
    if (tracos && Array.isArray(tracos) && tracos.length > 0) {
      const t = tracos[0] as any
      tracoForm.id = t.id
      tracoForm.nome = t.nome
      tracoForm.descricao = t.descricao
      tracoForm.itens = t.itens.map((it: any) => ({
        idInsumo: it.idInsumo,
        quantidade: it.quantidade,
      }))
    }
  }
  catch (err) {
    console.error('Erro ao carregar mix design:', err)
    addToast({
      title: 'Erro',
      description:
        'Não foi possível carregar as informações da composição (traço).',
      type: 'error',
    })
  }
  finally {
    loadingMix.value = false
  }
}

const addInsumoAoTraco = () => {
  tracoForm.itens.push({ idInsumo: null as any, quantidade: 0 })
}

const removeInsumoDoTraco = (index: number) => {
  tracoForm.itens.splice(index, 1)
}

const saveMixDesign = async () => {
  if (tracoForm.itens.length === 0) {
    addToast({
      title: 'Atenção',
      description: 'Adicione pelo menos um insumo ao traço.',
      type: 'warn',
    })
    return
  }

  loadingMix.value = true
  try {
    const payload = {
      idProduto: selectedProduto.value.id,
      nome: tracoForm.nome,
      descricao: tracoForm.descricao,
      itens: tracoForm.itens.filter(i => i.idInsumo && i.quantidade > 0),
    }

    if (tracoForm.id) {
      await $fetch(`/api/tracos/${tracoForm.id}`, {
        method: 'PUT',
        body: payload,
      })
    }
    else {
      await $fetch('/api/tracos', { method: 'POST', body: payload })
    }

    addToast({
      title: 'Traço Salvo',
      description: 'A composição do produto foi atualizada.',
      type: 'success',
    })
    showMixModal.value = false
  }
  catch (err: any) {
    addToast({
      title: 'Erro',
      description:
        err.data?.message || 'Falha ao tentar salvar a composição do produto.',
      type: 'error',
    })
  }
  finally {
    loadingMix.value = false
  }
}

const openAddModal = () => {
  isEditing.value = false
  clearAllErrors()
  Object.assign(form, {
    id: undefined,
    produto: '',
    valorVenda: 0,
    valorCusto: 0,
    unidadeMedida: 'm³',
    fck: '',
    slump: null,
    britaTipo: '',
    aditivo: '',
    descricao: '',
    ativo: true,
  })
  showModal.value = true
}

const openEditModal = (p: any) => {
  isEditing.value = true
  clearAllErrors()
  // O backend retorna valores em centavos, o BaseCurrency lida com isso
  Object.assign(form, {
    ...p,
    ativo: !!p.ativo,
  })
  showModal.value = true
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
    const payload = {
      ...result.data,
      ativo: !!form.ativo,
    }

    const url = isEditing.value ? `/api/produtos/${form.id}` : '/api/produtos'
    const method = isEditing.value ? 'PUT' : 'POST'

    await $fetch(url, {
      method,
      body: payload,
    })

    addToast({
      title: isEditing.value ? 'Produto Atualizado' : 'Produto Criado',
      description: `O produto foi ${isEditing.value ? 'atualizado' : 'cadastrado'} com sucesso.`,
      type: 'success',
    })
    info(
      'PRODUTOS',
      `${isEditing.value ? 'Edição' : 'Cadastro'} de produto: ${form.produto}`,
      { produto: payload },
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
      description: err.data?.message || err.message || 'Erro ao salvar produto',
      type: 'error',
    })
    logError(
      'PRODUTOS',
      `Erro ao ${isEditing.value ? 'editar' : 'cadastrar'} produto`,
      { error: err.message, form },
    )
  }
  finally {
    loading.value = false
  }
}

const confirmDelete = (p: any) => {
  produtoToDelete.value = p
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  try {
    await $fetch(`/api/produtos/${produtoToDelete.value.id}`, {
      method: 'DELETE',
    })
    addToast({
      title: 'Produto Removido',
      description: 'O registro foi excluído permanentemente.',
      type: 'success',
    })
    info('PRODUTOS', `Produto removido: ${produtoToDelete.value.produto}`, {
      id: produtoToDelete.value.id,
    })
    refresh()
  }
  catch (err: any) {
    addToast({
      title: 'Erro',
      description:
        err.data?.message
        || 'Este produto não pode ser removido, talvez ele já esteja vinculado a pedidos ou orçamentos.',
      type: 'error',
    })
    logError(
      'PRODUTOS',
      `Erro ao remover produto: ${produtoToDelete.value?.produto}`,
      { error: err.message, id: produtoToDelete.value?.id },
    )
  }
  finally {
    showDeleteDialog.value = false
  }
}

const formatCurrency = (value?: number) => {
  return formatarCentavos(value)
}
</script>

<style scoped>
.animate-enter {
  animation: enter 0.4s cubic-bezier(0.2, 0, 0, 1) forwards;
}

@keyframes enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
