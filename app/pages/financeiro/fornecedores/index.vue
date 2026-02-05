<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">Fornecedores</h2>
        <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">
          Gerenciamento de prestadores de serviço e fornecedores
        </p>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <div class="relative flex-1 md:flex-none">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" size="18" />
          <input v-model="searchTerm" placeholder="Buscar fornecedor..."
            class="pl-12 pr-4 py-3.5 bg-primary/2 border border-border rounded-2xl text-sm font-black uppercase tracking-widest text-primary placeholder:text-secondary/20 w-full md:w-80 focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all outline-none" />
        </div>
        <button @click="openModal()"
          class="flex items-center gap-2 px-6 py-3.5 bg-brand text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all">
          <Plus size="18" />
          <span>Novo Fornecedor</span>
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden min-h-[400px]">
      <div v-if="pending" class="flex flex-col items-center justify-center p-20 gap-4">
        <div class="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-40">Carregando fornecedores...</p>
      </div>

      <template v-else>
        <BaseTable :headers="['ID', 'Fornecedor', 'Contato', 'Documento', 'Telefone', 'Email', '']">
          <tr v-for="item in displayedFornecedores" :key="item.id" class="group hover:bg-primary/1 transition-colors border-b border-border/50 last:border-0">
            <td class="px-8 py-5">
              <span class="text-xs font-black text-secondary opacity-40 tabular-nums">#{{ String(item.id).padStart(4, '0') }}</span>
            </td>
            <td class="px-8 py-5">
              <span class="text-sm font-black uppercase tracking-tight text-primary">{{ item.nome }}</span>
            </td>
            <td class="px-8 py-5 text-xs font-black uppercase tracking-tight text-secondary opacity-60">
              {{ item.contato || '---' }}
            </td>
            <td class="px-8 py-5 text-xs font-black uppercase tracking-tight text-secondary opacity-60">
              {{ item.cnpj || '---' }}
            </td>
            <td class="px-8 py-5 text-xs font-black uppercase tracking-tight text-secondary opacity-60">
              {{ item.telefone || '---' }}
            </td>
            <td class="px-8 py-5 text-xs font-black uppercase tracking-tight text-secondary opacity-60">
              {{ item.email || '---' }}
            </td>
            <td class="px-8 py-5 text-right">
              <div class="flex items-center justify-end gap-2">
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

        <div v-if="filteredFornecedores.length === 0" class="flex flex-col items-center justify-center p-20 text-center">
          <div class="p-6 rounded-full bg-primary/3 mb-4">
            <Users size="32" class="text-secondary/20" />
          </div>
          <h3 class="text-lg font-black text-primary uppercase tracking-tighter">Nenhum fornecedor encontrado</h3>
          <p class="text-sm font-medium text-secondary/60 max-w-xs mx-auto mt-2">
            Não existem fornecedores que correspondam à sua busca ou não há registros.
          </p>
        </div>

        <!-- Pagination / Infinite Load -->
        <div v-if="filteredFornecedores.length > itemsToShow" class="flex justify-center py-8 border-t border-border/50">
          <button @click="itemsToShow += 20" 
            class="bg-surface border border-border px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-secondary hover:text-brand hover:border-brand/30 transition-all flex items-center gap-3 group">
            <RefreshCw size="14" class="group-hover:rotate-180 transition-transform duration-500" />
            Carregar mais fornecedores
          </button>
        </div>
      </template>
    </div>

    <!-- Modal Form -->
    <BaseModal v-model="showModal" :title="editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'" size="md">
      <form @submit.prevent="saveFornecedor" class="space-y-6">
        <div class="grid grid-cols-1 gap-6">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 ml-1">Nome / Razão Social</label>
            <BaseInput v-model="form.nome" placeholder="EX: CEMENTO EXPRESS LTDA" required :icon="Users" />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 ml-1">CNPJ / CPF</label>
              <BaseInput v-model="form.cnpj" placeholder="00.000.000/0000-00" mask="cpfCnpj" :icon="FileText" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 ml-1">Pessoa de Contato</label>
              <BaseInput v-model="form.contato" placeholder="EX: JOÃO SILVA" :icon="User" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 ml-1">Telefone / WhatsApp</label>
              <BaseInput v-model="form.telefone" placeholder="(00) 00000-0000" mask="phone" :icon="Phone" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60 ml-1">E-mail</label>
              <BaseInput v-model="form.email" placeholder="fornecedor@email.com" type="email" :icon="Mail" />
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <button type="button" @click="showModal = false"
            class="flex-1 px-6 py-4 bg-primary/3 text-secondary rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-primary/5 transition-all">
            Cancelar
          </button>
          <button type="submit" :disabled="loading"
            class="flex-1 px-8 py-4 bg-brand text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale">
            <span v-if="loading">Salvando...</span>
            <span v-else>{{ editingId ? 'Salvar Alterações' : 'Cadastrar Fornecedor' }}</span>
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseDialog v-model="showDeleteDialog" title="Excluir Fornecedor"
      :message="`Tem certeza que deseja excluir o fornecedor ${selectedFornecedor?.nome}? Esta ação não pode ser desfeita.`"
      type="danger" confirm-text="Sim, Excluir" cancel-text="Cancelar" @confirm="handleDelete" />
  </div>
