<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">Integração Asaas</h2>
        <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">
          Configuração do gateway de pagamentos para automação de cobranças
        </p>
      </div>

      <div v-if="user?.admin === 1" class="flex items-center gap-3">
        <button 
          @click="saveConfig" 
          :disabled="saving"
          class="bg-brand text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-brand/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
          <Save size="20" v-if="!saving" />
          <RefreshCw v-else size="20" class="animate-spin" />
          {{ saving ? 'Processando' : 'Salvar Alterações' }}
        </button>
      </div>
    </div>

    <!-- Permission Warning -->
    <div v-if="user?.admin !== 1" class="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4">
      <div class="p-2 bg-amber-500/20 text-amber-500 rounded-xl">
        <ShieldAlert size="20" />
      </div>
      <div>
        <h4 class="text-xs font-black uppercase tracking-widest text-amber-500">Acesso Restrito</h4>
        <p class="text-[10px] font-bold text-amber-500/60 uppercase mt-0.5">Somente administradores mestres podem gerenciar as integrações financeiras.</p>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <div class="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
    </div>

    <div v-else class="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <!-- Main Content (8 cols) -->
      <div class="xl:col-span-8 space-y-8">
        <!-- Credenciais -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-4 bg-brand rounded-full"></div>
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Credenciais da API</h3>
            </div>
            
            <div class="flex items-center gap-2 bg-surface px-4 py-2 border border-border rounded-xl">
              <div :class="[
                'w-2 h-2 rounded-full animate-pulse',
                config.ativo ? 'bg-emerald-500' : 'bg-slate-300'
              ]"></div>
              <span class="text-[8px] font-black uppercase tracking-widest text-secondary opacity-60">
                {{ config.ativo ? 'Sistema Conectado' : 'Aguardando Configuração' }}
              </span>
            </div>
          </div>
          
          <div class="bg-surface p-8 rounded-[2rem] border border-border shadow-sm space-y-6">
            <div class="space-y-2">
              <div class="flex items-center gap-2 ml-2">
                <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40">Chave de API (Secret Key)</label>
                <BaseTooltip text="Obtenha sua chave de API no painel do Asaas em Configurações > Integrações.">
                  <HelpCircle size="12" class="text-secondary opacity-40 cursor-help" />
                </BaseTooltip>
              </div>
              <BaseInput 
                v-model="config.apiKey" 
                :disabled="user?.admin !== 1"
                type="password" 
                placeholder="$asaas_..." 
                :icon="Key"
              />
              <p class="text-[8px] font-medium text-secondary opacity-40 ml-2 italic">A chave é armazenada de forma criptografada no servidor.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2">Ambiente</label>
                <BaseSelect 
                  v-model="config.environment" 
                  :disabled="user?.admin !== 1"
                  :options="[
                    { label: 'Sandbox (Testes)', value: 'sandbox' },
                    { label: 'Production (Real)', value: 'production' }
                  ]"
                  :icon="Settings"
                />
              </div>
              
              <div class="flex items-center justify-between p-4 bg-primary/2 rounded-2xl border border-border/50 group hover:border-brand/30 transition-all self-end">
                <div class="flex items-center gap-4">
                  <div class="p-3 bg-white rounded-xl shadow-sm text-brand group-hover:scale-110 transition-transform">
                    <Activity size="20" />
                  </div>
                  <div>
                    <h4 class="text-[11px] font-black uppercase tracking-tight text-primary">Status da Integração</h4>
                    <p class="text-[9px] font-bold text-secondary uppercase opacity-60">Ativar Gateway Asaas para pagamentos</p>
                  </div>
                </div>
                <BaseToggle v-model="config.ativo" :disabled="user?.admin !== 1" />
              </div>
            </div>
          </div>
        </div>

        <!-- Webhook -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-4 bg-primary rounded-full"></div>
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Segurança Webhook</h3>
          </div>

          <div class="bg-surface p-8 rounded-[2rem] border border-border shadow-sm space-y-6">
            <div class="space-y-2">
              <div class="flex items-center gap-2 ml-2">
                <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40">Webhook Token Key</label>
                <BaseTooltip text="O Token de Webhook é usado para validar se as notificações enviadas pelo Asaas são legítimas.">
                  <HelpCircle size="12" class="text-secondary opacity-40 cursor-help" />
                </BaseTooltip>
              </div>
              <BaseInput 
                v-model="config.webhookToken" 
                :disabled="user?.admin !== 1"
                placeholder="Token de segurança do Webhook" 
                :icon="ShieldCheck"
              />
            </div>
          </div>
        </div>

        <!-- Instruções -->
        <div class="bg-brand/5 rounded-[2rem] p-8 border border-brand/10 flex gap-6 items-start group hover:bg-brand/10 transition-colors">
          <div class="p-4 bg-brand/10 rounded-2xl text-brand group-hover:scale-110 transition-transform">
            <Info size="24" />
          </div>
          <div class="space-y-2">
            <h3 class="text-sm font-black text-primary uppercase tracking-widest">Configuração do Webhook</h3>
            <p class="text-[13px] text-secondary leading-relaxed font-medium">
              Para processamento de baixas automáticas, configure a URL abaixo no painel do Asaas:
            </p>
            <div class="flex items-center gap-2 mt-2">
              <code class="bg-surface px-4 py-2 rounded-xl font-mono text-xs text-brand border border-border shadow-sm select-all">
                https://app.meuconcreto.com.br/api/webhooks/asaas
              </code>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar (4 cols) -->
      <div class="xl:col-span-4 space-y-6">
        <BaseCard class="p-8 border border-border/50 shadow-sm rounded-[2rem]">
          <h3 class="text-[10px] font-black text-secondary uppercase tracking-[0.25em] mb-8 opacity-40 flex items-center gap-2">
            <Zap size="14" class="text-brand" />
            Recursos Ativos
          </h3>
          <ul class="space-y-6">
            <li v-for="feature in features" :key="feature.name" class="flex items-center gap-4 group cursor-default">
              <div class="w-10 h-10 rounded-xl bg-primary/2 flex items-center justify-center text-secondary group-hover:bg-brand group-hover:text-white transition-all shadow-sm">
                <component :is="feature.icon" size="18" />
              </div>
              <div>
                <p class="text-[13px] font-black text-primary uppercase tracking-tight">{{ feature.name }}</p>
                <p class="text-[9px] font-bold text-secondary uppercase opacity-40">{{ feature.description }}</p>
              </div>
            </li>
          </ul>
        </BaseCard>

        <BaseCard class="p-8 border-none bg-primary text-background overflow-hidden rounded-[2rem] relative group hover:shadow-2xl transition-all duration-500">
          <div class="relative z-10">
            <h3 class="text-[10px] font-black text-background/40 uppercase tracking-[0.2em] mb-4">Ajuda Integrada</h3>
            <p class="text-xl font-black leading-tight mb-8 italic tracking-tighter uppercase">Documentação Oficial do Gateway</p>
            <a href="https://docs.asaas.com" target="_blank" class="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-brand hover:gap-5 transition-all">
              Acessar Portal <ExternalLink size="14" />
            </a>
          </div>
          <CreditCard class="absolute -bottom-10 -right-10 text-background/5 rotate-12 transition-transform group-hover:scale-110 duration-700" size="180" />
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  CreditCard, 
  Key, 
  Settings, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  Info, 
  HelpCircle,
  ExternalLink,
  Zap,
  Bell,
  FileText,
  TrendingUp,
  Globe,
  ShieldAlert,
  Activity
} from 'lucide-vue-next'
import { ref } from 'vue'

