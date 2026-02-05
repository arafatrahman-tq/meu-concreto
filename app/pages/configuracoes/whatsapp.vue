<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">Integração WhatsApp</h2>
        <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">
          Configurações globais da API Evolution para envio de mensagens
        </p>
      </div>

      <div class="flex items-center gap-4">
        <!-- Status da Integração (Igual ao Asaas/Bling) -->
        <div class="hidden md:flex items-center gap-2 bg-surface px-4 py-2 border border-border rounded-xl">
          <div :class="[
            'w-2 h-2 rounded-full animate-pulse',
            form.ativo ? 'bg-emerald-500' : 'bg-slate-300'
          ]"></div>
          <span class="text-[8px] font-black uppercase tracking-widest text-secondary opacity-60">
            {{ form.ativo ? 'Integração Ativa' : 'Aguardando Configuração' }}
          </span>
        </div>

        <div v-if="isAdmin" class="flex items-center gap-3">
          <button 
            @click="saveChanges" 
            :disabled="loading || !hasChanges"
            class="bg-[#25D366] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-[#25D366]/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
            <Save size="20" v-if="!loading" />
            <RefreshCw v-else size="20" class="animate-spin" />
            {{ loading ? 'Processando' : 'Salvar Alterações' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Permission Warning -->
    <div v-if="!isAdmin" class="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4">
      <div class="p-2 bg-amber-500/20 text-amber-500 rounded-xl">
        <ShieldAlert size="20" />
      </div>
      <div>
        <h4 class="text-xs font-black uppercase tracking-widest text-amber-500">Acesso Restrito</h4>
        <p class="text-[10px] font-bold text-amber-500/60 uppercase mt-0.5">Somente administradores mestres podem gerenciar a API global de WhatsApp.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <!-- Main Content (8 cols) -->
      <div class="xl:col-span-8 space-y-8">
        <!-- API Connection -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-1 h-4 bg-[#25D366] rounded-full"></div>
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Conexão com a Instância</h3>
          </div>
          
          <div class="bg-surface p-10 rounded-[2.5rem] border border-border shadow-sm space-y-8">
            <div class="space-y-3">
              <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2">URL da Instância (Endpoint de Envio)</label>
              <BaseInput v-model="form.instanceUrl" :disabled="!isAdmin" :icon="Globe" placeholder="https://api.evolution.com/connections/whatsapp-principal" />
            </div>

            <div class="space-y-3">
              <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2">API Key / Secret Token</label>
              <BaseInput v-model="form.apiKey" :disabled="!isAdmin" type="password" :icon="Key" placeholder="Sua Chave Secreta" />
            </div>

            <div class="pt-8 border-t border-border flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="p-3 bg-primary/2 rounded-xl text-[#25D366]">
                  <Activity size="20" />
                </div>
                <div>
                  <h4 class="text-xs font-black uppercase tracking-tight text-primary">Status da Integração</h4>
                  <p class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40">Ativar ou desativar todos os envios de WhatsApp</p>
                </div>
              </div>
              <BaseToggle v-model="form.ativo" :disabled="!isAdmin" color-class="bg-[#25D366]" />
            </div>
          </div>
        </div>

        <!-- Notificações Automáticas -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-1 h-4 bg-brand rounded-full"></div>
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Automações e Avisos</h3>
          </div>
          
          <div class="bg-surface p-10 rounded-[2.5rem] border border-border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Contas a Pagar -->
            <div class="flex items-center justify-between p-5 bg-primary/2 rounded-[1.5rem] border border-border/50 group hover:border-brand/30 transition-all">
              <div class="flex items-center gap-4">
                <div class="p-3 bg-white rounded-xl shadow-sm text-brand group-hover:scale-110 transition-transform">
                  <BellRing size="18" />
                </div>
                <div>
                  <h4 class="text-xs font-black uppercase tracking-tight text-primary">Contas a Pagar</h4>
                  <p class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40">Vencimentos do dia</p>
                </div>
              </div>
              <BaseToggle v-model="form.notificaContasPagar" :disabled="!isAdmin" color-class="bg-[#25D366]" />
            </div>

            <!-- Cobranças -->
            <div class="flex items-center justify-between p-5 bg-primary/2 rounded-[1.5rem] border border-border/50 group hover:border-brand/30 transition-all">
              <div class="flex items-center gap-4">
                <div class="p-3 bg-white rounded-xl shadow-sm text-brand group-hover:scale-110 transition-transform">
                  <AlertCircle size="18" />
                </div>
                <div>
                  <h4 class="text-xs font-black uppercase tracking-tight text-primary">Cobranças Ativas</h4>
                  <p class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40">Faturas atrasadas</p>
                </div>
              </div>
              <BaseToggle v-model="form.notificaCobrancas" :disabled="!isAdmin" color-class="bg-[#25D366]" />
            </div>

            <!-- Novos Orçamentos -->
            <div class="flex items-center justify-between p-5 bg-primary/2 rounded-[1.5rem] border border-border/50 group hover:border-brand/30 transition-all md:col-span-2">
              <div class="flex items-center gap-4">
                <div class="p-3 bg-white rounded-xl shadow-sm text-brand group-hover:scale-110 transition-transform">
                  <CheckCircle2 size="18" />
                </div>
                <div>
                  <h4 class="text-xs font-black uppercase tracking-tight text-primary">Avisos de Orçamentos</h4>
                  <p class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40">Notificar vendedores sobre novas propostas criadas</p>
                </div>
              </div>
              <BaseToggle v-model="form.notificaNovosOrcamentos" :disabled="!isAdmin" color-class="bg-[#25D366]" />
            </div>
          </div>
        </div>
      </div>

      <!-- Helper / Status Sidebar (4 cols) -->
      <div class="xl:col-span-4 space-y-6">
        <div class="bg-[#25D366] p-8 rounded-[2rem] text-background space-y-6 shadow-2xl shadow-[#25D366]/20 relative overflow-hidden group">
          <div class="absolute -right-10 -bottom-10 text-background/10 group-hover:scale-110 transition-transform duration-700">
            <MessageSquare size="250" />
          </div>
          
          <div class="relative z-10 space-y-6">
            <div class="p-4 bg-background/10 rounded-2xl w-fit">
              <Share2 size="24" />
            </div>
            
            <div class="space-y-2">
              <h4 class="text-xl font-black uppercase tracking-tighter leading-none">Instância Global</h4>
              <p class="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-relaxed">
                Esta instância é utilizada para todos os disparos automáticos do sistema (Orçamentos, Vendas e Avisos).
              </p>
            </div>

            <div class="pt-6 border-t border-background/10 space-y-4">
               <div class="flex items-center justify-between">
                  <span class="text-[9px] font-black uppercase tracking-widest opacity-60">Status</span>
                  <span class="text-[10px] font-black uppercase">Configurado</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  MessageSquare, Save, Globe, Key, 
  Share2, ShieldAlert, BellRing,
  CheckCircle2, AlertCircle, Activity,
  RefreshCw
} from 'lucide-vue-next'
import { useAuth, useToast } from '#imports'

definePageMeta({ 
    layout: 'default',
    middleware: ['admin']
})

const { user } = useAuth()
const { add: addToast } = useToast()

const loading = ref(false)
const originalData = ref({})
const form = ref({
  instanceUrl: '',
  apiKey: '',
  notificaContasPagar: false,
  notificaCobrancas: false,
  notificaNovosOrcamentos: false,
  ativo: false
})

const isAdmin = computed(() => user.value?.admin === 1)

const loadConfig = async () => {
    try {
        const data = await $fetch('/api/configuracoes/whatsapp')
        form.value = {
            instanceUrl: data.instanceUrl || '',
            apiKey: data.apiKey || '',
            notificaContasPagar: !!data.notificaContasPagar,
            notificaCobrancas: !!data.notificaCobrancas,
            notificaNovosOrcamentos: !!data.notificaNovosOrcamentos,
            ativo: !!data.ativo
        }
        originalData.value = JSON.parse(JSON.stringify(form.value))
    } catch (error) {
        console.error('Erro ao carregar configurações:', error)
    }
}

onMounted(() => {
    loadConfig()
})

const hasChanges = computed(() => {
  return JSON.stringify(form.value) !== JSON.stringify(originalData.value)
})

const saveChanges = async () => {
  if (!isAdmin.value || loading.value) return
  
  loading.value = true
  try {
    await $fetch('/api/configuracoes/whatsapp', {
      method: 'PUT',
      body: form.value
    })

    addToast({
      title: "WhatsApp Atualizado",
      description: "As configurações globais da API foram salvas.",
      type: "success"
    })
    
    await loadConfig()
  } catch (error) {
    addToast({
      title: "Falha na Configuração",
      description: error.data?.statusMessage || "Erro ao comunicar com a base de dados.",
      type: "error"
    })
  } finally {
    loading.value = false
  }
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
