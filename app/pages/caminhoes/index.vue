<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Caminhões
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Gestão de frota pesada e capacidade logística
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
            placeholder="Buscar por placa ou modelo..."
            class="pl-12 pr-4 py-3.5 bg-primary/2 border border-border rounded-2xl text-sm font-black uppercase tracking-widest text-primary placeholder:text-secondary/20 w-full md:w-80 focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all outline-none"
          >
        </div>
        <button
          class="bg-brand text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-brand/20 outline-none"
          @click="openAddModal"
        >
          <Plus size="20" />
          Novo Veículo
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div
      class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden"
    >
      <BaseTable :headers="['Veículo', 'Capacidade', 'Status', '']">
        <tr
          v-for="caminhao in displayedCaminhoes"
          :key="caminhao.id"
          class="group hover:bg-primary/2 transition-colors"
        >
          <td class="px-8 py-5">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-[1.2rem] bg-brand/10 flex items-center justify-center text-brand border border-brand/20 group-hover:border-brand/40 transition-colors"
              >
                <Truck size="20" />
              </div>
              <div class="flex flex-col">
                <span
                  class="text-sm font-black uppercase tracking-tight text-primary"
                >{{ caminhao.placa }}</span>
                <span
                  class="text-[10px] font-black uppercase tracking-widest opacity-40"
                >{{ caminhao.modelo || "Modelo não informado" }}</span>
              </div>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center gap-2">
              <span class="text-sm font-black text-primary tabular-nums">{{
                caminhao.capacidade
              }}</span>
              <span
                class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40"
              >m³</span>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full shadow-[0_0_10px]',
                  caminhao.ativo
                    ? 'bg-emerald-500 shadow-emerald-500/50'
                    : 'bg-rose-500 shadow-rose-500/50',
                ]"
              />
              <span
                class="text-[10px] font-black uppercase tracking-widest"
                :class="
                  caminhao.ativo
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                "
              >
                {{ caminhao.ativo ? "Operacional" : "Manutenção" }}
              </span>
            </div>
          </td>
          <td class="px-6 py-4">
            <div class="flex items-center justify-end gap-2">
              <BaseTooltip text="Editar">
                <button
                  class="p-2.5 rounded-xl text-secondary hover:text-brand hover:bg-primary/3 hover:scale-110 transition-all"
                  @click="openEditModal(caminhao)"
                >
                  <Edit3 size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Excluir">
                <button
                  class="p-2.5 rounded-xl text-secondary hover:text-rose-500 hover:bg-rose-500/10 hover:scale-110 transition-all"
                  @click="confirmDelete(caminhao)"
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
        v-if="!filteredCaminhoes.length"
        class="p-20 text-center"
      >
        <div
          class="w-16 h-16 bg-primary/2 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border"
        >
          <Truck
            size="32"
            class="text-secondary opacity-20"
          />
        </div>
        <h3 class="text-lg font-black uppercase tracking-tight text-primary">
          Nenhum caminhão encontrado
        </h3>
        <p
          class="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-50"
        >
          Cadastre os veículos da sua frota para gerenciar a capacidade de
          carga.
        </p>
      </div>

      <div
        v-else-if="itemsToShow < filteredCaminhoes.length"
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
          Carregar mais caminhões
        </button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <BaseModal
      v-model="showModal"
      :title="isEditing ? 'Editar Veículo' : 'Novo Veículo'"
      size="md"
    >
      <form
        class="space-y-6 pt-4"
        @submit.prevent="saveCaminhao"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
            >Placa <span class="text-brand">*</span></label>
            <BaseInput
              v-model="form.placa"
              placeholder="ABC-1234"
              :icon="Hash"
              :error="errors.placa"
              required
              @input="onPlacaInput"
            />
          </div>
          <div class="space-y-2">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
            >Capacidade (m³) <span class="text-brand">*</span></label>
            <BaseInput
              v-model.number="form.capacidade"
              type="number"
              step="0.5"
              placeholder="8.0"
              :icon="Layers"
              :error="errors.capacidade"
              required
            />
          </div>
        </div>

        <div class="space-y-2">
          <label
            class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
          >Modelo / Descrição</label>
          <BaseInput
            v-model="form.modelo"
            placeholder="Ex: VW Constellation 24.280"
            :icon="Activity"
            :error="errors.modelo"
          />
        </div>

        <div
          class="flex items-center gap-3 p-4 bg-primary/2 rounded-2xl border border-border"
        >
          <div class="flex-1">
            <h4
              class="text-[10px] font-black uppercase tracking-widest text-primary"
            >
              Status do Veículo
            </h4>
            <p class="text-[9px] font-bold text-secondary uppercase opacity-40">
              Veículo operando em carga normal
            </p>
          </div>
          <BaseToggle
            v-model="form.ativo"
            color-class="bg-emerald-500"
          />
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="button"
            class="flex-1 px-6 py-4 border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-primary/2 transition-all outline-none"
            @click="showModal = false"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-2 bg-brand text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand/20 disabled:opacity-50 outline-none"
          >
            {{
              loading
                ? "Salvando..."
                : isEditing
                  ? "Salvar Alterações"
                  : "Criar Veículo"
            }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Confirmation -->
    <BaseDialog
      v-model="showDeleteDialog"
      title="Remover Veículo"
      message="Esta ação não pode ser desfeita. O veículo será removido permanentemente da frota."
      type="danger"
      confirm-label="Sim, Remover"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  Search,
  Plus,
  Truck,
  Hash,
  Edit3,
  Trash2,
  Activity,
  Layers,
  RefreshCw,
} from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'
import { useLogger } from '~/composables/useLogger'
import { useAuth } from '~/composables/useAuth'
import { useValidation, useInputMask } from '~/composables/useValidation'

