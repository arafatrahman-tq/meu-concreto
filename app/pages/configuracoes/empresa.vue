<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">Dados da Empresa</h2>
        <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">
          Configurações gerais e informações fiscais da sua organização
        </p>
      </div>

      <div v-if="isAdmin" class="flex items-center gap-3">
        <button 
          @click="saveChanges" 
          :disabled="loading || !hasChanges"
          class="bg-brand text-background px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-brand/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
          <Save size="20" v-if="!loading" />
          <RefreshCw size="20" v-else class="animate-spin" />
          {{ loading ? 'Processando' : 'Salvar Alterações' }}
        </button>
      </div>
    </div>

    <!-- Permission Warning -->
    <div v-if="!isAdmin" class="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4">
      <div class="p-2 bg-amber-500/20 text-amber-500 rounded-xl">
        <ShieldAlert size="20" />
      </div>
      <div>
        <h4 class="text-xs font-black uppercase tracking-widest text-amber-500">Acesso Restrito</h4>
        <p class="text-[10px] font-bold text-amber-500/60 uppercase mt-0.5">Somente administradores podem editar os dados da empresa.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <!-- Main Content (8 cols) -->
      <div class="xl:col-span-8 space-y-8">
        <!-- Identificação -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-4 bg-brand rounded-full"></div>
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Identificação e Documentação</h3>
          </div>
          
          <div class="bg-surface p-8 rounded-[2rem] border border-border shadow-sm space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2">Razão Social / Nome Fantasia</label>
                <BaseInput v-model="form.empresa" :disabled="!isAdmin" :icon="Building2" placeholder="Nome da Empresa" />
              </div>
              <div class="space-y-2">
                <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2">CNPJ</label>
                <BaseInput v-model="form.cnpj" :disabled="!isAdmin" mask="cnpj" :icon="FileText" placeholder="00.000.000/0000-00" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2">Inscrição Estadual</label>
                <BaseInput v-model="form.ie" :disabled="!isAdmin" :icon="ClipboardList" placeholder="IE da Empresa" />
              </div>
              <div class="space-y-2">
                <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2">Filial / Unidade</label>
                <BaseInput v-model="form.filial" :disabled="!isAdmin" :icon="MapPin" placeholder="Ex: Matriz" />
              </div>
            </div>
          </div>
        </div>

        <!-- Contato e Localização -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-4 bg-primary rounded-full"></div>
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Contato e Localização</h3>
          </div>

          <div class="bg-surface p-8 rounded-[2rem] border border-border shadow-sm space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2">E-mail Corporativo</label>
                <BaseInput v-model="form.email" :disabled="!isAdmin" :icon="Mail" type="email" placeholder="empresa@email.com" />
              </div>
              <div class="space-y-2">
                <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2">Telefone</label>
                <BaseInput v-model="form.telefone" :disabled="!isAdmin" mask="phone" :icon="Phone" placeholder="(00) 0000-0000" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div class="md:col-span-8 space-y-2">
                <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2">Endereço Completo</label>
                <BaseInput v-model="form.endereco" :disabled="!isAdmin" :icon="MapPin" placeholder="Rua, Número, Complemento" />
              </div>
              <div class="md:col-span-4 space-y-2">
                <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2">Bairro</label>
                <BaseInput v-model="form.bairro" :disabled="!isAdmin" placeholder="Bairro" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Helper / Info Sidebar (4 cols) -->
      <div class="xl:col-span-4 space-y-6">
        <!-- Logo Upload Section -->
        <div class="bg-surface p-8 rounded-[2rem] border border-border shadow-sm space-y-6">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-4 bg-brand rounded-full"></div>
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Logotipo da Empresa</h3>
          </div>

          <div class="flex flex-col items-center gap-6">
            <div 
              class="w-40 h-40 rounded-3xl border-2 border-dashed border-border flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-brand/40 transition-colors"
              @click="!isAdmin ? null : $refs.logoInput.click()"
            >
              <img v-if="form.logo" :src="form.logo" class="w-full h-full object-contain p-4" />
              <div v-else class="flex flex-col items-center gap-2 opacity-20">
                <ImageIcon size="40" />
                <span class="text-[8px] font-black uppercase tracking-widest">Sem Logo</span>
              </div>

              <!-- Overlay -->
              <div v-if="isAdmin" class="absolute inset-0 bg-brand/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                <Upload size="24" />
                <span class="text-[10px] font-black uppercase tracking-widest">Alterar Logo</span>
              </div>
              
              <input 
                ref="logoInput"
                type="file" 
                class="hidden" 
                accept="image/*"
                @change="handleLogoUpload"
              />
            </div>

            <div v-if="form.logo && isAdmin" class="flex gap-2">
              <button 
                @click="form.logo = ''"
                class="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 flex items-center gap-2"
              >
                <X size="14" /> Remover Logo
              </button>
            </div>

            <p class="text-center text-[9px] font-bold text-secondary opacity-40 uppercase tracking-widest leading-relaxed">
              Use uma imagem quadrada (PNG/JPG)<br>fundo transparente recomendado.
            </p>
          </div>
        </div>

        <div class="bg-primary p-8 rounded-[2rem] text-background space-y-6 shadow-2xl shadow-primary/20 relative overflow-hidden group">
          <div class="absolute -right-10 -top-10 text-background/10 group-hover:scale-110 transition-transform duration-700">
            <Building2 size="250" />
          </div>
          
          <div class="relative z-10 space-y-6">
            <div class="p-4 bg-background/10 rounded-2xl w-fit">
              <Info size="24" />
            </div>
            
            <div class="space-y-2">
              <h4 class="text-xl font-black uppercase tracking-tighter leading-none">Dados Fiscais</h4>
              <p class="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-relaxed">
                As informações nesta página são utilizadas em documentos oficiais, como Orçamentos em PDF e Pedidos de Venda.
              </p>
            </div>

            <div class="pt-6 border-t border-background/10 space-y-4 text-[10px] font-black uppercase tracking-widest">
              <div class="flex items-center gap-3">
                <CheckCircle2 size="16" class="text-background/40" />
                <span>Exibição em Cabeçalhos</span>
              </div>
              <div class="flex items-center gap-3">
                <CheckCircle2 size="16" class="text-background/40" />
                <span>Validação de Contratos</span>
              </div>
              <div class="flex items-center gap-3">
                <CheckCircle2 size="16" class="text-background/40" />
                <span>Identificação de Filiais</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Audit Info -->
        <div class="bg-surface p-6 rounded-3xl border border-border space-y-4">
          <div class="flex items-center gap-2 opacity-40">
            <History size="14" />
            <span class="text-[9px] font-black uppercase tracking-widest">Última Atualização</span>
          </div>
          <div v-if="user?.empresa" class="space-y-1">
             <p class="text-xs font-black text-primary uppercase">{{ formatDate(user.empresa.updatedAt) }}</p>
             <p class="text-[9px] font-bold text-secondary uppercase opacity-50">Sincronizado com a base central</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { 
  Building2, Save, FileText, ClipboardList, 
  MapPin, Mail, Phone, Info, CheckCircle2,
  ShieldAlert, History, Upload, X, Image as ImageIcon,
  RefreshCw
} from 'lucide-vue-next'
import { useAuth, useToast } from '#imports'

