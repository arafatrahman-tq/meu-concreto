<template>
  <div
    class="min-h-screen bg-background pb-32 transition-colors duration-500"
  >
    <!-- Header Executivo - Ultra Glassmorphism -->
    <header
      class="sticky top-0 z-50 bg-surface/70 backdrop-blur-2xl border-b border-border px-6 py-6"
    >
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <h1
              class="text-2xl font-black text-primary tracking-tighter uppercase italic leading-none"
            >
              Gestão <span class="text-brand not-italic">LIVE</span>
            </h1>

            <!-- Empresa/Filial Switcher Design -->
            <div
              ref="dropdownTriggerRef"
              @click="toggleDropdown"
              class="mt-4 inline-flex items-center gap-2 pl-3 bg-surface border border-border rounded-2xl p-1 shadow-sm focus-within:ring-2 focus-within:ring-brand/20 transition-all cursor-pointer hover:bg-surface/80"
            >
              <div
                class="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0"
              >
                <Building2 size="16" stroke-width="2.5" />
              </div>
              <div class="relative flex flex-col pr-8 min-w-0">
                <span
                  class="text-[7px] font-black uppercase tracking-[0.2em] text-secondary/40 leading-none mb-1"
                  >Unidade Ativa</span
                >
                <div class="flex items-center gap-1.5">
                  <span
                    class="text-[11px] font-black text-primary max-w-35 truncate"
                  >
                    {{ currentEmpresaLabel }}
                  </span>
                  <ChevronDown
                    size="16"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-secondary/40 pointer-events-none transition-transform duration-300"
                    :class="{ 'rotate-180': isDropdownOpen }"
                  />
                </div>
              </div>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand border border-brand/10 active:scale-95 transition-transform"
          >
            <User size="24" stroke-width="2.5" />
          </button>
        </div>
      </div>
    </header>

    <!-- Dropdown List Teleported (Coerência com BaseSelect) -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0 -translate-y-2"
        enter-to-class="transform scale-100 opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform scale-100 opacity-100 translate-y-0"
        leave-to-class="transform scale-95 opacity-0 -translate-y-2"
      >
        <div
          v-if="isDropdownOpen"
          :style="dropdownStyle"
          class="fixed z-9999 bg-surface/95 border border-border rounded-2xl shadow-2xl overflow-hidden py-2 backdrop-blur-3xl max-h-60 overflow-y-auto no-scrollbar"
        >
          <div
            v-for="emp in availableEmpresas"
            :key="emp.id"
            @click="selectEmpresa(emp.id)"
            class="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all flex items-center justify-between hover:bg-brand/5 group/opt relative"
            :class="[
              selectedEmpresaId === emp.id
                ? 'text-brand bg-brand/3'
                : 'text-secondary hover:text-primary',
            ]"
          >
            <div class="flex items-center gap-3">
              <div
                v-if="selectedEmpresaId === emp.id"
                class="w-1 h-3 rounded-full bg-brand"
              ></div>
              {{ emp.empresa }} {{ emp.filial ? `• ${emp.filial}` : "" }}
            </div>
            <div
              v-if="selectedEmpresaId === emp.id"
              class="w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_10px_#ff7a3d] animate-pulse"
            ></div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Click Outside Overlay -->
    <Teleport to="body">
      <div
        v-if="isDropdownOpen"
        class="fixed inset-0 z-9998"
        @click="isDropdownOpen = false"
      ></div>
    </Teleport>

    <main v-if="data" class="p-6 space-y-10 animate-enter">
      <!-- KPIs Primários - Design de Alta Performance -->
      <div class="grid grid-cols-2 gap-5">
        <!-- Vendas de Hoje -->
        <div
          class="bg-surface p-6 rounded-3xl border border-border shadow-xl shadow-black/2 group active:scale-95 transition-all duration-300"
        >
          <div
            class="w-11 h-11 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
          >
            <TrendingUp size="22" stroke-width="2.5" />
          </div>
          <p
            class="text-[8px] font-black uppercase tracking-[0.2em] text-secondary mb-2"
          >
            Caixa Hoje
          </p>
          <p
            class="text-xl font-black text-primary tracking-tighter"
          >
            {{ formatCurrency(data.stats?.vendasHoje?.valor || 0) }}
          </p>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <span
              class="text-[8px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg uppercase"
            >
              {{ data.stats?.vendasHoje?.qtd || 0 }} Ped
            </span>
            <span
              class="text-[8px] font-black bg-blue-500/10 text-blue-500 px-2 py-1 rounded-lg uppercase"
            >
              {{ data.stats?.vendasHoje?.volume || 0 }}m³
            </span>
          </div>
        </div>

        <!-- Orçamentos Pendentes -->
        <div
          class="bg-surface p-6 rounded-3xl border border-border shadow-xl shadow-black/2 group active:scale-95 transition-all duration-300"
        >
          <div
            class="w-11 h-11 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
          >
            <FileText size="22" stroke-width="2.5" />
          </div>
          <p
            class="text-[8px] font-black uppercase tracking-[0.2em] text-secondary mb-2"
          >
            Pendente
          </p>
          <p
            class="text-xl font-black text-primary tracking-tighter"
          >
            {{ formatCurrency(data.stats?.orcamentosPendentes?.valor || 0) }}
          </p>
          <div class="mt-3">
            <span
              class="text-[8px] font-black bg-amber-500/10 text-amber-500 px-2 py-1 rounded-lg uppercase"
            >
              {{ data.stats?.orcamentosPendentes?.qtd || 0 }} Cotações
            </span>
          </div>
        </div>

        <!-- Frota Ativa -->
        <div
          class="bg-surface p-6 rounded-3xl border border-border shadow-xl shadow-black/2 group active:scale-95 transition-all duration-300"
        >
          <div
            class="w-11 h-11 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
          >
            <Truck size="22" stroke-width="2.5" />
          </div>
          <p
            class="text-[8px] font-black uppercase tracking-[0.2em] text-secondary mb-2"
          >
            Logística
          </p>
          <p
            class="text-xl font-black text-primary tracking-tighter"
          >
            {{ data.stats?.frota?.emRota || 0 }}<span class="text-xs text-secondary/40 font-bold"
              >/{{ data.stats?.frota?.total || 0 }}</span
            >
          </p>
          <p class="text-[8px] font-black text-blue-500 uppercase mt-2">
            Caminhões Ativos
          </p>
        </div>

        <!-- Status Usina Dynamic -->
        <div
          :class="[
            'p-6 rounded-3xl shadow-2xl flex flex-col justify-between transition-all duration-500 group active:scale-95',
            data.stats?.statusUsina === 'OPERACIONAL'
              ? 'bg-brand text-white shadow-brand/30 border border-white/20'
              : 'bg-slate-800 text-slate-400 shadow-slate-900/20 border border-white/5',
          ]"
        >
          <div
            :class="[
              'w-11 h-11 rounded-2xl flex items-center justify-center transition-all',
              data.stats?.statusUsina === 'OPERACIONAL'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-slate-500',
            ]"
          >
            <Zap
              size="22"
              stroke-width="2.5"
              :class="{
                'animate-pulse': data.stats?.statusUsina === 'OPERACIONAL',
              }"
            />
          </div>
          <div>
            <p
              :class="[
                'text-[8px] font-black uppercase tracking-[0.2em] mb-2',
                data.stats?.statusUsina === 'OPERACIONAL'
                  ? 'text-white/60'
                  : 'text-slate-500',
              ]"
            >
              Status Usina
            </p>
            <p class="text-base font-black uppercase italic tracking-tighter">
              {{ data.stats?.statusUsina || "OCIOSA" }}
            </p>
          </div>
        </div>
      </div>

      <!-- Atividade Recente - Estilo Timeline iOS -->
      <section class="space-y-6">
        <div class="flex items-center justify-between px-2">
          <div class="flex items-center gap-3">
            <div class="w-1.5 h-1.5 rounded-full bg-brand"></div>
            <h2
              class="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40"
            >
              Fluxo de Operação
            </h2>
          </div>
          <button
            @click="refresh"
            class="p-2.5 bg-surface rounded-2xl border border-border active:scale-90 transition-all shadow-sm"
          >
            <RefreshCw
              size="14"
              stroke-width="3"
              class="text-brand"
              :class="{ 'animate-spin': pending }"
            />
          </button>
        </div>

        <div class="relative pl-4 space-y-6">
          <!-- Timeline Line -->
          <div
            class="absolute left-5.75 top-2 bottom-2 w-px bg-border"
          ></div>

          <div
            v-for="evento in data.eventos || []"
            :key="evento.id"
            class="relative flex items-start gap-6 group"
          >
            <!-- Timeline Dot/Icon -->
            <div
              :class="[
                'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 z-10 shadow-sm border border-border transition-transform group-hover:scale-110',
                getEventoStyle(evento.tipo).bg,
              ]"
            >
              <component
                :is="getEventoStyle(evento.tipo).icon"
                size="18"
                stroke-width="2.5"
              />
            </div>

            <!-- Event Card -->
            <div
              class="flex-1 bg-surface p-4 rounded-3xl border border-border active:bg-primary/2 transition-colors"
            >
              <div class="flex justify-between items-start mb-1">
                <p
                  class="text-[11px] font-black text-primary uppercase tracking-tight truncate pr-4"
                >
                  {{ evento.orcamento?.nomeCliente }}
                </p>
                <span
                  class="text-[9px] font-black text-secondary/40 uppercase tabular-nums"
                >
                  {{ formatTime(evento.timestamp) }}
                </span>
              </div>
              <p
                class="text-[9px] font-bold text-secondary/40 uppercase tracking-widest mt-1"
              >
                {{ getEventoLabel(evento.tipo) }}
              </p>
            </div>
          </div>

          <!-- Empty State Otimizado -->
          <div
            v-if="!data.eventos?.length"
            class="py-16 text-center bg-surface rounded-3xl border border-dashed border-border"
          >
            <Package
              size="32"
              class="mx-auto mb-3 text-secondary/20"
            />
            <p
              class="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/40"
            >
              Silêncio operacional total
            </p>
          </div>
        </div>
      </section>

      <!-- Logs do Sistema - Estilo Terminal Glass -->
      <section class="space-y-4">
        <h2
          class="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40 px-2"
        >
          Logs do Sistema
        </h2>
        <div
          class="bg-black rounded-3xl border border-white/5 p-6 space-y-6 shadow-2xl"
        >
          <div v-for="log in data.logs || []" :key="log.id" class="flex gap-4">
            <div
              class="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
              :class="
                log.nivel === 'ERROR'
                  ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                  : 'bg-brand shadow-[0_0_10px_rgba(var(--color-brand),0.5)]'
              "
            ></div>
            <div class="flex-1 min-w-0">
              <p
                class="text-[10px] font-bold text-slate-300 uppercase leading-relaxed"
              >
                {{ log.mensagem }}
              </p>
              <div class="flex items-center gap-2 mt-2">
                <span
                  class="text-[8px] font-black text-white/30 uppercase tracking-widest"
                >
                  {{ log.usuario?.nome || "System" }}
                </span>
                <span class="text-[8px] text-white/10"></span>
                <span
                  class="text-[8px] font-black text-white/30 uppercase tabular-nums"
                >
                  {{ formatTime(log.timestamp) }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="!data.logs?.length" class="py-6 text-center opacity-30">
            <p
              class="text-[9px] font-black text-white uppercase tracking-[0.4em]"
            >
              Logs limpos
            </p>
          </div>
        </div>
      </section>
    </main>

    <!-- Skeleton Otimizado -->
    <main v-if="pending && !data" class="p-6 space-y-10 animate-pulse">
      <div class="grid grid-cols-2 gap-5">
        <div
          v-for="i in 4"
          :key="i"
          class="h-40 bg-primary/5 rounded-3xl"
        ></div>
      </div>
      <div class="h-80 bg-primary/5 rounded-3xl"></div>
    </main>

    <!-- Navegação Mobile Inferior - Floating iOS Concept -->
    <div class="fixed bottom-8 left-0 right-0 px-6 z-50 pointer-events-none">
      <nav
        class="max-w-md mx-auto h-20 bg-surface/80 backdrop-blur-3xl border border-border rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center justify-around px-4 pointer-events-auto transition-transform hover:scale-[1.02]"
      >
        <NuxtLink
          to="/"
          class="p-4 text-secondary/40 hover:text-brand transition-all active:scale-90"
        >
          <LayoutDashboard size="24" stroke-width="2.5" />
        </NuxtLink>
        <NuxtLink
          to="/orcamentos"
          class="p-4 text-secondary/40 hover:text-brand transition-all active:scale-90"
        >
          <FileText size="24" stroke-width="2.5" />
        </NuxtLink>

        <!-- Dynamic Action Button -->
        <div class="relative -translate-y-8">
          <div
            class="absolute inset-0 bg-brand blur-2xl opacity-40 animate-pulse"
          ></div>
          <div
            class="w-16 h-16 bg-brand rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-brand/40 border-4 border-background relative z-10 active:scale-90 transition-transform"
          >
            <Activity size="28" stroke-width="2.5" />
          </div>
        </div>

        <NuxtLink
          to="/vendas"
          class="p-4 text-secondary/40 hover:text-brand transition-all active:scale-90"
        >
          <DollarSign size="24" stroke-width="2.5" />
        </NuxtLink>
        <NuxtLink
          to="/clientes"
          class="p-4 text-secondary/40 hover:text-brand transition-all active:scale-90"
        >
          <Users size="24" stroke-width="2.5" />
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import {
  User,
  TrendingUp,
  FileText,
  Truck,
  Zap,
  RefreshCw,
  Package,
  MapPin,
  CheckCircle,
  Clock,
  Activity,
  LayoutDashboard,
  DollarSign,
  Users,
  ChevronDown,
  Building2,
} from "lucide-vue-next";
import { useAuth, useFetch, navigateTo, computed } from "#imports";

definePageMeta({
  layout: false, // Mobile view personalizada
});

const { user, logout } = useAuth();

const selectedEmpresaId = ref(user.value?.idEmpresa);

const isDropdownOpen = ref(false);
const dropdownTriggerRef = ref(null);
const dropdownStyle = ref({});

const toggleDropdown = () => {
  if (!isDropdownOpen.value) {
    const rect = dropdownTriggerRef.value.getBoundingClientRect();
    dropdownStyle.value = {
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    };
  }
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectEmpresa = (id) => {
  selectedEmpresaId.value = id;
  isDropdownOpen.value = false;
};

const availableEmpresas = computed(() => {
  if (!user.value) return [];
  const list = [];
  if (user.value.empresa) {
    list.push(user.value.empresa);
  }
  if (user.value.acessoEmpresas) {
    user.value.acessoEmpresas.forEach((ae) => {
      if (ae.empresa && !list.find((e) => e.id === ae.empresa.id)) {
        list.push(ae.empresa);
      }
    });
  }
  return list;
});

const currentEmpresaLabel = computed(() => {
  const emp = availableEmpresas.value.find(
    (e) => e.id === selectedEmpresaId.value,
  );
  if (!emp) return "Selecione...";
  return `${emp.empresa} ${emp.filial ? `• ${emp.filial}` : ""}`;
});

// Habilitamos SSR para estabilidade e removemos lazy para garantir conteúdo imediato
const { data, pending, refresh } = await useFetch("/api/gestao/live", {
  params: { idEmpresa: selectedEmpresaId },
  watch: [selectedEmpresaId],
  server: true,
});

const handleLogout = async () => {
  if (confirm("Deseja realmente sair?")) {
    await logout();
    navigateTo("/login");
  }
};

onMounted(() => {
  // Auto refresh a cada 30 segundos
  const dataTimer = setInterval(refresh, 30000);
  onUnmounted(() => {
    clearInterval(dataTimer);
  });
});

const formatCurrency = (val) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val / 100);
};