const { user } = useAuth()
const { add: addToast } = useToast()

const config = ref({
  apiKey: '',
  environment: 'sandbox',
  webhookToken: '',
  ativo: false
})

const saving = ref(false)
const features = [
  { name: 'Pix & Boleto', icon: Zap, description: 'Geração instantânea de QR Code' },
  { name: 'Régua de Cobrança', icon: Bell, description: 'Lembretes automáticos via E-mail/SMS' },
  { name: 'Baixas Automáticas', icon: TrendingUp, description: 'Conciliação em tempo real' },
  { name: 'Link de Pagamento', icon: FileText, description: 'Envio rápido para clientes' }
]

const { data, pending } = await useFetch('/api/configuracoes/asaas')
if (data.value) {
  config.value = { ...data.value }
}

const saveConfig = async () => {
  if (!config.value.apiKey && config.value.ativo) {
    return addToast({
      title: 'Atenção',
      description: 'Informe a Chave de API para ativar a integração.',
      type: 'error'
    })
  }

  saving.value = true
  try {
    await $fetch('/api/configuracoes/asaas', {
      method: 'PUT',
      body: config.value
    })
    addToast({
      title: 'Sucesso',
      description: 'Configurações do Asaas atualizadas.',
      type: 'success'
    })
  } catch (error) {
    addToast({
      title: 'Erro',
      description: error.data?.message || 'Erro ao processar.',
      type: 'error'
    })
  } finally {
    saving.value = false
  }
}
</script>
