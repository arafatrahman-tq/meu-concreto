<template>
  <div class="flex flex-col gap-6 animate-enter">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Bombas de <span class="text-brand">Concreto</span>
        </h2>
        <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">
          Gestão de equipamentos de bombeamento e serviços
        </p>
      </div>
      <div class="flex items-center gap-3 w-full md:w-auto">
        <div class="relative flex-1 md:flex-none">
          <Search
            class="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40"
            size="18"
          />
          <input
            v-model="search"
            placeholder="BUSCAR BOMBA..."
            class="pl-12 pr-4 py-3.5 bg-primary/2 border border-border rounded-2xl text-sm font-black uppercase tracking-widest text-primary placeholder:text-secondary/20 w-full md:w-64 focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all outline-none"
          >
        </div>
        <button
          class="bg-brand text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          @click="openModal()"
        >
          <Plus size="20" />
          Nova Bomba
        </button>
      </div>
    </div>

    <!-- Tabela de Bombas -->
    <div class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
      <BaseTable :headers="['Equipamento', 'Tipo', 'Placa', 'Status', '']">
        <tr
          v-for="bomba in filteredBombas"
          :key="bomba.id"
          class="group hover:bg-primary/2 transition-colors"
        >
          <td class="px-8 py-5">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-2xl bg-brand/5 border border-brand/10 flex items-center justify-center text-brand">
                <Activity size="20" />
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-black uppercase tracking-tight text-primary">{{ bomba.nome }}</span>
                <span class="text-[9px] font-black text-secondary opacity-40 uppercase tracking-widest">ID #{{ String(bomba.id).padStart(3, '0') }}</span>
              </div>
            </div>
          </td>
          <td class="px-8 py-5">
            <span class="text-xs font-black uppercase tracking-tight text-secondary opacity-60">
              {{ bomba.tipo }}
            </span>
          </td>
          <td class="px-8 py-5">
            <span class="text-xs font-black text-secondary opacity-60 tabular-nums">
              {{ bomba.placa || '---' }}
            </span>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center gap-2">
              <div :class="['w-2 h-2 rounded-full shadow-[0_0_10px]', bomba.ativo ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50']" />
              <span
                class="text-[10px] font-black uppercase tracking-widest"
                :class="bomba.ativo ? 'text-emerald-500' : 'text-red-500'"
              >
                {{ bomba.ativo ? 'OPERACIONAL' : 'MANUTENÇÃO' }}
              </span>
            </div>
          </td>
          <td class="px-8 py-5 text-right">
            <div class="flex items-center justify-end gap-2">
              <BaseTooltip text="Editar">
                <button
                  class="p-2.5 rounded-xl bg-primary/3 text-secondary hover:text-brand hover:scale-110 active:scale-95 transition-all"
                  @click="openModal(bomba)"
                >
                  <Edit3 size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Excluir">
                <button
                  class="p-2.5 rounded-xl bg-primary/3 text-secondary hover:text-red-500 hover:scale-110 active:scale-95 transition-all"
                  @click="deleteBomba(bomba.id)"
                >
                  <Trash2 size="16" />
                </button>
              </BaseTooltip>
            </div>
          </td>
        </tr>
      </BaseTable>

      <div
        v-if="!filteredBombas.length && !pending"
        class="p-20 text-center"
      >
        <Activity
          size="40"
          class="text-secondary opacity-10 mx-auto mb-4"
        />
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-40">
          Nenhuma bomba cadastrada
        </p>
      </div>
    </div>

    <!-- Modal Form -->
    <BombaFormModal
      v-if="showModal"
      :bomba="selectedBomba"
      @close="showModal = false"
      @saved="refresh"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Search, Activity, Edit3, Trash2 } from 'lucide-vue-next'

const search = ref('')
const showModal = ref(false)
const selectedBomba = ref(null)

const { data: bombas, pending, refresh } = useFetch('/api/bombas')

const filteredBombas = computed(() => {
  if (!bombas.value) return []
  return bombas.value.filter(b =>
    b.nome.toLowerCase().includes(search.value.toLowerCase())
    || (b.placa && b.placa.toLowerCase().includes(search.value.toLowerCase())),
  )
})

const openModal = (bomba = null) => {
  selectedBomba.value = bomba
  showModal.value = true
}

const deleteBomba = async (id) => {
  if (!confirm('Deseja excluir esta bomba?')) return
  try {
    await $fetch(`/api/bombas/${id}`, { method: 'DELETE' })
    refresh()
  }
  catch (e) {
    alert('Erro ao excluir: ' + (e.data?.message || e.message))
  }
}
</script>