</template>

<script setup>
import { Search, Plus, Edit3, Trash2, Users, FileText, User, Phone, Mail, RefreshCw } from 'lucide-vue-next'

const { user } = useAuth()
const toast = useToast()

const searchTerm = ref('')
const itemsToShow = ref(20)
const showModal = ref(false)
const showDeleteDialog = ref(false)
const loading = ref(false)
const editingId = ref(null)
const selectedFornecedor = ref(null)

const form = ref({
  nome: '',
  contato: '',
  cnpj: '',
  telefone: '',
  email: '',
  idEmpresa: user.value?.idEmpresa
})

// Data fetching
const { data: fornecedores, pending, refresh } = await useFetch('/api/financeiro/fornecedores')

const filteredFornecedores = computed(() => {
  if (!fornecedores.value) return []
  if (!searchTerm.value) return fornecedores.value
  const term = searchTerm.value.toLowerCase()
  return fornecedores.value.filter(f => 
    f.nome.toLowerCase().includes(term) || 
    f.cnpj?.toLowerCase().includes(term) ||
    f.contato?.toLowerCase().includes(term)
  )
})

const displayedFornecedores = computed(() => {
  return filteredFornecedores.value.slice(0, itemsToShow.value)
})

const openModal = (item = null) => {
  if (item) {
    editingId.value = item.id
    form.value = { ...item }
  } else {
    editingId.value = null
    form.value = {
      nome: '',
      contato: '',
      cnpj: '',
      telefone: '',
      email: '',
      idEmpresa: user.value?.idEmpresa
    }
  }
  showModal.value = true
}

const saveFornecedor = async () => {
  try {
    loading.value = true
    const method = editingId.value ? 'PUT' : 'POST'
    const url = editingId.value 
      ? `/api/financeiro/fornecedores/${editingId.value}` 
      : '/api/financeiro/fornecedores'

    await $fetch(url, {
      method,
      body: form.value
    })

    toast.success(editingId.value ? 'Fornecedor atualizado com sucesso' : 'Fornecedor cadastrado com sucesso')
    showModal.value = false
    refresh()
  } catch (error) {
    toast.error(error.data?.message || 'Erro ao salvar fornecedor')
  } finally {
    loading.value = false
  }
}

const confirmDelete = (item) => {
  selectedFornecedor.value = item
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  try {
    await $fetch(`/api/financeiro/fornecedores/${selectedFornecedor.value.id}`, {
      method: 'DELETE'
    })
    toast.success('Fornecedor excluído com sucesso')
    refresh()
  } catch (error) {
    toast.error(error.data?.message || 'Erro ao excluir fornecedor')
  }
}
</script>
