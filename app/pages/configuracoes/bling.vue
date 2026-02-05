<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">Integração Bling</h2>
        <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">
          Configurações de ERP para emissão de NF-e, NFS-e e Sincronização de Estoque
        </p>
      </div>

      <div class="flex items-center gap-4">
        <!-- Status da Integração -->
        <div class="hidden md:flex items-center gap-2 bg-surface px-4 py-2 border border-border rounded-xl">
          <div :class="[
            'w-2 h-2 rounded-full animate-pulse',
            form.ativo ? 'bg-emerald-500' : 'bg-slate-300'
          ]"></div>
          <span class="text-[8px] font-black uppercase tracking-widest text-secondary opacity-60">
            {{ form.ativo ? 'Sistema Conectado' : 'Aguardando Configuração' }}
          </span>
        </div>

        <div v-if="isAdmin" class="flex items-center gap-3">
          <button 
            @click="saveChanges" 
            :disabled="loading || !hasChanges"
            class="bg-[#00AEEF] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-[#00AEEF]/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
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
        <p class="text-[10px] font-bold text-amber-500/60 uppercase mt-0.5">Somente administradores mestres podem gerenciar as chaves de integração do Bling.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <!-- Main Content (8 cols) -->
      <div class="xl:col-span-8 space-y-8">
        <!-- API Connection -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-4 bg-[#00AEEF] rounded-full"></div>
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Autenticação (Bling V3)</h3>
          </div>
          
          <div class="bg-surface p-8 rounded-[2rem] border border-border shadow-sm space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2 md:col-span-2">
                    <div class="flex items-center gap-2 ml-2">
                        <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40">API Key (V2/V3 Legacy)</label>
                        <BaseTooltip text="Utilizada para integrações legadas ou consultas rápidas via API.">
                            <HelpCircle size="12" class="text-secondary opacity-40 cursor-help" />
                        </BaseTooltip>
                    </div>
                    <BaseInput v-model="form.apiKey" :disabled="!isAdmin" type="password" :icon="Key" placeholder="Sua Chave API do Bling" />
                </div>

                <div class="space-y-2">
                    <div class="flex items-center gap-2 ml-2">
                        <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40">Client ID (Bling V3 OAuth)</label>
                        <BaseTooltip text="Encontre no console de desenvolvedor do Bling > Aplicativos.">
                            <HelpCircle size="12" class="text-secondary opacity-40 cursor-help" />
                        </BaseTooltip>
                    </div>
                    <BaseInput v-model="form.clientId" :disabled="!isAdmin" :icon="ShieldCheck" placeholder="ID do Aplicativo" />
                </div>

                <div class="space-y-2">
                    <div class="flex items-center gap-2 ml-2">
                        <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40">Client Secret</label>
                    </div>
                    <BaseInput v-model="form.clientSecret" :disabled="!isAdmin" type="password" :icon="Lock" placeholder="Segredo do Aplicativo" />
                </div>
            </div>
            
            <div class="pt-4 flex items-center justify-between border-t border-border">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg" v-if="form.accessToken">
                        <CheckCircle2 size="16" />
                    </div>
                    <p class="text-[9px] font-black uppercase text-secondary tracking-widest" v-if="form.accessToken">
                        Token OAuth2 Identificado
                    </p>
                    <p class="text-[9px] font-black uppercase text-rose-500 tracking-widest" v-else>
                        OAuth2 não autenticado
                    </p>
                </div>
                <button class="px-4 py-2 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/2 transition-all">
                    Renovar Token
                </button>
            </div>
          </div>
        </div>

        <!-- Padrões de Operação -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Configurações de Negócio</h3>
          </div>
          
          <div class="bg-surface p-8 rounded-[2rem] border border-border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
                <div class="flex items-center gap-2 ml-2">
                    <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40">ID do Depósito Padrão</label>
                    <BaseTooltip text="Código do depósito no Bling onde as movimentações de estoque serão centradas.">
                        <HelpCircle size="12" class="text-secondary opacity-40 cursor-help" />
                    </BaseTooltip>
                </div>
                <BaseInput v-model="form.idDeposito" :disabled="!isAdmin" :icon="Archive" placeholder="Ex: 123456" />
            </div>

            <div class="space-y-2">
                <div class="flex items-center gap-2 ml-2">
                    <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40">ID da Categoria Padrão</label>
                </div>
                <BaseInput v-model="form.idCategoria" :disabled="!isAdmin" :icon="Layers" placeholder="Ex: 987654" />
            </div>

            <div class="space-y-2 md:col-span-2">
                <div class="flex items-center gap-2 ml-2">
                    <label class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40">Natureza de Operação Padrão</label>
                    <BaseTooltip text="Texto exato da natureza de operação cadastrada no seu Bling.">
                        <HelpCircle size="12" class="text-secondary opacity-40 cursor-help" />
                    </BaseTooltip>
                </div>
                <BaseInput v-model="form.naturezaOperacao" :disabled="!isAdmin" :icon="Briefcase" placeholder="Venda de Mercadorias / Prestação de Serviço" />
            </div>

            <div class="md:col-span-2 flex items-center justify-between p-4 bg-primary/2 rounded-2xl border border-border/50 group hover:border-[#00AEEF]/30 transition-all">
              <div class="flex items-center gap-4">
                <div class="p-3 bg-white rounded-xl shadow-sm text-[#00AEEF] group-hover:scale-110 transition-transform">
                  <Activity size="20" />
                </div>
                <div>
                  <h4 class="text-[11px] font-black uppercase tracking-tight text-primary">Status da Integração</h4>
                  <p class="text-[9px] font-bold text-secondary uppercase opacity-60">Ativar sincronização automática com o Bling</p>
                </div>
              </div>
              <BaseToggle v-model="form.ativo" :disabled="!isAdmin" color-class="bg-[#00AEEF]" />
            </div>
          </div>
        </div>
      </div>

      <!-- Helper / Info Sidebar (4 cols) -->
      <div class="xl:col-span-4 space-y-6">
        <div class="bg-[#00AEEF] p-8 rounded-[2rem] text-background space-y-6 shadow-2xl shadow-[#00AEEF]/20 relative overflow-hidden group">
          <div class="absolute -right-10 -bottom-10 text-background/10 group-hover:scale-110 transition-transform duration-700">
            <Package size="250" />
          </div>
          
          <div class="relative z-10 space-y-6">
            <div class="p-4 bg-background/10 rounded-2xl w-fit">
              <Zap size="24" />
            </div>
            
            <div class="space-y-4">
              <h4 class="text-xl font-black uppercase tracking-tighter leading-none">Emissão de Notas</h4>
              <p class="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-relaxed">
                Ao ativar a integração, todas as vendas aprovadas no sistema serão enviadas como "Pedidos de Venda" para o Bling, permitindo a emissão rápida de faturas.
              </p>
              
              <ul class="space-y-3">
                <li class="flex items-center gap-3">
                    <div class="w-1 h-1 bg-background rounded-full"></div>
                    <span class="text-[9px] font-black uppercase tracking-widest opacity-80">Sincronização de Clientes</span>
                </li>
                <li class="flex items-center gap-3">
                    <div class="w-1 h-1 bg-background rounded-full"></div>
                    <span class="text-[9px] font-black uppercase tracking-widest opacity-80">Geração de Boletos via Bling</span>
                </li>
                <li class="flex items-center gap-3">
                    <div class="w-1 h-1 bg-background rounded-full"></div>
                    <span class="text-[9px] font-black uppercase tracking-widest opacity-80">Controle de Estoque ERP</span>
                </li>
              </ul>
            </div>

            <div class="pt-6 border-t border-background/10 space-y-4">
               <div class="flex items-center justify-between">
                  <span class="text-[9px] font-black uppercase tracking-widest opacity-60">Ambiente</span>
                  <span class="text-[10px] font-black uppercase">Padrão Bling</span>
               </div>
               <div class="flex items-center justify-between">
                  <span class="text-[9px] font-black uppercase tracking-widest opacity-60">Status da API</span>
                  <span class="text-[10px] font-black uppercase tabular-nums">
                    {{ form.ativo ? 'Conectado' : 'Desativado' }}
                  </span>
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
  Package, Save, Key, Archive, 
  Layers, Activity, ShieldCheck, 
  Lock, CheckCircle2, Zap, Briefcase,
  ShieldAlert, HelpCircle
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
  apiKey: '',
  clientId: '',
  clientSecret: '',
  accessToken: '',
  refreshToken: '',
  idDeposito: '',
  idCategoria: '',
  naturezaOperacao: '',
  ativo: false
})

