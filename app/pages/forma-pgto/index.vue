<template>
    <div class="flex flex-col gap-6 animate-enter">
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 class="text-3xl font-bold text-primary tracking-tight">Formas de Pagamento</h2>
                <p class="text-secondary text-sm font-medium mt-1 opacity-70">
                    Configuração de prazos e condições financeiras
                </p>
            </div>

            <div class="flex items-center gap-3 w-full md:w-auto">
                <div class="relative flex-1 md:flex-none">
                    <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" size="18" />
                    <input v-model="searchTerm" placeholder="Buscar condição..."
                        class="pl-12 pr-4 py-3 bg-primary/2 border border-border rounded-2xl text-sm font-semibold text-primary placeholder:text-secondary/30 w-full md:w-64 focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all outline-none" />
                </div>
                <button @click="openAddModal"
                    class="bg-brand text-white px-6 py-3.5 rounded-2xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-brand/20">
                    <Plus size="18" />
                    Nova Condição
                </button>
            </div>
        </div>

        <!-- Table Container -->
        <div class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
            <BaseTable :headers="['Descrição', 'Prazo Médio', 'Integração Asaas', '']">
                <tr v-for="forma in filteredFormas" :key="forma.id" class="group hover:bg-primary/2 transition-colors">
                    <td class="px-8 py-5">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-10 h-10 rounded-xl bg-primary/2 flex items-center justify-center text-secondary border border-border group-hover:border-brand/30 group-hover:text-brand transition-colors">
                                <CreditCard size="18" />
                            </div>
                            <span class="text-sm font-bold text-primary tracking-tight">{{ forma.formaPagamento
                                }}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-secondary">
                        <div class="flex items-center gap-2">
                            <Clock size="14" class="opacity-40" />
                            <span class="text-xs font-bold text-primary">{{ forma.dias }} dias</span>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <span v-if="forma.tipoAsaas && forma.tipoAsaas !== 'UNDEFINED'" 
                            class="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {{ forma.tipoAsaas }}
                        </span>
                        <span v-else class="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-gray-100 text-gray-400 border border-gray-200">
                            MANUAL
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center justify-end gap-2">
                            <BaseTooltip content="Editar">
                                <button @click="openEditModal(forma)"
                                    class="p-2.5 rounded-xl border border-gray-100 dark:border-white/10 text-secondary hover:text-brand hover:bg-white dark:hover:bg-white/5 transition-all">
                                    <Edit3 size="16" />
                                </button>
                            </BaseTooltip>
                            <BaseTooltip content="Excluir">
                                <button @click="confirmDelete(forma)"
                                    class="p-2.5 rounded-xl border border-gray-100 dark:border-white/10 text-secondary hover:text-rose-500 hover:bg-white dark:hover:bg-white/5 transition-all">
                                    <Trash2 size="16" />
                                </button>
                            </BaseTooltip>
                        </div>
                    </td>
                </tr>
            </BaseTable>

            <!-- Empty State -->
            <div v-if="!filteredFormas.length" class="p-20 text-center">
                <div
                    class="w-16 h-16 bg-primary/2 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border">
                    <CreditCard size="32" class="text-secondary/20" />
                </div>
                <h3 class="text-lg font-bold text-primary tracking-tight">Nenhuma condição encontrada</h3>
                <p class="text-secondary text-sm mt-1 font-medium">Experimente mudar o termo da busca ou adicionar uma
                    nova condição.</p>
            </div>
        </div>

        <!-- Add/Edit Modal -->
        <BaseModal v-model="showModal" :title="isEditing ? 'Editar Condição' : 'Nova Condição'"
            :subtitle="isEditing ? 'Atualize as regras desta forma de pagamento' : 'Configure os prazos para novos orçamentos'"
            size="md">
            <form @submit.prevent="saveForma" class="space-y-6">
                <div class="space-y-2">
                    <label class="text-xs font-bold text-secondary ml-1">Descrição da Condição</label>
                    <BaseInput v-model="form.formaPagamento" placeholder="Ex: Boleto 30 Dias" :icon="CreditCard"
                        required />
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-bold text-secondary ml-1">Prazo para Vencimento (Dias)</label>
                    <BaseInput v-model="form.dias" placeholder="Ex: 30 ou 30, 60, 90" :icon="Clock" required />
                    <p class="text-[10px] text-secondary/60 ml-1 italic font-medium">Use vírgulas para múltiplas parcelas (ex: 30, 60, 90).</p>
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-bold text-secondary ml-1">Vincular ao Asaas</label>
                    <BaseSelect v-model="form.tipoAsaas" :options="[
                        { label: 'Não vincular (Manual)', value: 'UNDEFINED' },
                        { label: 'Gerar Boleto', value: 'BOLETO' },
                        { label: 'Gerar Pix', value: 'PIX' },
                        { label: 'Gerar Cartão de Crédito', value: 'CREDIT_CARD' }
                    ]" placeholder="Selecione o tipo" :icon="Zap" />
                    <p class="text-[10px] text-secondary/60 ml-1 italic font-medium">Ao vincular, o sistema gerará a cobrança automaticamente no Asaas ao aprovar o orçamento.</p>
                </div>

                <div v-if="error"
                    class="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-500/20">
                    <p class="text-rose-600 dark:text-rose-400 text-xs font-bold text-center uppercase tracking-wider">
                        {{ error }}</p>
                </div>

                <div class="flex gap-4 pt-4">
                    <button type="button" @click="showModal = false"
                        class="flex-1 py-4 text-sm font-bold text-secondary hover:bg-primary/3 rounded-2xl transition-all">
                        Cancelar
                    </button>
                    <button type="submit" :disabled="loading"
                        class="flex-1 py-4 bg-brand text-white rounded-2xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand/20 disabled:opacity-50">
                        {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
                    </button>
                </div>
            </form>
        </BaseModal>

        <!-- Delete Confirmation Dialog -->
        <BaseDialog v-model="showDeleteDialog" title="Excluir Condição"
            :message="`Tem certeza que deseja excluir a forma de pagamento ${formaToDelete?.formaPagamento}? Esta ação pode afetar futuros orçamentos.`"
            type="danger" @confirm="handleDelete" />
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { CreditCard, Plus, Edit3, Trash2, Clock, Search, Zap } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'
import { useLogger } from '~/composables/useLogger'

definePageMeta({ layout: 'default' })

const { add: addToast } = useToast()
const { info, error: logError } = useLogger()
const { data: formas, refresh } = await useFetch('/api/forma-pgto')

const searchTerm = ref('')
const loading = ref(false)
const error = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const showDeleteDialog = ref(false)
const formaToDelete = ref(null)

const form = reactive({ id: null, formaPagamento: '', dias: 0, tipoAsaas: 'UNDEFINED' })

const filteredFormas = computed(() => {
    if (!formas.value) return []
    const term = searchTerm.value.toLowerCase()
    return formas.value.filter(f =>
        f.formaPagamento.toLowerCase().includes(term)
    )
})

const openAddModal = () => {
    isEditing.value = false
    Object.assign(form, { id: null, formaPagamento: '', dias: 0, tipoAsaas: 'UNDEFINED' })
    showModal.value = true
    error.value = ''
}

const openEditModal = (f) => {
    isEditing.value = true
    Object.assign(form, f)
    if (!form.tipoAsaas) form.tipoAsaas = 'UNDEFINED'
    showModal.value = true
    error.value = ''
}

const saveForma = async () => {
    loading.value = true
    error.value = ''

    try {
        const url = isEditing.value ? `/api/forma-pgto/${form.id}` : '/api/forma-pgto'
        const method = isEditing.value ? 'PUT' : 'POST'

        await $fetch(url, {
            method,
            body: form
        })

        addToast(isEditing.value ? 'Condição atualizada!' : 'Condição cadastrada!')
        info('FORMA_PGTO', `${isEditing.value ? 'Edição' : 'Cadastro'} de forma de pagamento: ${form.formaPagamento}`, { forma: form })
        showModal.value = false
        refresh()
    } catch (err) {
        error.value = err.message
        logError('FORMA_PGTO', `Erro ao ${isEditing.value ? 'editar' : 'cadastrar'} forma de pagamento`, { error: err.message, form })
    } finally {
        loading.value = false
    }
}

const confirmDelete = (f) => {
    formaToDelete.value = f
    showDeleteDialog.value = true
}

const handleDelete = async () => {
    try {
        await $fetch(`/api/forma-pgto/${formaToDelete.value.id}`, {
            method: 'DELETE'
        })

        addToast('Condição excluída!', 'success')
        info('FORMA_PGTO', `Forma de pagamento excluída: ${formaToDelete.value.formaPagamento}`, { id: formaToDelete.value.id })
        showDeleteDialog.value = false
        refresh()
    } catch (err) {
        addToast(err.message, 'error')
        logError('FORMA_PGTO', `Erro ao excluir forma de pagamento: ${formaToDelete.value?.formaPagamento}`, { error: err.message, id: formaToDelete.value?.id })
    }
}
</script>
