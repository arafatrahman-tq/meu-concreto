<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Nuvem Fiscal
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Integração nativa para emissão de NF-e e NFS-e de alta performance
        </p>
      </div>

      <div class="flex items-center gap-4">
        <!-- Status da Integração -->
        <div
          class="hidden md:flex items-center gap-2 bg-surface px-4 py-2 border border-border rounded-xl"
        >
          <div
            :class="[
              'w-2 h-2 rounded-full animate-pulse',
              form.ativo ? 'bg-emerald-500' : 'bg-slate-300',
            ]"
          />
          <span
            class="text-[8px] font-black uppercase tracking-widest text-secondary opacity-60"
          >
            {{ form.ativo ? "Sistema Conectado" : "Aguardando Configuração" }}
          </span>
        </div>

        <div
          v-if="isAdmin"
          class="flex items-center gap-3"
        >
          <button
            :disabled="loading || !hasChanges"
            class="bg-brand text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-brand/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed outline-none"
            @click="saveChanges"
          >
            <Save
              v-if="!loading"
              size="20"
            />
            <RefreshCw
              v-else
              size="20"
              class="animate-spin"
            />
            {{ loading ? "Processando" : "Salvar Alterações" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Permission Warning -->
    <div
      v-if="!isAdmin"
      class="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4"
    >
      <div class="p-2 bg-amber-500/20 text-amber-500 rounded-xl">
        <ShieldAlert size="20" />
      </div>
      <div>
        <h4 class="text-xs font-black uppercase tracking-widest text-amber-500">
          Acesso Restrito
        </h4>
        <p class="text-[10px] font-bold text-amber-500/60 uppercase mt-0.5">
          Somente administradores mestres podem gerenciar as chaves de
          integração da Nuvem Fiscal.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <!-- Main Content (8 cols) -->
      <div class="xl:col-span-8 space-y-8">
        <!-- API Connection -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-4 bg-brand rounded-full" />
            <h3
              class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
            >
              Autenticação (OAuth 2.0)
            </h3>
          </div>

          <div
            class="bg-surface p-8 rounded-[2rem] border border-border shadow-sm space-y-6"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2 md:col-span-2">
                <div
                  class="bg-brand/5 border border-brand/10 p-4 rounded-2xl flex items-start gap-3"
                >
                  <ShieldCheck
                    size="18"
                    class="text-brand shrink-0 mt-1"
                  />
                  <p
                    class="text-[10px] font-medium text-primary/70 leading-relaxed uppercase"
                  >
                    Para a automação funcionar, o seu Client ID deve ter os
                    escopos <span class="font-black text-brand">empresa</span>,
                    <span class="font-black text-brand">nfe</span>,
                    <span class="font-black text-brand">nfse</span> e
                    <span class="font-black text-brand">cep</span> habilitados
                    no Console da Nuvem Fiscal.
                  </p>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center gap-2 ml-2">
                  <label
                    class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
                  >Client ID</label>
                  <BaseTooltip
                    text="Obtenha o Client ID no Console da Nuvem Fiscal."
                  >
                    <HelpCircle
                      size="12"
                      class="text-secondary opacity-40 cursor-help"
                    />
                  </BaseTooltip>
                </div>
                <BaseInput
                  v-model="form.clientId"
                  :disabled="!isAdmin"
                  :icon="ShieldCheck"
                  placeholder="ID do Cliente"
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-center gap-2 ml-2">
                  <label
                    class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
                  >Client Secret</label>
                </div>
                <BaseInput
                  v-model="form.clientSecret"
                  :disabled="!isAdmin"
                  type="password"
                  :icon="Lock"
                  placeholder="Segredo do Cliente"
                />
              </div>

              <div class="space-y-2 md:col-span-2">
                <div class="flex items-center gap-2 ml-2">
                  <label
                    class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
                  >Ambiente de Execução</label>
                </div>
                <BaseSelect
                  v-model="form.environment"
                  :disabled="!isAdmin"
                  :options="[
                    { label: 'Sandbox (Homologação)', value: 'sandbox' },
                    { label: 'Produção', value: 'production' },
                  ]"
                />
              </div>
            </div>

            <div
              class="pt-4 flex items-center justify-between border-t border-border"
            >
              <div class="flex items-center gap-3">
                <div
                  v-if="form.ativo"
                  class="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"
                >
                  <CheckCircle2 size="16" />
                </div>
                <p
                  v-if="form.ativo"
                  class="text-[9px] font-black uppercase text-secondary tracking-widest"
                >
                  Integração Ativa
                </p>
                <p
                  v-else
                  class="text-[9px] font-black uppercase text-rose-500 tracking-widest"
                >
                  Integração Desativada
                </p>
              </div>
              <div class="flex items-center gap-4">
                <span
                  class="text-[11px] font-black uppercase tracking-tight text-primary"
                >Status</span>
                <BaseToggle
                  v-model="form.ativo"
                  :disabled="!isAdmin"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Automation Status Alert (Dynamic) -->
        <div
          v-if="automationStatus"
          class="bg-surface p-6 border border-border rounded-[2rem] space-y-4 shadow-sm animate-enter"
        >
          <h3
            class="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2"
          >
            <Activity
              size="14"
              class="text-brand"
            />
            Status da Ultima Sincronização
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div
              v-for="(val, key) in automationStatus"
              :key="key"
              :class="[
                'p-4 rounded-2xl border flex flex-col items-center gap-2',
                val
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600'
                  : 'bg-rose-500/5 border-rose-500/20 text-rose-600',
              ]"
            >
              <component
                :is="val ? CheckCircle2 : XCircle"
                size="20"
              />
              <span class="text-[8px] font-black uppercase tracking-widest">
                {{
                  key === "company"
                    ? "Empresa Sync"
                    : key === "certificate"
                      ? "Certificado Sync"
                      : "NFS-e Config Sync"
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- Certificate & NFSe Config -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-4 bg-indigo-500 rounded-full" />
            <h3
              class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
            >
              Certificado Digital e NFS-e
            </h3>
          </div>

          <div
            class="bg-surface p-8 rounded-[2rem] border border-border shadow-sm space-y-8"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Certificado Digital -->
              <div class="space-y-4 md:col-span-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <label
                      class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
                    >Arquivo do Certificado (.pfx / .p12)</label>
                    <BaseTooltip
                      text="O certificado será convertido para Base64 e enviado de forma segura."
                    >
                      <HelpCircle
                        size="12"
                        class="text-secondary opacity-40 cursor-help"
                      />
                    </BaseTooltip>
                  </div>
                  <span
                    v-if="form.certificado"
                    class="text-[8px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md"
                  >Certificado Presente</span>
                </div>

                <div class="relative group">
                  <input
                    type="file"
                    accept=".pfx,.p12"
                    :disabled="!isAdmin"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    @change="handleFileUpload"
                  >
                  <div
                    class="w-full bg-primary/2 border border-dashed border-border group-hover:border-brand/40 rounded-2xl py-8 flex flex-col items-center justify-center gap-2 transition-all"
                  >
                    <Upload
                      size="24"
                      class="text-secondary group-hover:text-brand transition-colors"
                    />
                    <span
                      class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60"
                    >Clique ou arraste o certificado aqui</span>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <label
                  class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2"
                >Senha do Certificado</label>
                <BaseInput
                  v-model="form.certificadoSenha"
                  :disabled="!isAdmin"
                  type="password"
                  :icon="Key"
                  placeholder="Senha do arquivo"
                />
              </div>

              <div class="space-y-2">
                <label
                  class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2"
                >Série NFS-e</label>
                <BaseInput
                  v-model="form.nfseSerie"
                  :disabled="!isAdmin"
                  placeholder="Ex: 1 ou SN"
                />
              </div>

              <div class="space-y-2">
                <label
                  class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2"
                >Lote NFS-e</label>
                <BaseInput
                  v-model.number="form.nfseLote"
                  type="number"
                  :disabled="!isAdmin"
                  placeholder="Ex: 1"
                />
              </div>

              <div class="space-y-2">
                <label
                  class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2"
                >Próximo Número NFS-e</label>
                <BaseInput
                  v-model.number="form.nfseProximoNumero"
                  type="number"
                  :disabled="!isAdmin"
                  placeholder="Ex: 101"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Helper Sidebar -->
      <div class="xl:col-span-4 space-y-6">
        <div
          class="bg-brand p-8 rounded-[2rem] text-background space-y-6 shadow-2xl shadow-brand/20 relative overflow-hidden group"
        >
          <div
            class="absolute -right-10 -bottom-10 text-background/10 group-hover:scale-110 transition-transform duration-700"
          >
            <Cloud size="250" />
          </div>

          <div class="relative z-10 space-y-6">
            <div class="p-4 bg-background/10 rounded-2xl w-fit">
              <Zap size="24" />
            </div>

            <div class="space-y-4">
              <h4
                class="text-xl font-black uppercase tracking-tighter leading-none"
              >
                Emissão Direta
              </h4>
              <p
                class="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-relaxed"
              >
                A Nuvem Fiscal oferece uma API robusta para emissão de NF-e e
                NFS-e, cuidando da comunicação com as prefeituras e SEFAZ.
              </p>

              <ul class="space-y-3">
                <li class="flex items-center gap-3">
                  <div class="w-1 h-1 bg-background rounded-full" />
                  <span
                    class="text-[9px] font-black uppercase tracking-widest opacity-80"
                  >Gestão de Certificados</span>
                </li>
                <li class="flex items-center gap-3">
                  <div class="w-1 h-1 bg-background rounded-full" />
                  <span
                    class="text-[9px] font-black uppercase tracking-widest opacity-80"
                  >Mensageria Assíncrona</span>
                </li>
                <li class="flex items-center gap-3">
                  <div class="w-1 h-1 bg-background rounded-full" />
                  <span
                    class="text-[9px] font-black uppercase tracking-widest opacity-80"
                  >Suporte a Multi-Ceps</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  Save,
  RefreshCw,
  Key,
  ShieldCheck,
  Lock,
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  Cloud,
  Zap,
  Activity,
  XCircle,
  Upload,
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

definePageMeta({
  layout: 'default',
  middleware: ['admin'],
})

const { user } = useAuth()
const { add: addToast } = useToast()
const isAdmin = computed(() => user.value?.admin === 1)

const loading = ref(false)
const initialForm = ref({})
const form = ref({
  clientId: '',
  clientSecret: '',
  environment: 'sandbox',
  certificado: '',
  certificadoSenha: '',
  nfseSerie: '',
  nfseLote: 1,
  nfseProximoNumero: 1,
  ativo: false,
})

const automationStatus = ref(null)

const hasChanges = computed(() => {
  return JSON.stringify(form.value) !== JSON.stringify(initialForm.value)
})

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    // Extract base64
    const base64 = e.target.result.split(',')[1]
    form.value.certificado = base64
    addToast(
      {
        title: 'Certificado Carregado',
        description: 'O arquivo foi processado e está pronto para salvar.',
      },
      'success',
    )
  }
  reader.readAsDataURL(file)
}

