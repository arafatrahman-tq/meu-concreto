<template>
  <div class="flex flex-col gap-8 animate-enter pb-20">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2
          class="text-4xl font-black text-primary tracking-tighter uppercase flex items-center gap-3"
        >
          Fiscal AI <span class="text-brand opacity-50">Pulse</span>
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Inteligência Artificial para Monitoramento e Atualização de Regras
          SEFAZ
        </p>
      </div>

      <div class="flex items-center gap-4">
        <div
          v-if="apiKey"
          class="flex items-center gap-2 bg-emerald-500/5 px-4 py-2 border border-emerald-500/20 rounded-xl"
        >
          <Sparkles
            size="16"
            class="text-emerald-500"
          />
          <span
            class="text-[8px] font-black uppercase tracking-widest text-emerald-500"
          >Gemini 3 Flash - Preview</span>
        </div>
        <button
          class="bg-surface border border-border px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-brand/50 transition-all flex items-center gap-2"
          @click="showKeyModal = true"
        >
          <Key size="16" />
          Configurar Chave
        </button>
      </div>
    </div>

    <!-- Main Interface -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <!-- Chat/Prompt Area -->
      <div class="xl:col-span-8 flex flex-col gap-6">
        <div
          class="bg-surface border border-border rounded-3xl p-8 min-h-125 flex flex-col relative overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-linear-to-b from-brand/2 to-transparent pointer-events-none"
          />

          <!-- Messages -->
          <div
            class="flex-1 overflow-y-auto space-y-6 relative z-10 pr-4 scrollbar-thin"
          >
            <div
              v-if="messages.length === 0"
              class="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40"
            >
              <Bot
                size="64"
                class="text-brand"
              />
              <p class="text-xs font-black uppercase tracking-widest max-w-sm">
                Inicie uma pesquisa fiscal. Ex: "Verifique novas notas técnicas
                da SEFAZ para 2026" ou "Atualize o CBenef para o estado de MG".
              </p>
            </div>

            <div
              v-for="(msg, i) in messages"
              :key="i"
              :class="[
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start',
              ]"
            >
              <div
                :class="[
                  'max-w-[85%] p-6 rounded-3xl text-sm font-bold leading-relaxed transition-all shadow-sm',
                  msg.role === 'user'
                    ? 'bg-brand text-white rounded-tr-none'
                    : 'bg-primary/3 border border-border text-primary rounded-tl-none',
                ]"
              >
                <div
                  v-if="msg.content"
                  class="whitespace-pre-wrap uppercase tracking-tight"
                >
                  {{ msg.content }}
                </div>

                <!-- Action Suggestion if AI -->
                <div
                  v-if="msg.suggestion"
                  class="mt-6 p-4 bg-background/50 border border-border rounded-2xl space-y-4"
                >
                  <div class="flex items-center gap-2">
                    <Zap
                      size="16"
                      class="text-amber-500"
                    />
                    <span
                      class="text-[10px] font-black uppercase tracking-widest"
                    >Alteração Sugerida (DRAFT)</span>
                  </div>
                  <pre
                    class="text-[10px] font-mono bg-black/5 p-4 rounded-xl overflow-x-auto"
                  >{{ JSON.stringify(msg.suggestion, null, 2) }}</pre>
                  <button
                    class="w-full bg-emerald-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    @click="applyUpdate(msg.suggestion)"
                  >
                    <Check size="16" />
                    Aplicar no Código Core
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="loading"
              class="flex gap-2 p-6 bg-primary/3 rounded-3xl rounded-tl-none w-fit animate-pulse"
            >
              <div class="w-2 h-2 bg-brand rounded-full animate-bounce" />
              <div
                class="w-2 h-2 bg-brand rounded-full animate-bounce delay-100"
              />
              <div
                class="w-2 h-2 bg-brand rounded-full animate-bounce delay-200"
              />
            </div>
          </div>

          <!-- Input Area -->
          <div class="mt-8 relative pt-4 border-t border-border">
            <textarea
              v-model="prompt"
              placeholder="Descreva a atualização fiscal desejada..."
              class="w-full bg-primary/2 border border-border rounded-2xl p-6 pr-20 text-sm font-bold text-primary placeholder:text-secondary/30 focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all outline-none resize-none uppercase tracking-tight"
              rows="3"
              @keydown.enter.prevent="sendMessage"
            />
            <button
              :disabled="loading || !prompt.trim() || !apiKey"
              class="absolute right-4 bottom-8 bg-brand text-white p-4 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/20 disabled:opacity-50 disabled:grayscale"
              @click="sendMessage"
            >
              <ArrowUp size="20" />
            </button>
          </div>
        </div>
      </div>

      <!-- Settings/Context Sidebar -->
      <div class="xl:col-span-4 space-y-6">
        <!-- Context Information -->
        <div class="bg-surface border border-border p-8 rounded-3xl space-y-6">
          <h4
            class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-40"
          >
            Módulos Analisados
          </h4>

          <div class="space-y-4">
            <div
              class="p-6 bg-primary/2 border border-border rounded-2xl flex items-center gap-5 group hover:border-brand/30 transition-all"
            >
              <div
                class="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center"
              >
                <Database size="24" />
              </div>
              <div>
                <p
                  class="text-[10px] font-black uppercase text-primary tracking-tighter"
                >
                  Database Mapping
                </p>
                <p
                  class="text-[8px] font-bold text-secondary uppercase tracking-widest opacity-60"
                >
                  SCHEMA.TS EM CACHE
                </p>
              </div>
            </div>
            <div
              class="p-6 bg-primary/2 border border-border rounded-2xl flex items-center gap-5 group hover:border-brand/30 transition-all"
            >
              <div
                class="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center"
              >
                <FileCode size="24" />
              </div>
              <div>
                <p
                  class="text-[10px] font-black uppercase text-primary tracking-tighter"
                >
                  Fiscal Core
                </p>
                <p
                  class="text-[8px] font-bold text-secondary uppercase tracking-widest opacity-60"
                >
                  RULES.TS EM CACHE
                </p>
              </div>
            </div>
          </div>

          <div
            class="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-4"
          >
            <ShieldAlert
              size="18"
              class="text-amber-500 mt-1 shrink-0"
            />
            <p
              class="text-[9px] font-bold text-amber-500 uppercase leading-relaxed tracking-widest opacity-80"
            >
              O agente possui privilégios de escrita no motor fiscal. Revise as
              alterações propostas antes de confirmar a aplicação.
            </p>
          </div>
        </div>

        <!-- Version History / Rollback -->
        <div class="bg-surface border border-border p-8 rounded-3xl space-y-6">
          <div class="flex items-center justify-between">
            <h4
              class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-40"
            >
              Histórico de Versões
            </h4>
            <History
              size="14"
              class="opacity-30"
            />
          </div>

          <div
            v-if="backups.length === 0"
            class="text-center py-8 opacity-30"
          >
            <p class="text-[8px] font-black uppercase tracking-widest">
              Nenhum snapshot encontrado
            </p>
          </div>

          <div
            v-else
            class="space-y-4 max-h-75 overflow-y-auto pr-2 scrollbar-thin"
          >
            <div
              v-for="b in backups"
              :key="b.filename"
              class="p-4 bg-primary/2 border border-border rounded-2xl flex items-center justify-between group hover:border-brand/30 transition-all shadow-sm"
            >
              <div class="flex flex-col gap-1">
                <p
                  class="text-[10px] font-black uppercase text-primary tracking-tighter"
                >
                  {{ b.formattedDate }}
                </p>
                <p
                  class="text-[8px] font-bold text-secondary uppercase tracking-widest opacity-40"
                >
                  {{ b.target.replace(".ts", "").toUpperCase() }}
                </p>
              </div>
              <button
                class="p-2.5 rounded-xl bg-surface border border-border text-primary hover:bg-brand hover:text-white hover:border-brand transition-all group/btn shadow-sm"
                title="Restaurar esta versão"
                @click="rollback(b.filename)"
              >
                <RotateCcw size="14" />
              </button>
            </div>
          </div>
        </div>

        <!-- Capability List -->
        <div
          class="bg-surface border border-border p-8 rounded-3xl space-y-6 relative overflow-hidden group"
        >
          <div
            class="absolute top-0 right-0 p-4 opacity-5 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700"
          >
            <BrainCircuit
              size="120"
              class="text-brand"
            />
          </div>

          <div class="flex items-center gap-3 relative z-10">
            <div
              class="w-10 h-10 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center"
            >
              <BrainCircuit
                size="20"
                class="text-brand"
              />
            </div>
            <h4
              class="text-xs font-black uppercase tracking-widest text-primary"
            >
              Agent Skills
            </h4>
          </div>
          <ul class="space-y-4 relative z-10">
            <li
              v-for="skill in [
                'NT SEFAZ Research',
                'CBenef Mapping',
                'EC 132/23 Engine',
                'Drizzle Scripting',
              ]"
              :key="skill"
              class="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-secondary group/skill transition-all"
            >
              <div
                class="w-1.5 h-1.5 bg-brand rounded-full shadow-[0_0_10px_rgba(255,122,61,0.5)] group-hover/skill:scale-150 transition-all"
              />
              <span
                class="opacity-60 group-hover/skill:opacity-100 transition-all"
              >{{ skill }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- API Key Modal -->
    <BaseModal
      v-model="showKeyModal"
      title="Gemini API Configuration"
    >
      <div class="space-y-6 p-2">
        <p
          class="text-xs font-bold text-secondary uppercase tracking-widest leading-relaxed"
        >
          Sua chave é armazenada localmente e usada apenas para requisições de
          backend server-side.
        </p>
        <BaseInput
          v-model="tempKey"
          placeholder="Paste your API key here..."
          :icon="Key"
          type="password"
        />
        <button
          class="w-full bg-brand text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-brand/20 transition-all font-sans"
          @click="saveKey"
        >
          Confirmar Configuração
        </button>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Sparkles,
  Key,
  Bot,
  ArrowUp,
  Zap,
  Check,
  Database,
  FileCode,
  ShieldAlert,
  BrainCircuit,
  History,
  RotateCcw,
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const { user } = useAuth()
const { add: addToast } = useToast()

const showKeyModal = ref(false)
const loading = ref(false)
const apiKey = ref('')
const tempKey = ref('')
const prompt = ref('')
const messages = ref([])
const backups = ref([])

const fetchBackups = async () => {
  try {
    const data = await $fetch('/api/gestao/fiscal/backups')
    backups.value = data
  }
  catch (e) {
    console.error('Erro ao buscar históricos', e)
  }
}

const rollback = async (filename) => {
  if (
    !confirm(
      'Deseja restaurar as regras fiscais para esta versão? O sistema será reiniciado.',
    )
  )
    return

  try {
    loading.value = true
    await $fetch('/api/gestao/fiscal/rollback', {
      method: 'POST',
      body: { filename },
    })
    addToast(
      {
        title: 'Rollback Concluído',
        description: 'O sistema foi restaurado com sucesso.',
      },
      'success',
    )
    await fetchBackups()
  }
  catch (error) {
    addToast(
      {
        title: 'Erro',
        description: error.data?.message || 'Erro ao realizar rollback',
      },
      'error',
    )
  }
  finally {
    loading.value = false
  }
}

const saveKey = () => {
  if (!tempKey.value) return
  localStorage.setItem('MC_GEMINI_KEY', tempKey.value)
  apiKey.value = tempKey.value
  showKeyModal.value = false
  addToast(
    { title: 'Configurado', description: 'Chave API salva com sucesso' },
    'success',
  )
}

const sendMessage = async () => {
  if (loading.value || !prompt.value.trim() || !apiKey.value) return

  const userMsg = prompt.value
  messages.value.push({ role: 'user', content: userMsg })
  prompt.value = ''
  loading.value = true

  try {
    const response = await $fetch('/api/gestao/fiscal/ai-agent', {
      method: 'POST',
      body: {
        prompt: userMsg,
        apiKey: apiKey.value,
      },
    })

    messages.value.push({
      role: 'assistant',
      content: response.content,
      suggestion: response.suggestion,
    })
  }
  catch (error) {
    addToast(
      {
        title: 'Erro',
        description: error.data?.message || 'Falha na comunicação com o agente',
      },
      'error',
    )
    messages.value.push({
      role: 'assistant',
      content: 'Desculpe, ocorreu um erro ao processar sua solicitação.',
    })
  }
  finally {
    loading.value = false
  }
}

const applyUpdate = async (suggestion) => {
  if (
    !confirm(
      'Deseja realmente aplicar estas alterações no motor fiscal do sistema?',
    )
  )
    return

  try {
    await $fetch('/api/gestao/fiscal/ai-apply', {
      method: 'POST',
      body: { suggestion },
    })
    addToast(
      {
        title: 'Sucesso',
        description: 'Regras fiscais atualizadas no core do sistema',
      },
      'success',
    )
    await fetchBackups()
  }
  catch (error) {
    addToast(
      { title: 'Erro', description: 'Erro ao aplicar alterações' },
      'error',
    )
  }
}

onMounted(() => {
  fetchBackups()
  const saved = localStorage.getItem('MC_GEMINI_KEY')
  if (saved) apiKey.value = saved
  else showKeyModal.value = true
})

definePageMeta({
  middleware: ['admin'],
  name: 'Fiscal AI',
})
</script>
