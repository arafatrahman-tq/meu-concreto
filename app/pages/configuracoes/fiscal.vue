<template>
  <div class="flex flex-col gap-8 animate-enter pb-20">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Centro Fiscal
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Gestão centralizada de tributação, reforma 2026 e saneamento de dados
        </p>
      </div>

      <div class="flex items-center gap-4">
        <NuxtLink
          to="/configuracoes/fiscal-ai"
          class="hidden md:flex items-center gap-2 bg-emerald-500/5 px-4 py-2 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/10 transition-all"
        >
          <Sparkles size="16" class="text-emerald-500" />
          <span
            class="text-[8px] font-black uppercase tracking-widest text-emerald-500"
            >Fiscal AI Pulse</span
          >
        </NuxtLink>

        <!-- Status Badge -->
        <div
          v-if="diag"
          class="hidden md:flex items-center gap-2 bg-surface px-4 py-2 border border-border rounded-xl"
        >
          <div
            :class="[
              'w-2 h-2 rounded-full',
              diag.status === 'PRONTO'
                ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'bg-rose-500 animate-pulse',
            ]"
          ></div>
          <span
            class="text-[8px] font-black uppercase tracking-widest text-secondary opacity-60"
          >
            {{
              diag.status === "PRONTO"
                ? "Conformidade Fiscal OK"
                : "Pendências Detectadas"
            }}
          </span>
        </div>

        <div v-if="isAdmin" class="flex items-center gap-3">
          <button
            @click="saveSettings"
            :disabled="loading"
            class="bg-brand text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-brand/20 disabled:opacity-50 outline-none"
          >
            <Save size="20" v-if="!loading" />
            <RefreshCw v-else size="20" class="animate-spin" />
            {{ loading ? "Processando" : "Salvar Alterações" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Diagnostic Cards -->
    <div v-if="diag" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        class="bg-surface border border-border p-6 rounded-3xl flex items-center gap-5 group hover:border-brand/30 transition-all"
      >
        <div
          :class="[
            'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
            diag.status === 'PRONTO'
              ? 'bg-emerald-500/10 text-emerald-500'
              : 'bg-rose-500/10 text-rose-500',
          ]"
        >
          <Activity size="28" />
        </div>
        <div>
          <p
            class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
          >
            Saúde Fiscal
          </p>
          <p class="text-base font-black uppercase text-primary tracking-tight">
            {{ diag.status === "PRONTO" ? "Tudo em Ordem" : "Requer Atenção" }}
          </p>
        </div>
      </div>

      <div
        class="bg-surface border border-border p-6 rounded-3xl flex items-center gap-5 group hover:border-amber-500/30 transition-all"
      >
        <div
          class="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center"
        >
          <AlertTriangle size="28" />
        </div>
        <div>
          <p
            class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
          >
            Avisos e Pendências
          </p>
          <p class="text-base font-black uppercase text-primary tracking-tight">
            {{ diag.avisos.length }}
            {{ diag.avisos.length === 1 ? "Alerta" : "Alertas Ativos" }}
          </p>
        </div>
      </div>

      <div
        class="bg-surface border border-border p-6 rounded-3xl flex items-center gap-5 group hover:border-brand/30 transition-all text-primary"
      >
        <div
          class="w-14 h-14 rounded-2xl bg-primary/3 flex items-center justify-center"
        >
          <Layers size="28" />
        </div>
        <div>
          <p
            class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
          >
            Base de Produtos
          </p>
          <p class="text-base font-black uppercase tracking-tight">
            {{ diag.stats.totalProdutos }} Itens Cadastrados
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <!-- Main Content -->
      <div class="xl:col-span-8 space-y-8">
        <!-- Transition rules -->
        <div class="space-y-4">
          <div class="flex items-center gap-2 mb-2 ml-2">
            <div class="w-1.5 h-4 bg-brand rounded-full"></div>
            <h3
              class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
            >
              Regras de Transição (EC 132/23)
            </h3>
          </div>

          <div
            class="bg-surface border border-border rounded-[2rem] p-8 space-y-8 overflow-hidden relative"
          >
            <div
              class="flex flex-col md:flex-row justify-between items-start gap-6"
            >
              <div class="space-y-2 max-w-xl">
                <div class="flex items-center gap-3">
                  <h4
                    class="text-lg font-black uppercase tracking-tight text-primary"
                  >
                    Reforma Tributária 2026
                  </h4>
                  <span
                    v-if="settings.reforma2026"
                    class="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded-lg tracking-widest border border-emerald-500/20 uppercase"
                    >Ativo</span
                  >
                  <span
                    v-else
                    class="px-2 py-0.5 bg-slate-100 text-slate-400 text-[8px] font-black rounded-lg tracking-widest border border-border uppercase"
                    >Inativo</span
                  >
                </div>
                <p
                  class="text-xs font-bold text-secondary opacity-60 leading-relaxed uppercase tracking-wider"
                >
                  Habilita os novos impostos (CBS e IBS) e as mensagens
                  informativas obrigatórias em todos os documentos fiscais
                  emitidos.
                </p>
              </div>
              <BaseToggle v-model="settings.reforma2026" :disabled="!isAdmin" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                class="p-6 bg-primary/2 border border-border rounded-2xl space-y-2 group hover:border-brand/30 transition-all"
              >
                <div class="flex items-center gap-2">
                  <TrendingUp size="16" class="text-brand" />
                  <span
                    class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40"
                    >Projeção CBS (Federal)</span
                  >
                </div>
                <div class="flex items-baseline gap-2">
                  <p class="text-3xl font-black text-primary">0,9</p>
                  <span class="text-xs font-black text-secondary">%</span>
                </div>
              </div>
              <div
                class="p-6 bg-primary/2 border border-border rounded-2xl space-y-2 group hover:border-emerald-500/30 transition-all"
              >
                <div class="flex items-center gap-2">
                  <TrendingDown size="16" class="text-emerald-500" />
                  <span
                    class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40"
                    >Projeção IBS (Estados/Municípios)</span
                  >
                </div>
                <div class="flex items-baseline gap-2">
                  <p class="text-3xl font-black text-primary">0,1</p>
                  <span class="text-xs font-black text-secondary">%</span>
                </div>
              </div>
            </div>

            <div
              class="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-4"
            >
              <Info size="18" class="text-amber-500 mt-1 shrink-0" />
              <p
                class="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-relaxed"
              >
                A fase de transição inicia-se em 01/01/2026. A ativação afetará
                apenas o cálculo de impostos de novos orçamentos e notas.
              </p>
            </div>
          </div>
        </div>

        <!-- Automation / Actions -->
        <div class="space-y-4">
          <div class="flex items-center gap-2 mb-2 ml-2">
            <div class="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
            <h3
              class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
            >
              Automação e Saneamento
            </h3>
          </div>

          <div
            class="bg-surface border border-border rounded-[2rem] p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center"
                >
                  <Database size="20" />
                </div>
                <h4
                  class="text-base font-black uppercase tracking-tight text-primary"
                >
                  Correção de NCM em Massa
                </h4>
              </div>
              <p
                class="text-xs font-bold text-secondary opacity-60 leading-relaxed uppercase tracking-wider"
              >
                Sincronize o código NCM de todos os produtos ativos para evitar
                erros de validação na SEFAZ.
              </p>
              <div class="flex flex-wrap gap-2 pt-2">
                <span
                  class="px-2 py-1 bg-primary/3 text-secondary text-[8px] font-black rounded-md border border-border uppercase"
                  >IBPT Automático</span
                >
                <span
                  class="px-2 py-1 bg-primary/3 text-secondary text-[8px] font-black rounded-md border border-border uppercase"
                  >Validação SEFAZ</span
                >
              </div>
            </div>

            <div class="space-y-4">
              <div class="space-y-2">
                <div class="flex items-center gap-2 ml-2">
                  <label
                    class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
                    >NCM Alvo (Concreto)</label
                  >
                  <BaseTooltip text="Código NCM padrão para concreto usinado.">
                    <HelpCircle
                      size="12"
                      class="text-secondary opacity-40 cursor-help"
                    />
                  </BaseTooltip>
                </div>
                <BaseInput
                  v-model="importNcm"
                  placeholder="38245000"
                  :icon="FileText"
                />
              </div>
              <button
                @click="doImport"
                :disabled="importing || !isAdmin"
                class="w-full bg-emerald-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 disabled:grayscale disabled:opacity-50"
              >
                <Download v-if="!importing" size="18" />
                <RefreshCw v-else size="18" class="animate-spin" />
                {{ importing ? "Processando" : "Aplicar Sincronização" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Sidebar -->
      <div class="xl:col-span-4 space-y-6">
        <!-- Integration Shortcut -->
        <NuxtLink
          to="/configuracoes/nuvemfiscal"
          class="block bg-primary p-8 rounded-[2rem] text-background space-y-6 shadow-2xl shadow-primary/20 relative overflow-hidden group"
        >
          <div
            class="absolute -right-10 -bottom-10 text-white/5 group-hover:scale-110 transition-transform duration-[2s] pointer-events-none"
          >
            <Cloud size="220" />
          </div>

          <div class="relative z-10 space-y-6">
            <div class="p-4 bg-white/10 rounded-2xl w-fit">
              <Cloud size="24" class="text-brand" />
            </div>

            <div class="space-y-2">
              <h4
                class="text-xl font-black uppercase tracking-tighter leading-none"
              >
                Nuvem Fiscal
              </h4>
              <p
                class="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-relaxed"
              >
                Gerencie suas chaves de API, certificados e credenciais de
                emissão.
              </p>
            </div>

            <div
              class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all"
            >
              Configurar Integração
              <ArrowRight size="14" />
            </div>
          </div>
        </NuxtLink>

        <!-- Rules Info -->
        <div
          class="bg-surface border border-border p-8 rounded-[2rem] space-y-6 group"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center"
            >
              <ShieldCheck size="20" />
            </div>
            <h4
              class="text-xs font-black uppercase tracking-widest text-primary"
            >
              Regras Geográficas
            </h4>
          </div>

          <div class="space-y-4">
            <div
              class="p-4 bg-primary/2 border border-border rounded-2xl flex items-center justify-between group-hover:border-brand/30 transition-all"
            >
              <span class="text-[11px] font-black text-primary uppercase"
                >São Paulo</span
              >
              <div
                class="px-2 py-0.5 bg-brand text-background text-[8px] font-black rounded-md tracking-widest uppercase"
              >
                SP806342
              </div>
            </div>
            <div
              class="p-4 bg-primary/2 border border-border rounded-2xl flex items-center justify-between group-hover:border-brand/30 transition-all"
            >
              <span class="text-[11px] font-black text-primary uppercase"
                >Paraná</span
              >
              <div
                class="px-2 py-0.5 bg-brand text-background text-[8px] font-black rounded-md tracking-widest uppercase"
              >
                PR850001
              </div>
            </div>
          </div>

          <p
            class="text-[9px] font-bold text-secondary opacity-40 uppercase tracking-widest leading-relaxed italic"
          >
            O sistema seleciona automaticamente o benefício fiscal com base no
            endereço da obra, otimizando a carga tributária.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  Cloud,
  ShieldCheck,
  Save,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Download,
  Activity,
  AlertTriangle,
  Layers,
  Info,
  FileText,
  HelpCircle,
  Database,
  ArrowRight,
  Sparkles,
} from "lucide-vue-next";
import { useAuth } from "@/composables/useAuth";
import { useToast } from "@/composables/useToast";

const { user } = useAuth();
const { add: addToast } = useToast();

const isAdmin = computed(() => user.value?.admin === 1);
const loading = ref(false);
const importing = ref(false);
const importNcm = ref("38245000");
const diag = ref(null);
const settings = ref({
  reforma2026: true,
  ambiente: "homologacao",
});

const fetchSettings = async () => {
  try {
    const [settingsData, diagData] = await Promise.all([
      $fetch("/api/configuracoes/fiscal-geral"),
      $fetch("/api/gestao/fiscal/diagnostico"),
    ]);
    settings.value = settingsData;
    diag.value = diagData;
  } catch (error) {
    addToast(
      { title: "Erro", description: "Erro ao carregar dados fiscais" },
      "error",
    );
  }
};

const saveSettings = async () => {
  if (!isAdmin.value) return;
  loading.value = true;
  try {
    await $fetch("/api/configuracoes/fiscal-geral", {
      method: "POST",
      body: settings.value,
    });
    addToast(
      { title: "Sucesso", description: "Configurações fiscais atualizadas" },
      "success",
    );
    await fetchSettings();
  } catch (error) {
    addToast({ title: "Erro", description: "Erro ao salvar" }, "error");
  } finally {
    loading.value = false;
  }
};

const doImport = async () => {
  if (!isAdmin.value) return;
  if (importNcm.value.length < 8) {
    addToast({ title: "Erro", description: "NCM inválido" }, "error");
    return;
  }

  if (
    !confirm(
      "Deseja realmente aplicar este NCM a todos os produtos? Esta ação não pode ser desfeita.",
    )
  )
    return;

  importing.value = true;
  try {
    await $fetch("/api/gestao/fiscal/importar-ncms", {
      method: "POST",
      body: { ncm: importNcm.value.replace(/\D/g, ""), applyAll: true },
    });
    addToast(
      {
        title: "Sucesso",
        description: "Todos os produtos atualizados com sucesso",
      },
      "success",
    );
    await fetchSettings();
  } catch (error) {
    addToast({ title: "Erro", description: "Erro ao importar dados" }, "error");
  } finally {
    importing.value = false;
  }
};

onMounted(fetchSettings);

definePageMeta({
  name: "Centro Fiscal",
  middleware: ["admin"],
});
</script>