const fetchConfig = async () => {
  try {
    const data = await $fetch('/api/configuracoes/nuvemfiscal')
    form.value = {
      clientId: data.clientId || '',
      clientSecret: data.clientSecret || '',
      environment: data.environment || 'sandbox',
      certificado: data.certificado || '',
      certificadoSenha: data.certificadoSenha || '',
      nfseSerie: data.nfseSerie || '',
      nfseLote: Number(data.nfseLote) || 1,
      nfseProximoNumero: Number(data.nfseProximoNumero) || 1,
      ativo: data.ativo || false,
    }
    initialForm.value = { ...form.value }
  }
  catch (error) {
    addToast(
      {
        title: 'Erro ao Carregar',
        description:
          'Não foi possível carregar as configurações da Nuvem Fiscal.',
      },
      'error',
    )
  }
}

const saveChanges = async () => {
  if (!isAdmin.value) return
  loading.value = true
  automationStatus.value = null

  try {
    const response = await $fetch('/api/configuracoes/nuvemfiscal', {
      method: 'PUT',
      body: form.value,
    })

    if (response.status) {
      automationStatus.value = response.status
    }

    initialForm.value = { ...form.value }

    if (response.error) {
      addToast(
        {
          title: 'Atenção',
          description: response.message,
        },
        'warning',
      )
    }
    else {
      addToast(
        {
          title: 'Sucesso!',
          description: 'Configurações sincronizadas com a Nuvem Fiscal.',
        },
        'success',
      )
    }
  }
  catch (error) {
    addToast(
      {
        title: 'Erro ao Salvar',
        description:
          error.data?.message || 'Ocorreu um erro ao salvar as configurações.',
      },
      'error',
    )
  }
  finally {
    loading.value = false
  }
}

onMounted(fetchConfig)
</script>