definePageMeta({ 
    layout: 'default',
    middleware: ['admin']
})

const { user, fetchUser } = useAuth()
const { add: addToast } = useToast()

const loading = ref(false)
const originalData = ref({})
const form = ref({
  empresa: '',
  cnpj: '',
  ie: '',
  logo: '',
  endereco: '',
  bairro: '',
  telefone: '',
  email: '',
  filial: ''
})

const isAdmin = computed(() => user.value?.admin === 1)

const initializeForm = () => {
  if (user.value?.empresa) {
    const data = {
      empresa: user.value.empresa.empresa || '',
      cnpj: user.value.empresa.cnpj || '',
      ie: user.value.empresa.ie || '',
      logo: user.value.empresa.logo || '',
      endereco: user.value.empresa.endereco || '',
      bairro: user.value.empresa.bairro || '',
      telefone: user.value.empresa.telefone || '',
      email: user.value.empresa.email || '',
      filial: user.value.empresa.filial || ''
    }
    form.value = { ...data }
    originalData.value = { ...data }
  }
}

const handleLogoUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Limite de 1MB para armazenamento em base64 no SQLite
  if (file.size > 1024 * 1024) {
    addToast({
      title: "Arquivo muito grande",
      description: "O logotipo deve ter no máximo 1MB.",
      type: "warn"
    })
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.logo = e.target.result
  }
  reader.readAsDataURL(file)
}

onMounted(() => {
  if (user.value) {
    initializeForm()
  } else {
    fetchUser().then(initializeForm)
  }
})

const hasChanges = computed(() => {
  return JSON.stringify(form.value) !== JSON.stringify(originalData.value)
})

const saveChanges = async () => {
  if (!isAdmin.value || loading.value) return
  
  loading.value = true
  try {
    const idEmpresa = user.value.idEmpresa
    await $fetch(`/api/empresas/${idEmpresa}`, {
      method: 'PUT',
      body: form.value
    })

    addToast({
      title: "Configurações Salvas",
      description: "Os dados da empresa foram atualizados com sucesso.",
      type: "success"
    })
    
    // Refresh user data to get updated company info
    await fetchUser()
    initializeForm()
  } catch (error) {
    addToast({
      title: "Erro ao Salvar",
      description: error.data?.statusMessage || "Não foi possível atualizar os dados.",
      type: "error"
    })
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return '---'
  return new Date(date).toLocaleString('pt-BR')
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
