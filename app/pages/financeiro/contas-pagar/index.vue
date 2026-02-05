<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">Contas a Pagar</h2>
        <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">
          Gestão de compromissos financeiros e despesas
        </p>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <div class="relative flex-1 md:flex-none">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" size="18" />
          <input v-model="searchTerm" placeholder="Buscar despesa ou fornecedor..."
            class="pl-12 pr-4 py-3.5 bg-primary/2 border border-border rounded-2xl text-sm font-black uppercase tracking-widest text-primary placeholder:text-secondary/20 w-full md:w-80 focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all outline-none" />
        </div>
        <button @click="openModal()"
          class="flex items-center gap-2 px-6 py-3.5 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all">
          <Plus size="18" />
          <span>Nova Conta</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats Summary -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div v-for="stat in summaryStats" :key="stat.label" 
        class="bg-surface p-6 rounded-3xl border border-border group hover:border-brand/30 transition-all">
        <div class="flex justify-between items-start mb-4">
          <div :class="['p-3 rounded-2xl', stat.bg]">
            <component :is="stat.icon" size="20" :class="stat.iconColor" />
          </div>
        </div>
        <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">{{ stat.label }}</p>
        <p class="text-2xl font-black tracking-tighter text-primary uppercase">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Table Container -->
    <div class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden min-h-[400px]">
      <div v-if="pending" class="flex flex-col items-center justify-center p-20 gap-4">
        <div class="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-40">Carregando contas...</p>
      </div>

      <template v-else>
        <BaseTable :headers="['Vencimento', 'Descrição', 'Fornecedor', 'Valor', 'Status', '']">
          <tr v-for="item in displayedContas" :key="item.id" class="group hover:bg-primary/2 transition-colors border-b border-border/50 last:border-0">
            <td class="px-8 py-5">
              <div class="flex flex-col">
                <span class="text-xs font-black uppercase tracking-tight" 
                  :class="isAtrasado(item) ? 'text-rose-500' : 'text-secondary opacity-60'">
                  {{ formatDate(item.dataVencimento) }}
                </span>
                <span v-if="item.status === 'PAGO'" class="text-[9px] font-black uppercase opacity-30 mt-0.5 whitespace-nowrap">
                  PAGO EM {{ formatDate(item.dataPagamento) }}
                </span>
              </div>
            </td>
            <td class="px-8 py-5">
              <div class="flex flex-col">
                <span class="text-sm font-black uppercase tracking-tight text-primary">{{ item.descricao }}</span>
                <span class="text-[9px] font-black uppercase opacity-30 tracking-widest mt-0.5">{{ item.categoria }}</span>
              </div>
            </td>
            <td class="px-8 py-5 text-xs font-black uppercase tracking-tight text-secondary opacity-60">
              {{ item.fornecedor?.nome || 'AVULSO' }}
            </td>
            <td class="px-8 py-5">
              <span class="text-sm font-black uppercase tracking-tight" :class="item.status === 'PAGO' ? 'text-secondary opacity-40' : 'text-rose-500'">
                {{ formatCurrency(item.valor) }}
              </span>
            </td>
            <td class="px-8 py-5">
              <div class="flex items-center gap-2">
                <div :class="['w-2 h-2 rounded-full shadow-[0_0_10px]', statusColor[item.status]]"></div>
                <span class="text-[10px] font-black uppercase tracking-widest" :class="statusTextColor[item.status]">
                  {{ item.status }}
                </span>
              </div>
            </td>
            <td class="px-8 py-5 text-right">
              <div class="flex items-center justify-end gap-2">
                <button v-if="item.status === 'PENDENTE' || item.status === 'ATRASADO'" @click="openPagamentoModal(item)"
                  class="p-2.5 rounded-xl bg-green-500/10 text-green-600 hover:scale-110 active:scale-95 transition-all">
                  <CheckCircle2 size="16" />
                </button>
                <button @click="openModal(item)"
                  class="p-2.5 rounded-xl bg-primary/3 text-secondary hover:text-brand hover:scale-110 active:scale-95 transition-all">
                  <Edit3 size="16" />
                </button>
                <button @click="confirmDelete(item)"
                  class="p-2.5 rounded-xl bg-primary/3 text-secondary hover:text-rose-500 hover:scale-110 active:scale-95 transition-all">
                  <Trash2 size="16" />
                </button>
              </div>
            </td>
          </tr>
        </BaseTable>

        <div v-if="filteredContas.length === 0" class="flex flex-col items-center justify-center p-20 text-center">
          <div class="p-6 rounded-full bg-primary/3 mb-4">
            <Receipt size="32" class="text-secondary/20" />
          </div>
          <h3 class="text-lg font-black text-primary uppercase tracking-tighter">Nenhuma conta encontrada</h3>
          <p class="text-sm font-medium text-secondary/60 max-w-xs mx-auto mt-2">
            Não existem contas a pagar que correspondam à sua busca.
          </p>
        </div>

        <!-- Pagination / Infinite Load -->
        <div v-if="filteredContas.length > itemsToShow" class="flex justify-center py-8 border-t border-border/50">
          <button @click="itemsToShow += 20" 
            class="bg-surface border border-border px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-secondary hover:text-brand hover:border-brand/30 transition-all flex items-center gap-3 group">
            <RefreshCw size="14" class="group-hover:rotate-180 transition-transform duration-500" />
            Carregar mais contas
          </button>
        </div>
      </template>
    </div>

    <!-- Modal Form -->
    <BaseModal v-model="showModal" :title="editingId ? 'Editar Conta' : 'Nova Conta a Pagar'" size="md">
      <form @submit.prevent="saveConta" class="space-y-6">
        <div class="grid grid-cols-1 gap-6">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 ml-1">Descrição</label>
            <BaseInput v-model="form.descricao" placeholder="EX: COMPRA DE AGREGADOS" required :icon="FileText" />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 ml-1">Fornecedor</label>
              <BaseSelect v-model="form.idFornecedor" :options="fornecedoresOptions" placeholder="SELECIONE O FORNECEDOR" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 ml-1">Categoria</label>
              <BaseInput v-model="form.categoria" placeholder="EX: CUSTO OPERACIONAL" :icon="Tags" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 ml-1">Valor</label>
              <BaseInput v-model="displayValor" placeholder="R$ 0,00" :icon="DollarSign" @input="onValorInput" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 ml-1">Vencimento</label>
              <BaseInput v-model="form.dataVencimento" type="date" required :icon="Calendar" />
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="button" @click="showModal = false"
            class="flex-1 px-6 py-4 bg-primary/3 text-secondary rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-primary/5 transition-all">
            Cancelar
          </button>
          <button type="submit" :disabled="loading"
            class="flex-1 px-8 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale">
            <span v-if="loading">Salvando...</span>
            <span v-else>{{ editingId ? 'Salvar Alterações' : 'Cadastrar Conta' }}</span>
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Pagamento Modal -->
    <BaseModal v-model="showPagamentoModal" title="Confirmar Pagamento" size="sm">
      <div class="p-4 space-y-6">
        <div class="bg-primary/3 p-6 rounded-2xl border border-border/50 text-center">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40 mb-2">Total a Pagar</p>
          <p class="text-4xl font-black text-primary tracking-tighter">{{ formatCurrency(selectedConta?.valor) }}</p>
          <p class="text-xs font-black uppercase text-secondary/60 mt-2">{{ selectedConta?.descricao }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 ml-1">Data do Pagamento</label>
          <BaseInput v-model="dataPagamento" type="date" :icon="Calendar" />
        </div>

        <div class="flex gap-3">
          <button @click="showPagamentoModal = false"
            class="flex-1 px-6 py-4 bg-primary/3 text-secondary rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-primary/5 transition-all">
            Cancelar
          </button>
          <button @click="confirmPagamento" :disabled="loading"
            class="flex-1 px-8 py-4 bg-green-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all">
            Confirmar
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseDialog v-model="showDeleteDialog" title="Excluir Conta"
      :message="`Tem certeza que deseja excluir esta conta: ${selectedConta?.descricao}?`"
      type="danger" confirm-text="Sim, Excluir" @confirm="handleDelete" />
  </div>
</template>

<script setup>
import { Search, Plus, Edit3, Trash2, Receipt, FileText, Calendar, DollarSign, Tags, CheckCircle2, TrendingDown, AlertTriangle, Clock, RefreshCw } from 'lucide-vue-next'

const { user } = useAuth()
const toast = useToast()

const searchTerm = ref('')
const itemsToShow = ref(20)
const showModal = ref(false)
const showPagamentoModal = ref(false)
const showDeleteDialog = ref(false)
const loading = ref(false)
const editingId = ref(null)
const selectedConta = ref(null)
const dataPagamento = ref(new Date().toISOString().split('T')[0])

const form = ref({
  descricao: '',
  idFornecedor: null,
  valor: 0,
  dataVencimento: '',
  categoria: 'GERAL',
  idEmpresa: user.value?.idEmpresa
})

const displayValor = ref('')

const statusColor = {
  PENDENTE: 'bg-amber-500 shadow-amber-500/20',
  PAGO: 'bg-green-500 shadow-green-500/20',
  ATRASADO: 'bg-rose-500 shadow-rose-500/20',
  CANCELADO: 'bg-secondary/40 shadow-secondary/10'
}

const statusTextColor = {
  PENDENTE: 'text-amber-500',
  PAGO: 'text-green-500',
  ATRASADO: 'text-rose-500',
  CANCELADO: 'text-secondary/40'
}

// Data fetching
const { data: contas, pending, refresh } = await useFetch('/api/financeiro/contas-pagar')
const { data: fornecedores } = await useFetch('/api/financeiro/fornecedores')

const fornecedoresOptions = computed(() => {
  if (!fornecedores.value) return []
  return fornecedores.value.map(f => ({ label: f.nome, value: f.id }))
})

const filteredContas = computed(() => {
  if (!contas.value) return []
  if (!searchTerm.value) return contas.value
  const term = searchTerm.value.toLowerCase()
  return contas.value.filter(c => 
    c.descricao.toLowerCase().includes(term) || 
    c.fornecedor?.nome?.toLowerCase().includes(term) ||
    c.categoria?.toLowerCase().includes(term)
  )
})

const displayedContas = computed(() => {
  return filteredContas.value.slice(0, itemsToShow.value)
})

const summaryStats = computed(() => {
  if (!contas.value) return []
  
  const total = contas.value.reduce((acc, c) => acc + (c.status !== 'CANCELADO' ? c.valor : 0), 0)
  const pago = contas.value.reduce((acc, c) => acc + (c.status === 'PAGO' ? c.valor : 0), 0)
  const atrasado = contas.value.reduce((acc, c) => acc + (c.status === 'ATRASADO' ? c.valor : 0), 0)
  const pendente = contas.value.reduce((acc, c) => acc + (c.status === 'PENDENTE' ? c.valor : 0), 0)

  return [
    { label: 'Total Compromissos', value: formatCurrency(total), icon: Receipt, bg: 'bg-primary/3', iconColor: 'text-secondary' },
    { label: 'Total Pago', value: formatCurrency(pago), icon: TrendingDown, bg: 'bg-green-500/10', iconColor: 'text-green-600' },
    { label: 'Vencendo / Aberto', value: formatCurrency(pendente), icon: Clock, bg: 'bg-amber-500/10', iconColor: 'text-amber-600' },
    { label: 'Total em Atraso', value: formatCurrency(atrasado), icon: AlertTriangle, bg: 'bg-rose-500/10', iconColor: 'text-rose-600' },
  ]
})

const isAtrasado = (item) => {
  if (item.status === 'PAGO' || item.status === 'CANCELADO') return false
  const vencimento = new Date(item.dataVencimento)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return vencimento < hoje
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val / 100)
}

