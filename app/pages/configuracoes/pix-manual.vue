<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Pix Manual
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Configure uma chave Pix estática para pagamentos sem gateway
          automatizado
        </p>
      </div>

      <div
        v-if="user?.admin === 1"
        class="flex items-center gap-3"
      >
        <button
          :disabled="saving"
          class="bg-brand text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-brand/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          @click="saveConfig"
        >
          <Save
            v-if="!saving"
            size="20"
          />
          <RefreshCw
            v-else
            size="20"
            class="animate-spin"
          />
          {{ saving ? "Processando" : "Salvar Alterações" }}
        </button>
      </div>
    </div>

    <!-- Permission Warning -->
    <div
      v-if="user?.admin !== 1"
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
          Somente administradores podem gerenciar as configurações de pagamento.
        </p>
      </div>
    </div>

    <div
      v-if="pending"
      class="flex justify-center py-20"
    >
      <div
        class="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin"
      />
    </div>

    <div
      v-else
      class="grid grid-cols-1 xl:grid-cols-12 gap-8"
    >
      <div class="xl:col-span-8 space-y-8">
        <!-- Credenciais -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-4 bg-brand rounded-full" />
              <h3
                class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
              >
                Dados do Pix
              </h3>
            </div>

            <div
              class="flex items-center gap-2 bg-surface px-4 py-2 border border-border rounded-xl"
            >
              <div
                :class="[
                  'w-2 h-2 rounded-full animate-pulse',
                  config.ativo ? 'bg-emerald-500' : 'bg-slate-300',
                ]"
              />
              <span
                class="text-[8px] font-black uppercase tracking-widest text-secondary opacity-60"
              >
                {{ config.ativo ? "Pix Manual Ativo" : "Gateway Desabilitado" }}
              </span>
            </div>
          </div>

          <div
            class="bg-surface p-8 rounded-[2rem] border border-border shadow-sm space-y-6"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <div class="flex items-center gap-2 ml-2">
                  <label
                    class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
                  >Chave Pix</label>
                  <BaseTooltip
                    text="Pode ser CPF, CNPJ, E-mail, Telefone ou Chave Aleatória."
                  >
                    <HelpCircle
                      size="12"
                      class="text-secondary opacity-40 cursor-help"
                    />
                  </BaseTooltip>
                </div>
                <BaseInput
                  v-model="config.chavePix"
                  :disabled="user?.admin !== 1"
                  placeholder="Sua chave Pix"
                  :icon="Key"
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-center gap-2 ml-2">
                  <label
                    class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
                  >Beneficiário</label>
                  <BaseTooltip
                    text="Nome completo do titular da conta ou nome fantasia da empresa."
                  >
                    <HelpCircle
                      size="12"
                      class="text-secondary opacity-40 cursor-help"
                    />
                  </BaseTooltip>
                </div>
                <BaseInput
                  v-model="config.beneficiario"
                  :disabled="user?.admin !== 1"
                  placeholder="Nome do Beneficiário"
                  :icon="User"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <div class="flex items-center gap-2 ml-2">
                  <label
                    class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
                  >Cidade</label>
                  <BaseTooltip text="Cidade da conta bancária (ex: CUIABA).">
                    <HelpCircle
                      size="12"
                      class="text-secondary opacity-40 cursor-help"
                    />
                  </BaseTooltip>
                </div>
                <BaseInput
                  v-model="config.cidade"
                  :disabled="user?.admin !== 1"
                  placeholder="CUIABA"
                  :icon="MapPin"
                />
              </div>

              <div
                class="flex items-center justify-between p-4 bg-primary/2 rounded-2xl border border-border/50 group hover:border-brand/30 transition-all self-end"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="p-3 bg-white rounded-xl shadow-sm text-brand group-hover:scale-110 transition-transform"
                  >
                    <CheckCircle size="20" />
                  </div>
                  <div>
                    <h4
                      class="text-[11px] font-black uppercase tracking-tight text-primary"
                    >
                      Status
                    </h4>
                    <p
                      class="text-[9px] font-bold text-secondary uppercase opacity-60"
                    >
                      Habilitar Pix Manual
                    </p>
                  </div>
                </div>
                <!-- BaseToggle usually uses boolean, but database is integer (0/1). UI handles this. -->
                <BaseToggle
                  v-model="config.ativo"
                  :disabled="user?.admin !== 1"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Info Card -->
        <div
          class="bg-blue-500/5 border border-blue-500/10 p-6 rounded-[2rem] flex items-start gap-4"
        >
          <div class="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
            <Info size="24" />
          </div>
          <div class="space-y-2">
            <h4
              class="text-sm font-black uppercase tracking-widest text-blue-500"
            >
              Sobre o Pix Manual
            </h4>
            <p
              class="text-[10px] font-bold text-blue-500/80 uppercase leading-relaxed"
            >
              O Pix Manual gera um código "Copia e Cola" estático baseado nas
              informações fornecidas. Diferente do Sicoob ou Asaas, o sistema
              não consegue confirmar o pagamento automaticamente. Você deverá
              baixar o pagamento manualmente no financeiro após conferir em seu
              banco.
            </p>
          </div>
        </div>
      </div>

      <!-- Helper Sidebar (4 cols) -->
      <div class="xl:col-span-4 gap-8 flex flex-col">
        <div class="bg-surface border border-border rounded-3xl p-8">
          <h4
            class="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6"
          >
            Ajuda
          </h4>
          <div class="space-y-6">
            <div class="flex gap-4">
              <div
                class="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-black text-xs shrink-0"
              >
                1
              </div>
              <p
                class="text-[10px] font-bold text-secondary uppercase leading-relaxed"
              >
                Insira sua chave Pix (CPF, CNPJ, E-mail, Celular ou Aleatória)
              </p>
            </div>
            <div class="flex gap-4">
              <div
                class="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-black text-xs shrink-0"
              >
                2
              </div>
              <p
                class="text-[10px] font-bold text-secondary uppercase leading-relaxed"
              >
                Preencha o nome do beneficiário e a cidade da conta
              </p>
            </div>
            <div class="flex gap-4">
              <div
                class="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-black text-xs shrink-0"
              >
                3
              </div>
              <p
                class="text-[10px] font-bold text-secondary uppercase leading-relaxed"
              >
                Ative o status para que essa opção apareça como fallback nos
                orçamentos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Save,
  RefreshCw,
  ShieldAlert,
  Key,
  HelpCircle,
  CheckCircle,
  Info,
  User,
  MapPin,
} from 'lucide-vue-next'

definePageMeta({
  middleware: ['admin'],
})

const { user } = useAuth()
const toast = useToast()

const saving = ref(false)

const {
  data: config,
  pending,
  refresh,
} = await useAsyncData('pix-manual-config', () =>
  $fetch('/api/configuracoes/pix-manual'),
)

const saveConfig = async () => {
  if (saving.value) return
  saving.value = true

  try {
    const payload = {
      ...config.value,
      ativo: !!config.value.ativo,
      idEmpresa: user.value.idEmpresa,
    }

    await $fetch('/api/configuracoes/pix-manual', {
      method: 'PUT',
      body: payload,
    })

    toast.add({
      title: 'Configurações Salvas',
      description:
        'As configurações do Pix Manual foram atualizadas com sucesso.',
      type: 'success',
    })

    refresh()
  }
  catch (error) {
    toast.add({
      title: 'Erro ao Salvar',
      description:
        error.data?.message
        || 'Ocorreu um erro ao tentar salvar as configurações.',
      type: 'error',
    })
  }
  finally {
    saving.value = false
  }
}
</script>