const formatTime = (date) => {
  if (!date) return "--:--";
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getEventoLabel = (tipo) => {
  const labels = {
    SAIDA_USINA: "Caminhão saiu da usina",
    CHEGADA_OBRA: "Chegada na obra",
    INICIO_DESCARGA: "Início da descarga",
    FIM_DESCARGA: "Descarregamento finalizado",
    RETORNO_USINA: "Retornando para usina",
  };
  return labels[tipo] || tipo;
};

const getEventoStyle = (tipo) => {
  const styles = {
    SAIDA_USINA: { bg: "bg-blue-500/10 text-blue-500", icon: Truck },
    CHEGADA_OBRA: { bg: "bg-amber-500/10 text-amber-500", icon: MapPin },
    INICIO_DESCARGA: {
      bg: "bg-emerald-500/10 text-emerald-500",
      icon: Activity,
    },
    FIM_DESCARGA: {
      bg: "bg-emerald-500/10 text-emerald-500",
      icon: CheckCircle,
    },
    RETORNO_USINA: { bg: "bg-slate-500/10 text-slate-500", icon: Clock },
  };
  return (
    styles[tipo] || { bg: "bg-slate-500/10 text-slate-500", icon: Package }
  );
};
</script>

<style scoped>
.animate-enter {
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Otimização de toque: remove delay em dispositivos móveis */
* {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Custom Scrollbar escondida para manter o look nativo app */
::-webkit-scrollbar {
  display: none;
}
</style>
