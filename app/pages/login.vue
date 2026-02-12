<template>
  <div
    class="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-brand/20"
  >
    <!-- Left Side: Visual & Brand (Visible on LG up) -->
    <div
      class="hidden lg:flex lg:w-1/2 relative bg-surface overflow-hidden items-center justify-center p-12 border-r border-border"
    >
      <!-- Background Gradients & Texture -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        <div
          class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,122,61,0.12),transparent_50%)]"
        />
        <div
          class="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_50%)]"
        />
        <!-- Noise Texture Pattern -->
        <div
          class="absolute inset-0 opacity-[0.02]"
          style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E');"
        />
      </div>

      <!-- Content -->
      <div class="relative z-10 w-full max-w-lg">
        <div
          class="mb-12 animate-in fade-in slide-in-from-left-10 duration-1000"
        >
          <div
            class="inline-flex items-center justify-center w-20 h-20 bg-brand rounded-[2rem] shadow-2xl shadow-brand/20 mb-8 transform hover:rotate-6 transition-transform duration-500"
          >
            <AppLogo size="xl" class="text-white" />
          </div>
          <h1
            class="text-primary text-6xl font-black tracking-tighter leading-tight mb-4 uppercase"
          >
            Gestão de<br /><span class="text-brand">Concreto</span>
          </h1>
          <p
            class="text-secondary text-lg font-medium leading-relaxed max-w-md"
          >
            O hardware é o corpo, o software é mente. <br />
            Inteligência operacional para concreteiras modernas.
          </p>
        </div>

        <!-- Stats Grid -->
        <div
          class="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300"
        >
          <StatCard
            v-for="stat in statsData"
            :key="stat.label"
            :icon="stat.icon"
            :label="stat.label"
            :value="stat.value"
            :sublabel="stat.sublabel"
            :color="stat.color"
          />
        </div>
      </div>

      <!-- Bottom Branding -->
      <div
        class="absolute bottom-12 left-12 flex items-center gap-3 opacity-20 hover:opacity-100 transition-opacity cursor-default animate-in fade-in duration-1000 delay-500"
      >
        <div
          class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"
        >
          <Activity size="14" class="text-primary" />
        </div>
        <span
          class="text-primary text-[10px] font-black uppercase tracking-[0.2em]"
        >
          SISTEMA MEU CONCRETO OS
        </span>
      </div>
    </div>

    <!-- Right Side: Auth Form -->
    <div class="flex-1 flex flex-col relative bg-background">
      <!-- Theme Toggle -->
      <div class="absolute top-6 right-6 z-50">
        <button
          @click="toggleTheme"
          class="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-secondary hover:text-brand transition-all shadow-sm group"
          aria-label="Alternar tema"
        >
          <Sun
            v-if="colorMode.value === 'dark'"
            size="20"
            class="group-hover:rotate-45 transition-transform"
          />
          <Moon
            v-else
            size="20"
            class="group-hover:-rotate-12 transition-transform"
          />
        </button>
      </div>

      <div class="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-md space-y-10">
          <!-- Mobile Header -->
          <div class="lg:hidden text-center">
            <div
              class="inline-flex items-center justify-center w-16 h-16 bg-brand rounded-2xl shadow-xl shadow-brand/20 mb-6"
            >
              <AppLogo size="lg" class="text-white" />
            </div>
            <h1
              class="text-primary text-3xl font-black tracking-tighter uppercase leading-none"
            >
              Meu Concreto
            </h1>
          </div>

          <!-- Auth Header -->
          <div class="space-y-2 animate-in slide-in-from-right-10 duration-700">
            <h2
              class="text-4xl font-black text-primary tracking-tighter uppercase"
            >
              Painel de Acesso
            </h2>
            <p class="text-secondary/60 text-sm font-bold">
              Identifique-se para gerenciar a operação.
            </p>
          </div>

          <!-- Error Alert -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div
              v-if="error"
              class="p-5 bg-danger/10 text-danger rounded-3xl text-[11px] border border-danger/20 font-black text-center uppercase tracking-widest"
            >
              {{ error }}
            </div>
          </Transition>

          <!-- Form -->
          <form
            @submit.prevent="handleLogin"
            class="space-y-6 animate-in slide-in-from-right-20 duration-1000 delay-100"
            :class="{ 'animate-shake': shake }"
          >
            <div class="space-y-5">
              <!-- Username Field -->
              <div
                class="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
              >
                <label
                  class="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2"
                >
                  Identificação <span class="text-brand">*</span>
                </label>
                <BaseInput
                  ref="usernameInput"
                  v-model="form.username"
                  type="text"
                  :icon="User"
                  placeholder="E-mail ou Usuário"
                  required
                />
              </div>

              <!-- Password Field -->
              <div
                class="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
              >
                <label
                  class="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2"
                >
                  Senha Secreta <span class="text-brand">*</span>
                </label>
                <BaseInput
                  ref="passwordInput"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  :icon="Lock"
                  placeholder="••••••••"
                  required
                >
                  <template #suffix>
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="text-secondary/30 hover:text-brand transition-all"
                      :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                    >
                      <Eye v-if="!showPassword" size="18" />
                      <EyeOff v-else size="18" />
                    </button>
                  </template>
                </BaseInput>
              </div>
            </div>

            <div class="flex items-center justify-between px-1">
              <BaseCheckbox
                v-model="form.rememberMe"
                label="Permanecer conectado"
                size="sm"
              />
              <NuxtLink
                to="/forgot-password"
                class="text-[11px] font-black text-brand uppercase tracking-widest hover:brightness-110 transition-all"
              >
                Esqueci a senha
              </NuxtLink>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="group relative w-full py-5 bg-brand text-white rounded-2xl font-black text-sm uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div
                class="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"
              />
              <span
                v-if="loading"
                class="flex items-center justify-center gap-3"
              >
                <RefreshCw class="w-5 h-5 animate-spin" />
                Autenticando...
              </span>
              <span v-else>Entrar no Sistema</span>
            </button>
          </form>

          <!-- Divider -->
          <div class="pt-6 flex items-center gap-4 text-secondary/10">
            <div class="flex-1 h-px bg-current" />
            <div class="w-2 h-2 rounded-full bg-current" />
            <div class="flex-1 h-px bg-current" />
          </div>

          <!-- Footer -->
          <footer
            class="flex flex-col md:flex-row items-center justify-between gap-4 opacity-40 hover:opacity-100 transition-opacity"
          >
            <p
              class="text-[9px] font-black uppercase tracking-[0.2em] text-secondary"
            >
              &copy; 2026 Meu Concreto OS
            </p>
            <div class="flex items-center gap-3">
              <div class="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span
                class="text-[9px] font-black uppercase tracking-[0.2em] text-secondary"
              >
                Servidores Online
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
});