const isAdmin = computed(() => user.value?.admin === 1)

const loadConfig = async () => {
    try {
        const data = await $fetch('/api/configuracoes/bling')
        form.value = {
            apiKey: data.apiKey || '',
            clientId: data.clientId || '',
            clientSecret: data.clientSecret || '',
            accessToken: data.accessToken || '',
            refreshToken: data.refreshToken || '',
            idDeposito: data.idDeposito || '',
            idCategoria: data.idCategoria || '',
            naturezaOperacao: data.naturezaOperacao || '',
            ativo: !!data.ativo
        }
        originalData.value = JSON.parse(JSON.stringify(form.value))
    } catch (err) {
        addToast('Falha ao carregar configurações', 'error')
    }
}

const hasChanges = computed(() => {
  return JSON.stringify(form.value) !== JSON.stringify(originalData.value)
})

const saveChanges = async () => {
  if (!isAdmin.value) return
  
  loading.value = true
  try {
    await $fetch('/api/configuracoes/bling', {
      method: 'PUT',
      body: form.value
    })
    
    addToast({
      title: 'Configurações Atualizadas',
      description: 'As chaves de acesso ao Bling foram salvas com sucesso.',
      type: 'success'
    })
    originalData.value = JSON.parse(JSON.stringify(form.value))
  } catch (err) {
    addToast({
      title: 'Erro ao Salvar',
      description: err.data?.statusMessage || 'Não foi possível atualizar as configurações.',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

onMounted(loadConfig)
</script>
