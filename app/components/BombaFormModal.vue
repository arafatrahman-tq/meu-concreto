<template>
  <BaseModal v-model="isOpen" :title="bomba ? 'Editar Bomba' : 'Nova Bomba'" subtitle="Gestão de recursos de bombeamento" size="md">
    <form @submit.prevent="handleSubmit" class="space-y-6 py-2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div class="col-span-1 md:col-span-2">
          <label class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 block">Identificação / Nome</label>
          <BaseInput v-model="form.nome" placeholder="EX: BOMBA 01, LANÇA 32M..." :icon="Activity" required />
        </div>
        
        <div>
          <label class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 block">Tipo de Bomba</label>
          <BaseSelect v-model="form.tipo" :options="tipos" placeholder="SELECIONE..." required />
        </div>

        <div>
          <label class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 block">Placa (se houver)</label>
          <BaseInput v-model="form.placa" placeholder="ABC-1234" :icon="Truck" />
        </div>

        <div class="col-span-1 md:col-span-2">
          <label class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 block">Descrição / Detalhes</label>
          <BaseInput v-model="form.descricao" placeholder="ALCANCE, CAPACIDADE..." :icon="FileText" />
        </div>

        <div class="flex items-center gap-3 p-4 bg-primary/2 rounded-2xl border border-border mt-2">
          <BaseCheckbox v-model="form.ativo" label="EQUIPAMENTO DISPONÍVEL" />
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-6 border-t border-border">
        <button type="button" @click="isOpen = false"
          class="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-primary/3 transition-all">
          Cancelar
        </button>
        <button type="submit" :disabled="loading"
          class="bg-brand text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
          {{ loading ? 'Salvando...' : (bomba ? 'Atualizar Bomba' : 'Cadastrar Bomba') }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Activity, Truck, FileText } from 'lucide-vue-next'

const props = defineProps({
  bomba: Object
})

const emit = defineEmits(['close', 'saved'])

const isOpen = ref(true)
const loading = ref(false)

const tipos = [
  { label: 'LANÇA (AUTOPROPULSADA)', value: 'LANCA' },
  { label: 'ESTACIONÁRIA (REBOQUE)', value: 'ESTACIONARIA' },
  { label: 'REBOQUE MISTURADOR (PUMBETON)', value: 'REBOQUE' },
]

const form = reactive({
  nome: '',
  tipo: 'LANCA',
  placa: '',
  descricao: '',
  ativo: true
})

watch(() => props.bomba, (val) => {
  if (val) {
    Object.assign(form, {
      ...val,
      ativo: val.ativo === 1 || val.ativo === true
    })
  } else {
    Object.assign(form, {
      nome: '',
      tipo: 'LANCA',
      placa: '',
      descricao: '',
      ativo: true
    })
  }
}, { immediate: true })

watch(isOpen, (val) => {
  if (!val) emit('close')
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const method = props.bomba ? 'PUT' : 'POST'
    const url = props.bomba ? `/api/bombas/${props.bomba.id}` : '/api/bombas'
    
    await $fetch(url, {
      method,
      body: {
        ...form,
        ativo: form.ativo ? 1 : 0
      }
    })
    
    emit('saved')
    isOpen.value = false
  } catch (e) {
    alert('Erro ao salvar: ' + (e.data?.message || e.message))
  } finally {
    loading.value = false
  }
}
</script>
