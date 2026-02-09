<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Integração Sicoob (PIX)
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Configuração do gateway Sicoob para recebimentos via Pix com MTLS
        </p>
      </div>

      <div v-if="user?.admin === 1" class="flex items-center gap-3">
        <button
          @click="saveConfig"
          :disabled="saving"
          class="bg-[#003641] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-[#003641]/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
        >
          <Save size="20" v-if="!saving" />
          <RefreshCw v-else size="20" class="animate-spin" />
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
          Somente administradores mestres podem gerenciar as integrações
          financeiras.
        </p>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <div
        class="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin"
      ></div>
    </div>

    <div v-else class="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <!-- Main Content (8 cols) -->
      <div class="xl:col-span-8 space-y-8">
        <!-- Credenciais -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-4 bg-[#7db61c] rounded-full"></div>
              <h3
                class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
              >
                Autenticação & API
              </h3>
            </div>

            <div
              class="flex items-center gap-2 bg-surface px-4 py-2 border border-border rounded-xl"
            >
              <div
                :class="[
                  'w-2 h-2 rounded-full animate-pulse',
                  config.ativo ? 'bg-[#7db61c]' : 'bg-slate-300',
                ]"
              ></div>
              <span
                class="text-[8px] font-black uppercase tracking-widest text-secondary opacity-60"
              >
                {{
                  config.ativo
                    ? "Conectado ao Sicoob"
                    : "Aguardando Configuração"
                }}
              </span>
            </div>
          </div>

          <div
            class="bg-surface p-8 rounded-[2rem] border border-border shadow-sm space-y-6"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label
                  class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2"
                  >Client ID</label
                >
                <BaseInput
                  v-model="config.clientId"
                  :disabled="user?.admin !== 1"
                  placeholder="ID da aplicação"
                  :icon="UserCircle"
                />
              </div>
              <div class="space-y-2">
                <label
                  class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2"
                  >Client Secret (Opcional)</label
                >
                <BaseInput
                  v-model="config.clientSecret"
                  type="password"
                  :disabled="user?.admin !== 1"
                  placeholder="Segredo da aplicação"
                  :icon="Lock"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label
                  class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2"
                  >Ambiente</label
                >
                <BaseSelect
                  v-model="config.environment"
                  :disabled="user?.admin !== 1"
                  :options="[
                    { label: 'Sandbox (Hologação)', value: 'sandbox' },
                    { label: 'Production (Produção)', value: 'production' },
                  ]"
                  :icon="Settings"
                />
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center gap-2 ml-2">
                <label
                  class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
                  >Chave Pix (Recebedora)</label
                >
                <BaseTooltip
                  text="A chave Pix cadastrada no Sicoob que receberá os pagamentos."
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
                placeholder="Ex: seu-email@empresa.com.br ou CNPJ"
                :icon="Zap"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label
                  class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2"
                  >Conta Corrente</label
                >
                <BaseInput
                  v-model="config.contaCorrente"
                  :disabled="user?.admin !== 1"
                  placeholder="Ex: 12345-6"
                />
              </div>
              <div class="space-y-2">
                <label
                  class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2"
                  >Cooperativa</label
                >
                <BaseInput
                  v-model="config.cooperativa"
                  :disabled="user?.admin !== 1"
                  placeholder="Ex: 4321"
                />
              </div>
            </div>

            <div
              class="flex items-center justify-between p-4 bg-primary/2 rounded-2xl border border-border/50 group hover:border-[#7db61c]/30 transition-all"
            >
              <div class="flex items-center gap-4">
                <div
                  class="p-3 bg-white rounded-xl shadow-sm text-[#7db61c] group-hover:scale-110 transition-transform"
                >
                  <Activity size="20" />
                </div>
                <div>
                  <h4
                    class="text-[11px] font-black uppercase tracking-tight text-primary"
                  >
                    Status do Gateway
                  </h4>
                  <p
                    class="text-[9px] font-bold text-secondary uppercase opacity-60"
                  >
                    Usar Sicoob para cobranças Pix
                  </p>
                </div>
              </div>
              <BaseToggle
                v-model="config.ativo"
                :disabled="user?.admin !== 1"
              />
            </div>
          </div>
        </div>

        <!-- Certificados MTLS -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-4 bg-primary rounded-full"></div>
            <h3
              class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
            >
              Certificados MTLS (Segurança Máxima)
            </h3>
          </div>

          <div
            class="bg-surface p-8 rounded-[2rem] border border-border shadow-sm space-y-6"
          >
            <div class="space-y-2">
              <div class="flex items-center gap-2 ml-2">
                <label
                  class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
                  >Certificado Público (.pem)</label
                >
                <BaseTooltip
                  text="Cole aqui o conteúdo do seu certificado .pem fornecido pelo Sicoob."
                >
                  <HelpCircle
                    size="12"
                    class="text-secondary opacity-40 cursor-help"
                  />
                </BaseTooltip>
              </div>
              <textarea
                v-model="config.certificate"
                :disabled="user?.admin !== 1"
                class="w-full bg-primary/2 border border-border rounded-2xl py-4 px-5 text-xs font-mono text-primary placeholder:text-secondary/20 focus:ring-2 focus:ring-[#7db61c]/20 focus:border-[#7db61c]/30 transition-all outline-none resize-none"
                rows="5"
                placeholder="-----BEGIN CERTIFICATE----- ... -----END CERTIFICATE-----"
              ></textarea>
            </div>

            <div class="space-y-2">
              <div class="flex items-center gap-2 ml-2">
                <label
                  class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
                  >Chave Privada (.key)</label
                >
                <BaseTooltip
                  text="Cole aqui o conteúdo da sua chave privada .key. Mantenha isso em sigilo total."
                >
                  <HelpCircle
                    size="12"
                    class="text-secondary opacity-40 cursor-help"
                  />
                </BaseTooltip>
              </div>
              <textarea
                v-model="config.privateKey"
                :disabled="user?.admin !== 1"
                class="w-full bg-primary/2 border border-border rounded-2xl py-4 px-5 text-xs font-mono text-primary placeholder:text-secondary/20 focus:ring-2 focus:ring-[#7db61c]/20 focus:border-[#7db61c]/30 transition-all outline-none resize-none"
                rows="5"
                placeholder="-----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar (4 cols) -->
      <div class="xl:col-span-4 space-y-6">
        <BaseCard class="p-8 border border-border/50 shadow-sm rounded-[2rem]">
          <h3
            class="text-[10px] font-black text-secondary uppercase tracking-[0.25em] mb-8 opacity-40 flex items-center gap-2"
          >
            <Zap size="14" class="text-[#7db61c]" />
            Benefícios Sicoob
          </h3>
          <ul class="space-y-6">
            <li class="flex items-center gap-4 group cursor-default">
              <div
                class="w-10 h-10 rounded-xl bg-primary/2 flex items-center justify-center text-secondary group-hover:bg-[#7db61c] group-hover:text-white transition-all shadow-sm"
              >
                <Zap size="18" />
              </div>
              <div>
                <p
                  class="text-[13px] font-black text-primary uppercase tracking-tight"
                >
                  Pix Imediato
                </p>
                <p
                  class="text-[9px] font-bold text-secondary uppercase opacity-40"
                >
                  Recebimento em segundos
                </p>
              </div>
            </li>
            <li class="flex items-center gap-4 group cursor-default">
              <div
                class="w-10 h-10 rounded-xl bg-primary/2 flex items-center justify-center text-secondary group-hover:bg-[#003641] group-hover:text-white transition-all shadow-sm"
              >
                <ShieldCheck size="18" />
              </div>
              <div>
                <p
                  class="text-[13px] font-black text-primary uppercase tracking-tight"
                >
                  MTLS 1.2
                </p>
                <p
                  class="text-[9px] font-bold text-secondary uppercase opacity-40"
                >
                  Segurança bancária de ponta
                </p>
              </div>
            </li>
          </ul>
        </BaseCard>

        <BaseCard
          class="p-8 border-none bg-[#003641] text-background overflow-hidden rounded-[2rem] relative group hover:shadow-2xl transition-all duration-500"
        >
          <div class="relative z-10">
            <h3
              class="text-[10px] font-black text-background/40 uppercase tracking-[0.2em] mb-4"
            >
              Desenvolvedores
            </h3>
            <p
              class="text-xl font-black leading-tight mb-8 italic tracking-tighter uppercase"
            >
              Portal Developers Sicoob
            </p>
            <a
              href="https://developers.sicoob.com.br/portal"
              target="_blank"
              class="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#7db61c] hover:gap-5 transition-all"
            >
              Documentação <ExternalLink size="14" />
            </a>
          </div>
          <Building2
            class="absolute -bottom-10 -right-10 text-background/5 rotate-12 transition-transform group-hover:scale-110 duration-700"
            size="180"
          />
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "default",
  middleware: ["admin"],
});
import {
  Building2,
  Settings,
  ShieldCheck,
  Save,
  RefreshCw,
  HelpCircle,
  ExternalLink,
  Zap,
  Activity,
  UserCircle,
  ShieldAlert,
} from "lucide-vue-next";
import { ref } from "vue";

const { user } = useAuth();
const { add: addToast } = useToast();

const config = ref({
  clientId: "",
  clientSecret: "",
  certificate: "",
  privateKey: "",
  environment: "sandbox",
  chavePix: "",
  contaCorrente: "",
  cooperativa: "",
  ativo: false,
});

const saving = ref(false);

const { data, pending } = await useFetch("/api/configuracoes/sicoob");
if (data.value) {
  config.value = { ...data.value };
}

const saveConfig = async () => {
  if (
    config.value.ativo &&
    (!config.value.clientId ||
      !config.value.certificate ||
      !config.value.privateKey)
  ) {
    return addToast({
      title: "Atenção",
      description: "Preencha as credenciais e certificados para ativar.",
      type: "error",
    });
  }

  saving.value = true;
  try {
    await $fetch("/api/configuracoes/sicoob", {
      method: "PUT",
      body: config.value,
    });
    addToast({
      title: "Sucesso",
      description: "Configurações do Sicoob atualizadas.",
      type: "success",
    });
  } catch (error) {
    addToast({
      title: "Erro",
      description: error.data?.message || "Erro ao processar.",
      type: "error",
    });
  } finally {
    saving.value = false;
  }
};
</script>
