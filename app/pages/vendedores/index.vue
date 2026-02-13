<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Vendedores
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Gestão de equipe de vendas e comissionamento
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
          class="bg-brand text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-brand/20"
          @click="openAddModal"
        >
          <Plus size="20" />
          Novo Vendedor
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div
      class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden"
    >
      <BaseTable :headers="['Vendedor', 'Contato', 'Status', '']">
        <tr
          v-for="vendedor in displayedVendedores"
          :key="vendedor.id"
          class="group hover:bg-primary/2 transition-colors"
        >
          <td class="px-8 py-5">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-[1.2rem] bg-brand/10 flex items-center justify-center text-brand font-black text-xs border border-brand/20 group-hover:border-brand/40 transition-colors"
              >
                {{ vendedor.nome.charAt(0).toUpperCase() }}
              </div>
              <span
                class="text-sm font-black uppercase tracking-tight text-primary"
              >{{ vendedor.nome }}</span>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col gap-0.5">
              <span
                class="text-xs font-black uppercase tracking-widest text-primary"
              >{{ vendedor.telefone || "---" }}</span>
              <span
                class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-40"
              >{{ vendedor.email || "---" }}</span>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full shadow-[0_0_10px]',
                  vendedor.ativo
                    ? 'bg-emerald-500 shadow-emerald-500/50'
                    : 'bg-rose-500 shadow-rose-500/50',
                ]"
              />
              <span
                class="text-[10px] font-black uppercase tracking-widest"
                :class="
                  vendedor.ativo
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                "
              >
                {{ vendedor.ativo ? "Ativo" : "Inativo" }}
              </span>
            </div>
          </td>
          <td class="px-6 py-4">
            <div class="flex items-center justify-end gap-2">
              <BaseTooltip text="Editar">
                <button
                  class="p-2.5 rounded-xl text-secondary hover:text-brand hover:bg-primary/3 hover:scale-110 transition-all"
                  @click="openEditModal(vendedor)"
                >
                  <Edit3 size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Excluir">
                <button
                  class="p-2.5 rounded-xl text-secondary hover:text-rose-500 hover:bg-rose-500/10 hover:scale-110 transition-all"
                  @click="confirmDelete(vendedor)"
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
        v-if="!filteredVendedores.length"
        class="p-20 text-center"
      >
        <div
          class="w-16 h-16 bg-primary/2 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border"
        >
          <UsersIcon
            size="32"
            class="text-secondary opacity-20"
          />
        </div>
        <h3 class="text-lg font-black uppercase tracking-tight text-primary">
          Nenhum vendedor encontrado
        </h3>
        <p
          class="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-50"
        >
          Experimente mudar o termo da busca ou adicionar um novo vendedor.
        </p>
      </div>

      <div
        v-else-if="itemsToShow < filteredVendedores.length"
        class="p-8 flex justify-center border-t border-border"
      >
        <button
          class="flex items-center gap-2 px-6 py-3 bg-primary/2 hover:bg-primary/3 text-primary text-xs font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-105"
          @click="itemsToShow += 20"
        >
          <RefreshCw
            size="14"
            class="opacity-40"
          />
          Carregar mais vendedores
        </button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <BaseModal
      v-model="showModal"
      :title="isEditing ? 'Editar Vendedor' : 'Novo Vendedor'"
      :subtitle="
        isEditing
          ? 'Atualização de perfil comercial'
          : 'Admissão de novo integrante comercial'
      "
      size="md"
    >
      <form
        class="space-y-6 pt-4"
        @submit.prevent="saveVendedor"
      >
        <div class="space-y-2">
          <label
            class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
          >Nome Completo <span class="text-brand">*</span></label>
          <BaseInput
            v-model="form.nome"
            placeholder="Ex: Rogério Vendas"
            :icon="UserIcon"
            required
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
            >E-mail</label>
            <BaseInput
              v-model="form.email"
              type="email"
              placeholder="vendedor@empresa.com"
              :icon="Mail"
            />
          </div>
          <div class="space-y-2">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
            >Telefone</label>
            <BaseInput
              v-model="form.telefone"
              placeholder="(00) 00000-0000"
              :icon="Phone"
              mask="phone"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label
            class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
          >PIN de Acesso Mobile (4 dígitos)</label>
          <BaseInput
            v-model="form.pin"
            placeholder="Ex: 1234"
            :icon="Lock"
            maxlength="4"
          />
          <p
            class="text-[8px] font-black uppercase tracking-widest text-secondary/40 ml-2 mt-1"
          >
            Utilizado para validação de pedidos via mobile.
          </p>
        </div>

        <div class="p-6 bg-primary/2 rounded-3xl border border-border">
          <BaseCheckbox
            v-model="form.ativo"
            label="VENDEDOR ATIVO"
            description="Vendedores inativos são removidos das seleções de novos orçamentos."
          />
        </div>

        <div
          v-if="error"
          class="bg-rose-500/10 p-5 rounded-2xl border border-rose-500/20"
        >
          <p
            class="text-rose-500 text-[10px] font-black text-center uppercase tracking-widest"
          >
            {{ error }}
          </p>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="button"
            class="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-primary/3 rounded-2xl border border-border transition-all outline-none"
            @click="showModal = false"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-2 py-4 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand/20 disabled:opacity-50 outline-none"
          >
            {{
              loading
                ? "Salvando..."
                : isEditing
                  ? "Salvar Alterações"
                  : "Criar Vendedor"
            }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Confirmation Dialog -->
    <BaseDialog
      v-model="showDeleteDialog"
      title="Excluir Vendedor"
      :message="`Tem certeza que deseja excluir ${vendedorToDelete?.nome}? Esta ação pode afetar históricos de vendas.`"
      type="danger"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  User as UserIcon,
  Plus,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Search,
  Users as UsersIcon,
  Lock,
  RefreshCw,
} from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'
import { useLogger } from '~/composables/useLogger'