import { ref, reactive, onMounted, computed } from "vue";
import { navigateTo, useColorMode } from "#imports";
import {
  User,
  Lock,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Activity,
  RefreshCw,
  Truck,
  Target,
  Users,
} from "lucide-vue-next";
import { useToast } from "~/composables/useToast";
import { useLogger } from "~/composables/useLogger";

const colorMode = useColorMode();
const toggleTheme = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};

const form = reactive({
  username: "",
  password: "",
  rememberMe: false,
});

const { add: addToast } = useToast();
const { info, error: logError } = useLogger();
const loading = ref(false);
const error = ref("");
const showPassword = ref(false);
const shake = ref(false);
const usernameInput = ref(null);
const passwordInput = ref(null);

// Fetch public stats - client only to avoid SSR/hydration issues
const stats = ref(null);
const statsLoading = ref(true);

const formatVolume = (v) => {
  if (!v || v === 0) return "0 m³";
  if (v >= 1000000) {
    return `${(v / 1000000).toFixed(1)}M m³`;
  }
  if (v >= 1000) {
    return `${Math.floor(v / 1000)}k m³`;
  }
  return `${v} m³`;
};

// Stats data for template - backend returns: volume, clientes, frota, precisao
const statsData = computed(() => [
  {
    icon: Truck,
    label: "Entregas",
    value: statsLoading.value ? "..." : formatVolume(stats.value?.volume ?? 0),
    sublabel: "Volume Total",
    color: "brand",
  },
  {
    icon: Target,
    label: "Precisão",
    value: statsLoading.value ? "..." : `${stats.value?.precisao ?? "0.0"}%`,
    sublabel: "Índice de Acerto",
    color: "success",
  },
  {
    icon: Users,
    label: "Parceiros",
    value: statsLoading.value ? "..." : `${stats.value?.clientes ?? 0}`,
    sublabel: "Clientes Ativos",
    color: "accent",
  },
  {
    icon: Activity,
    label: "Frota",
    value: statsLoading.value ? "..." : `${stats.value?.frota ?? 0}`,
    sublabel: "Equipamentos",
    color: "warning",
  },
]);

// Fetch stats on client side only
onMounted(async () => {
  try {
    const data = await $fetch("/api/public/stats");
    stats.value = data;
  } catch (err) {
    console.error("[Login] Failed to fetch stats:", err);
    stats.value = null;
  } finally {
    statsLoading.value = false;
  }
});

// Restore remembered user
onMounted(() => {
  const remembered = localStorage.getItem("remembered_user");
  if (remembered) {
    form.username = remembered;
    form.rememberMe = true;
    passwordInput.value?.$el?.querySelector('input')?.focus();
  } else {
    usernameInput.value?.$el?.querySelector('input')?.focus();
  }
});

const triggerShake = () => {
  shake.value = true;
  setTimeout(() => {
    shake.value = false;
  }, 500);
};

const handleLogin = async () => {
  error.value = "";

  if (!form.username || !form.password) {
    error.value = "Nome de usuário e senha são obrigatórios.";
    triggerShake();
    return;
  }

  if (form.password.length < 6) {
    error.value = "A senha deve conter no mínimo 6 caracteres por segurança.";
    triggerShake();
    return;
  }

  loading.value = true;
  addToast("Verificando credenciais no servidor...", "info");

  try {
    const response = await $fetch("/api/auth/login", {
      method: "POST",
      body: {
        username: form.username,
        password: form.password,
        rememberMe: form.rememberMe,
      },
    });

    addToast("Acesso autorizado!", "success");
    info("AUTENTICACAO", `Usuário ${form.username} logou com sucesso`);

    const { user: authUser, fetchUser } = useAuth();
    const userData = await fetchUser();

    // Remember me logic
    if (form.rememberMe) {
      localStorage.setItem("remembered_user", form.username);
    } else {
      localStorage.removeItem("remembered_user");
    }

    // Redirect based on company access
    if (userData?.acessoEmpresas && userData.acessoEmpresas.length > 0) {
      navigateTo("/select-company");
    } else {
      navigateTo("/");
    }
  } catch (err) {
    let msg = "Falha na autenticação.";

    if (err.statusCode === 401) {
      msg = "Usuário ou senha incorretos.";
    } else if (err.statusCode === 403) {
      msg = "Acesso não autorizado.";
    } else if (err.data?.message) {
      msg = err.data.message;
    }

    error.value = msg;
    triggerShake();
    form.password = "";
    addToast(msg, "error");
    logError("AUTENTICACAO", `Falha de login: ${form.username}`, {
      error: err.message,
      status: err.statusCode,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
</style>