definePageMeta({ layout: 'default' })

const { add: addToast } = useToast()
const { info, error: logError } = useLogger()
const { user: authUser } = useAuth()

const { data: caminhoes, refresh } = await useFetch('/api/caminhoes')

const searchTerm = ref('')
const itemsToShow = ref(20)
const loading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const showDeleteDialog = ref(false)
const caminhaoToDelete = ref(null)

const { validate, errors, hasErrors, clearAllErrors }
  = useValidation(caminhaoSharedSchema)
const { placa } = useInputMask()

const form = reactive({
  id: null,
  placa: '',
  modelo: '',
  capacidade: 8,
  ativo: true,
  idEmpresa: 1,
})

const filteredCaminhoes = computed(() => {
  if (!caminhoes.value) return []
  const term = searchTerm.value.toLowerCase()
  return caminhoes.value.filter(
    c =>
      c.placa.toLowerCase().includes(term)
      || c.modelo?.toLowerCase().includes(term),
  )
})

const displayedCaminhoes = computed(() =>
  filteredCaminhoes.value.slice(0, itemsToShow.value),
)

const openAddModal = () => {
  isEditing.value = false
  Object.assign(form, {
    id: null,
    placa: '',
    modelo: '',
    capacidade: 8,
    ativo: true,
    idEmpresa: 1,
  })
  showModal.value = true
}

const openEditModal = (caminhao) => {
  isEditing.value = true
  Object.assign(form, { ...caminhao, ativo: !!caminhao.ativo })
  showModal.value = true
}

const onPlacaInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  input.value = placa(input.value)
  form.placa = input.value
}

const saveCaminhao = async () => {
  loading.value = true
  clearAllErrors()

  try {
    if (!authUser.value) throw new Error('Sessão expirada')

    // Validação com schema
    const result = validate(form)
    if (!result.success) {
      addToast({
        title: 'Erro de Validação',
        description: 'Verifique os campos destacados.',
        type: 'error',
      })
      loading.value = false
      return
    }

    const payload = {
      ...result.data,
      idEmpresa: authUser.value.idEmpresa,
      ativo: !!result.data.ativo,
    }

    const url = isEditing.value
      ? `/api/caminhoes/${form.id}`
      : '/api/caminhoes'
    const method = isEditing.value ? 'PUT' : 'POST'

    await $fetch(url, { method, body: payload })

    addToast({
      title: isEditing.value ? 'Frota Atualizada' : 'Veículo Cadastrado',
      description: 'As informações foram salvas com sucesso.',
      type: 'success',
    })

    info(
      'CAMINHOES',
      `${isEditing.value ? 'Edição' : 'Cadastro'} de caminhão: ${result.data.placa}`,
      { caminhao: payload },
    )
    showModal.value = false
    refresh()
  }
  catch (err) {
    addToast({
      title: 'Erro',
      description:
        err.data?.message
        || err.data?.statusMessage
        || 'Não foi possível salvar os dados do veículo.',
      type: 'error',
    })
    logError(
      'CAMINHOES',
      `Erro ao ${isEditing.value ? 'editar' : 'cadastrar'} caminhão`,
      { error: err.message, form },
    )
  }
  finally {
    loading.value = false
  }
}

const confirmDelete = (caminhao) => {
  caminhaoToDelete.value = caminhao
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  try {
    await $fetch(`/api/caminhoes/${caminhaoToDelete.value.id}`, {
      method: 'DELETE',
    })
    addToast({
      title: 'Removido',
      description: 'O veículo foi removido da frota com sucesso.',
      type: 'success',
    })
    refresh()
  }
  catch (err) {
    addToast({
      title: 'Erro',
      description:
        err.data?.message
        || 'Falha ao tentar remover o veículo. Verifique se ele possui entregas vinculadas.',
      type: 'error',
    })
  }
  finally {
    showDeleteDialog.value = false
  }
}
</script>
