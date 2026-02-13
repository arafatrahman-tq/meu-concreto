<template>
  <BaseModal
    v-model="isOpen"
    :title="traco ? 'Editar Traço' : 'Novo Traço'"
    subtitle="Configuração de dosagem para produção"
    size="lg"
  >
    <form
      class="space-y-8 py-2"
      @submit.prevent="handleSubmit"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div class="space-y-6">
          <h4
            class="text-[11px] font-black uppercase tracking-[0.2em] text-brand"
          >
            Informações Básicas
          </h4>

          <div>
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 block"
            >Nome do Traço <span class="text-brand">*</span></label>
            <BaseInput
              v-model="form.nome"
              placeholder="EX: FCK 25 SLUMP 12..."
              required
            />
          </div>

          <div>
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 block"
            >Produto Vinculado <span class="text-brand">*</span></label>
            <BaseSelect
              v-model="form.idProduto"
              :options="produtosOptions"
              placeholder="VINCULAR A UM PRODUTO..."
              required
            />
          </div>

          <div>
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 block"
            >Descrição Técnica</label>
            <BaseInput
              v-model="form.descricao"
              placeholder="DETALHES DA APLICAÇÃO OU COMPOSIÇÃO..."
              :icon="FileText"
            />
          </div>

          <div
            class="flex items-center gap-3 p-4 bg-primary/2 rounded-2xl border border-border"
          >
            <BaseToggle v-model="form.ativo" />
            <span
              class="text-xs font-black uppercase tracking-widest text-primary"
            >Traço Ativo</span>
          </div>
        </div>

        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h4
              class="text-[11px] font-black uppercase tracking-[0.2em] text-brand"
            >
              Composição (por m³)
            </h4>
            <button
              type="button"
              class="p-2 bg-brand/10 text-brand rounded-xl hover:bg-brand/20 transition-all"
              @click="addItem"
            >
              <Plus size="18" />
            </button>
          </div>

          <div
            class="space-y-3 max-h-100 overflow-y-auto pr-2 custom-scrollbar"
          >
            <div
              v-for="(item, index) in form.itens"
              :key="index"
              class="flex items-center gap-3 p-4 bg-primary/2 rounded-2xl border border-border group"
            >
              <div class="flex-1">
                <BaseSelect
                  v-model="item.idInsumo"
                  :options="insumosOptions"
                  placeholder="MATERIAL..."
                />
              </div>
              <div class="w-24">
                <BaseInput
                  v-model.number="item.quantidade"
                  type="number"
                  step="0.001"
                  placeholder="QTD"
                />
              </div>
              <button
                type="button"
                class="p-2 text-secondary opacity-20 group-hover:opacity-100 hover:text-red-500 transition-all"
                @click="removeItem(index)"
              >
                <X size="20" />
              </button>
            </div>

            <div
              v-if="form.itens.length === 0"
              class="py-12 text-center border-2 border-dashed border-border rounded-[2rem]"
            >
              <FlaskConical
                size="32"
                class="text-secondary opacity-10 mx-auto mb-3"
              />
              <p
                class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40"
              >
                Nenhum insumo adicionado
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-6 border-t border-border">
        <button
          type="button"
          class="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-primary/3 border border-border transition-all outline-none"
          @click="isOpen = false"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="bg-brand text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 outline-none"
        >
          {{
            loading ? "Salvando..." : traco ? "Atualizar Traço" : "Criar Traço"
          }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { Plus, X, FileText, FlaskConical } from 'lucide-vue-next'

const props = defineProps({
  traco: Object,
})

const emit = defineEmits(['close', 'saved'])

const isOpen = ref(true)
const loading = ref(false)

const { data: produtos } = useFetch('/api/produtos')
const { data: insumos } = useFetch('/api/insumos')

const produtosOptions = computed(() => {
  if (!produtos.value) return []
  return produtos.value.map(p => ({ label: p.produto, value: p.id }))
})

const insumosOptions = computed(() => {
  if (!insumos.value) return []
  return insumos.value.map(i => ({ label: i.nome, value: i.id }))
})

const form = reactive({
  nome: '',
  idProduto: null,
  descricao: '',
  ativo: true,
  itens: [],
})

watch(
  () => props.traco,
  (val) => {
    if (val) {
      Object.assign(form, {
        ...val,
        itens:
          val.itens?.map(i => ({
            idInsumo: i.idInsumo,
            quantidade: i.quantidade,
          })) || [],
      })
    }
    else {
      Object.assign(form, {
        nome: '',
        idProduto: null,
        descricao: '',
        ativo: true,
        itens: [],
      })
    }
  },
  { immediate: true },
)

watch(isOpen, (val) => {
  if (!val) emit('close')
})

const addItem = () => {
  form.itens.push({ idInsumo: null, quantidade: 0 })
}

const removeItem = (index) => {
  form.itens.splice(index, 1)
}

const handleSubmit = async () => {
  if (form.itens.length === 0)
    return alert('Adicione pelo menos um insumo ao traço')
  if (!form.idProduto) return alert('Selecione um produto')

  loading.value = true
  try {
    if (props.traco) {
      await $fetch(`/api/tracos/${props.traco.id}`, {
        method: 'PUT',
        body: form,
      })
    }
    else {
      await $fetch('/api/tracos', { method: 'POST', body: form })
    }
    emit('saved')
    isOpen.value = false
  }
  catch (e) {
    alert('Erro ao salvar traço: ' + (e.data?.message || e.message))
  }
  finally {
    loading.value = false
  }
}
</script>