const formatDate = (date) => {
  if (!date) return '---'
  return new Date(date).toLocaleDateString('pt-BR')
}

const onValorInput = (event) => {
  let val = event.target.value.replace(/\D/g, '')
  form.value.valor = parseInt(val) || 0
  displayValor.value = formatCurrency(form.value.valor)
}

const openModal = (item = null) => {
  if (item) {
    editingId.value = item.id
    form.value = { ...item, dataVencimento: new Date(item.dataVencimento).toISOString().split('T')[0] }
    displayValor.value = formatCurrency(item.valor)
  } else {
    editingId.value = null
    form.value = {
      descricao: '',
      idFornecedor: null,
      valor: 0,
      dataVencimento: new Date().toISOString().split('T')[0],
      categoria: 'GERAL',
      idEmpresa: user.value?.idEmpresa
    }
    displayValor.value = ''
  }
  showModal.value = true
}

const openPagamentoModal = (item) => {
  selectedConta.value = item
  dataPagamento.value = new Date().toISOString().split('T')[0]
  showPagamentoModal.value = true
}

const confirmPagamento = async () => {
  try {
    loading.value = true
    await $fetch(`/api/financeiro/contas-pagar/${selectedConta.value.id}`, {
      method: 'PUT',
      body: {
        status: 'PAGO',
        dataPagamento: dataPagamento.value
      }
    })
    toast.success('Pagamento registrado com sucesso')
    showPagamentoModal.value = false
    refresh()
  } catch (error) {
    toast.error('Erro ao registrar pagamento')
  } finally {
    loading.value = false
  }
}

const saveConta = async () => {
  try {
    loading.value = true
    const method = editingId.value ? 'PUT' : 'POST'
    const url = editingId.value 
      ? `/api/financeiro/contas-pagar/${editingId.value}` 
      : '/api/financeiro/contas-pagar'

    await $fetch(url, {
      method,
      body: form.value
    })

    toast.success(editingId.value ? 'Conta atualizada' : 'Conta cadastrada')
    showModal.value = false
    refresh()
  } catch (error) {
    toast.error(error.data?.message || 'Erro ao salvar')
  } finally {
    loading.value = false
  }
}

const confirmDelete = (item) => {
  selectedConta.value = item
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  try {
    await $fetch(`/api/financeiro/contas-pagar/${selectedConta.value.id}`, {
      method: 'DELETE'
    })
    toast.success('Excluído com sucesso')
    refresh()
  } catch (error) {
    toast.error('Erro ao excluir')
  }
}
</script>
