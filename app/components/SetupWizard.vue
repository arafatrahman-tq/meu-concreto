<template>
  <Transition
    enter-active-class="transition duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
    enter-from-class="opacity-0 translate-y-12 scale-95 rotate-1"
    enter-to-class="opacity-100 translate-y-0 scale-100 rotate-0"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="isVisible && user?.admin === 1 && status && status.percentage < 100"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-hidden"
    >
      <!-- Backdrop (Industrial Blur) -->
      <div
        class="absolute inset-0 bg-primary/20 backdrop-blur-md"
        @click="closeModal"
      ></div>

      <!-- Modal Content -->
      <div
        class="relative w-full max-w-5xl bg-surface border-2 border-primary/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] lg:max-h-[90vh]"
      >
        <!-- Top Industrial Pattern (Hazard Stripes) -->
        <div class="h-1.5 w-full flex overflow-hidden opacity-40 shrink-0">
          <div
            v-for="i in 40"
            :key="i"
            class="w-8 h-full skew-x-[-45deg] bg-brand mx-2"
          ></div>
        </div>

        <!-- Background Pattern (Industrial Grid) -->
        <div
          class="absolute inset-x-0 top-0 h-64 opacity-5 pointer-events-none overflow-hidden"
        >
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <!-- Header -->
        <div
          class="p-8 pb-6 border-b-2 border-primary/5 bg-primary/2 relative overflow-hidden"
        >
          <!-- Corner Accent -->
          <div
            class="absolute top-0 right-0 w-32 h-32 bg-brand/5 rotate-45 translate-x-16 -translate-y-16"
          ></div>

          <div
            class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-4">
                <div
                  class="w-12 h-12 flex items-center justify-center bg-brand text-white shadow-xl shadow-brand/20 relative"
                  style="clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)"
                >
                  <Zap size="24" class="fill-current -ml-1" />
                </div>
                <div>
                  <h2
                    class="text-3xl font-black text-primary tracking-tighter leading-none"
                  >
                    Ativação do Sistema
                  </h2>
                  <div class="flex items-center gap-2 mt-1">
                    <span
                      class="w-2 h-2 rounded-full bg-brand animate-pulse"
                    ></span>
                    <span
                      class="text-[10px] font-black uppercase tracking-[0.2em] text-brand"
                      >Industrial Strength Operations</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-end gap-1 group">
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <span
                    class="block text-[9px] font-black uppercase text-secondary/40 tracking-widest"
                    >Readiness Level</span
                  >
                  <span
                    class="text-5xl font-black text-primary tracking-tighter tabular-nums"
                    >{{ status.percentage
                    }}<span class="text-xl text-brand">%</span></span
                  >
                </div>
                <div
                  class="w-1.5 h-16 bg-primary/5 rounded-full overflow-hidden border border-border flex flex-col justify-end"
                >
                  <div
                    class="w-full bg-brand transition-all duration-1000 ease-out"
                    :style="{ height: `${status.percentage}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div
          class="flex-1 overflow-y-auto p-10 custom-scrollbar bg-background/50"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="(step, index) in status.steps"
              :key="index"
              @click="handleNavigate(step.path)"
              class="group/step relative p-6 bg-surface border-2 transition-all cursor-pointer flex flex-col gap-4 shadow-sm"
              :class="[
                step.status === 'completed'
                  ? 'border-emerald-500/20 grayscale hover:grayscale-0 opacity-70 hover:opacity-100'
                  : 'border-primary/5 hover:border-brand/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/5',
              ]"
            >
              <!-- Index Number Background -->
              <span
                class="absolute top-2 right-4 text-6xl font-black text-primary/5 select-none tracking-tighter italic"
              >
                0{{ index + 1 }}
              </span>

              <div
                class="w-10 h-10 flex items-center justify-center shrink-0 transition-all group-hover/step:rotate-12"
                :class="
                  step.status === 'completed'
                    ? 'bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-500/20'
                    : 'bg-primary/5 text-primary rounded-none border-l-4 border-brand font-black'
                "
              >
                <Check
                  v-if="step.status === 'completed'"
                  size="18"
                  stroke-width="3"
                />
                <span v-else class="text-sm">0{{ index + 1 }}</span>
              </div>

              <div class="flex-1 space-y-2 relative">
                <div class="flex items-center justify-between gap-2">
                  <h3
                    class="font-black text-sm uppercase tracking-tight leading-none"
                    :class="
                      step.status === 'completed'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-primary'
                    "
                  >
                    {{ step.title }}
                  </h3>
                  <ArrowUpRight
                    v-if="step.status !== 'completed'"
                    size="16"
                    class="text-brand opacity-0 group-hover/step:opacity-100 -translate-x-2 group-hover/step:translate-x-0 transition-all"
                  />
                </div>
                <p
                  class="text-xs text-secondary/70 font-bold leading-snug pr-4"
                >
                  {{ step.description }}
                </p>

                <!-- Technical Stats Tag -->
                <div
                  v-if="step.stats"
                  class="inline-flex items-center px-2 py-0.5 bg-brand/10 border border-brand/20 rounded-none text-[8px] font-black uppercase text-brand tracking-widest"
                >
                  DATA: {{ step.stats }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="p-8 py-6 border-t-2 border-primary/5 bg-primary/2 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div class="flex items-center gap-8">
            <BaseCheckbox
              v-model="dontShowAgain"
              label="Ignorar nas próximas sessões"
              size="sm"
            />

            <button
              @click="refreshStatus"
              class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-secondary/40 hover:text-brand transition-all"
            >
              <RefreshCw size="14" :class="{ 'animate-spin': loading }" />
              SYNC STATUS
            </button>
          </div>

          <button
            @click="closeModal"
            class="group w-full md:w-auto overflow-hidden relative"
          >
            <div
              class="absolute inset-0 bg-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300"
            ></div>
            <div
              class="relative px-12 py-4 bg-primary text-background text-[11px] font-black uppercase tracking-[0.2em] transition-all group-hover:text-white border-2 border-primary group-hover:border-brand flex items-center justify-center gap-3"
            >
              Continuar Depois
              <div
                class="w-1.5 h-1.5 rounded-full bg-brand group-hover:bg-white transition-colors"
              ></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { Zap, Check, ArrowUpRight, RefreshCw } from "lucide-vue-next";
import { ref, onMounted, watch } from "vue";
import { navigateTo, useAuth } from "#imports";

const props = defineProps({
  idEmpresa: {
    type: [Number, String],
    default: null,
  },
});

const { user } = useAuth();
const status = ref(null);
const loading = ref(false);
const isVisible = ref(false);
const dontShowAgain = ref(false);

// Estado global do Nuxt para controlar se já foi mostrado nesta sessão
const hasShownInSession = useState("wizard_shown_session", () => false);

const fetchStatus = async () => {
  if (!user.value || user.value.admin !== 1) return;

  loading.value = true;
  try {
    const data = await $fetch("/api/dashboard/setup-status", {
      query: { idEmpresa: props.idEmpresa },
    });
    status.value = data;

    // Só mostra se:
    // 1. Não está completo (< 100%)
    // 2. Não houver flag no localStorage (Não mostrar novamente)
    // 3. Ainda não foi mostrado nesta sessão (evitar abrir toda vez que volta pro dashboard)
    const hidden = localStorage.getItem(`hide_wizard_${user.value.id}`);
    if (status.value?.percentage < 100 && !hidden && !hasShownInSession.value) {
      isVisible.value = true;
      hasShownInSession.value = true;
    }
  } catch (err) {
    console.error("Erro ao carregar status de configuração:", err);
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  if (dontShowAgain.value && user.value) {
    localStorage.setItem(`hide_wizard_${user.value.id}`, "true");
  }
  isVisible.value = false;
};

const handleNavigate = (path) => {
  isVisible.value = false;
  navigateTo(path);
};

const refreshStatus = () => fetchStatus();

watch(
  () => props.idEmpresa,
  () => {
    fetchStatus();
  },
);

onMounted(() => {
  fetchStatus();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-secondary-40);
}
</style>