definePageMeta({ layout: 'default' })

const { add: addToast } = useToast()
const { info, error: logError } = useLogger()
const { data: vendedores, refresh } = await useFetch('/api/vendedores')

const searchTerm = ref('')
const itemsToShow = ref(20)
const loading = ref(false)
const error = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const showDeleteDialog = ref(false)
const vendedorToDelete = ref(null)

const form = reactive({
  id: null,
  nome: '',
  email: '',
  telefone: '',
  pin: '',
  ativo: true,
})

// Auto-fill search from URL query (Global Search integration)
const route = useRoute()
onMounted(() => {
  if (route.query.q) {
    searchTerm.value = String(route.query.q)
  }
})

const filteredVendedores = computed(() => {
  if (!vendedores.value) return []
  const term = searchTerm.value.toLowerCase()
  return vendedores.value.filter(
    v =>
      v.nome.toLowerCase().includes(term)
      || (v.email && v.email.toLowerCase().includes(term)),
  )
})

const displayedVendedores = computed(() =>
  filteredVendedores.value.slice(0, itemsToShow.value),
)

const openAddModal = () => {
  isEditing.value = false
  Object.assign(form, {
    id: null,
    nome: '',
    email: '',
    telefone: '',
    pin: '',
    ativo: true,
  })
  showModal.value = true
  error.value = ''
}

const openEditModal = (v) => {
  isEditing.value = true
  Object.assign(form, { ...v, ativo: !!v.ativo })
  showModal.value = true
  error.value = ''
}

const saveVendedor = async () => {
  loading.value = true
  error.value = ''

  try {
    const { user: authUser } = useAuth()
    if (!authUser.value) throw new Error('Sessão expirada')

    const payload = { ...form, idEmpresa: authUser.value.idEmpresa }

    const url = isEditing.value
      ? `/api/vendedores/${form.id}`
      : '/api/vendedores'
    const method = isEditing.value ? 'PUT' : 'POST'

    await $fetch(url, {
      method,
      body: payload,
    })

    addToast(isEditing.value ? 'Vendedor atualizado!' : 'Vendedor cadastrado!')
    info(
      'VENDEDORES',
      `${isEditing.value ? 'Edição' : 'Cadastro'} de vendedor: ${form.nome}`,
      { vendedor: payload },
    )
    showModal.value = false
    refresh()
  }
  catch (err) {
    const msg = err.data?.message || err.message || 'Erro ao salvar vendedor.'
    addToast(msg, 'error')
    logError(
      'VENDEDORES',
      `Erro ao ${isEditing.value ? 'editar' : 'cadastrar'} vendedor`,
      { error: msg, form },
    )
  }
  finally {
    loading.value = false
  }
}

const confirmDelete = (v) => {
  vendedorToDelete.value = v
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  try {
    await $fetch(`/api/vendedores/${vendedorToDelete.value.id}`, {
      method: 'DELETE',
    })

    addToast('Vendedor removido!', 'success')
    info('VENDEDORES', `Vendedor removido: ${vendedorToDelete.value.nome}`, {
      id: vendedorToDelete.value.id,
    })
    showDeleteDialog.value = false
    refresh()
  }
  catch (err) {
    const msg = err.data?.message || err.message || 'Erro ao remover vendedor.'
    addToast(msg, 'error')
    logError(
      'VENDEDORES',
      `Erro ao remover vendedor: ${vendedorToDelete.value?.nome}`,
      { error: msg, id: vendedorToDelete.value?.id },
    )
  }
}
</script>
