<template>
  <div
    class="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden font-sans selection:bg-brand/20"
  >
    <!-- Left Side: Visual & Brand (Visible on LG up) -->
    <div
      class="hidden lg:flex lg:w-1/2 relative bg-neutral-900 overflow-hidden items-center justify-center p-12 border-r border-white/5"
    >
      <!-- Background Concrete Texture & Gradients -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        <div
          class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,92,0,0.15),transparent_50%)]"
        ></div>
        <div
          class="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"
        ></div>
        <div
          class="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style="
            background-image: url(&quot;https://www.transparenttextures.com/patterns/concrete-wall.png&quot;);
          "
        ></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 w-full max-w-lg">
        <div
          class="mb-12 animate-in fade-in slide-in-from-left-10 duration-1000"
        >
          <div
            class="inline-flex items-center justify-center w-20 h-20 bg-brand rounded-[2rem] shadow-2xl shadow-brand/20 mb-8 transform hover:rotate-6 transition-transform duration-500"
          >
            <svg
              viewBox="0 0 100 100"
              class="w-12 h-12 text-white fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15 45h50v20h-50z" opacity="0.8" />
              <path d="M65 47h18l4 8v10h-22z" />
              <path d="M22 35c0-10 40-10 40 0l-5 18c0 5-30 5-30 0z" />
              <path
                d="M30 38l25 6"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                opacity="0.5"
              />
              <circle cx="28" cy="70" r="7" />
              <circle cx="48" cy="70" r="7" />
              <circle cx="75" cy="70" r="7" />
              <path d="M68 50h8l2 5h-10z" fill="white" opacity="0.3" />
            </svg>
          </div>
          <h1
            class="text-white text-6xl font-black tracking-tighter leading-tight mb-4 uppercase"
          >
            Gestão de<br /><span class="text-brand">Concreto</span>
          </h1>
          <p
            class="text-neutral-400 text-lg font-medium leading-relaxed max-w-md"
          >
            O hardware é o corpo, o software é mente. <br />
            Inteligência operacional para concreteiras modernas.
          </p>
        </div>

        <!-- Stats Grid (Subtle) -->
        <div
          class="grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300"
        >
          <div
            class="p-6 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/15 transition-colors cursor-default"
          >
            <p
              class="text-[10px] font-black uppercase tracking-[0.2em] text-brand mb-1"
            >
              Entregas
            </p>
            <p class="text-2xl font-black text-white">+500k m³</p>
          </div>
          <div
            class="p-6 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/15 transition-colors cursor-default"
          >
            <p
              class="text-[10px] font-black uppercase tracking-[0.2em] text-brand mb-1"
            >
              Precisão
            </p>
            <p class="text-2xl font-black text-white">99.8%</p>
          </div>
        </div>
      </div>

      <!-- Bottom Branding -->
      <div
        class="absolute bottom-12 left-12 flex items-center gap-3 opacity-20 hover:opacity-100 transition-opacity cursor-default animate-in fade-in duration-1000 delay-500"
      >
        <div
          class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"
        >
          <Activity size="14" class="text-white" />
        </div>
        <span
          class="text-white text-[10px] font-black uppercase tracking-[0.2em]"
          >SISTEMA MEU CONCRETO OS</span
        >
      </div>
    </div>

    <!-- Right Side: Auth Form -->
    <div class="flex-1 flex flex-col relative bg-background">
      <!-- Theme Toggle & Help -->
      <div class="absolute top-8 right-8 flex items-center gap-4 z-50">
        <button
          @click="toggleTheme"
          class="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-secondary hover:text-brand transition-all shadow-sm group"
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

      <div class="flex-1 flex items-center justify-center p-8 lg:p-24">
        <div class="w-full max-w-md space-y-12">
          <!-- Mobile Header (Visible on small screens) -->
          <div class="lg:hidden text-center scale-90">
            <div
              class="inline-flex items-center justify-center w-16 h-16 bg-brand rounded-2xl shadow-xl shadow-brand/20 mb-6"
            >
              <svg
                viewBox="0 0 100 100"
                class="w-10 h-10 text-white fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M15 45h50v20h-50z" opacity="0.8" />
                <path d="M65 47h18l4 8v10h-22z" />
                <path d="M22 35c0-10 40-10 40 0l-5 18c0 5-30 5-30 0z" />
                <circle cx="28" cy="70" r="7" />
                <circle cx="48" cy="70" r="7" />
                <circle cx="75" cy="70" r="7" />
              </svg>
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
          <div
            v-if="error"
            class="p-5 bg-rose-500/10 text-rose-500 rounded-3xl text-[11px] border border-rose-500/20 font-black text-center animate-in shake-1 uppercase tracking-widest"
          >
            {{ error }}
          </div>

          <!-- Form -->
          <form
            @submit.prevent="handleLogin"
            class="space-y-8 animate-in slide-in-from-right-20 duration-1000 delay-100"
            :class="{ 'animate-shake': shake }"
          >
            <div class="space-y-6">
              <div
                class="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
              >
                <label
                  class="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2"
                  >Identificação <span class="text-brand">*</span></label
                >
                <div class="relative group">
                  <User
                    class="absolute left-6 top-1/2 -translate-y-1/2 text-secondary/30 group-focus-within:text-brand transition-all"
                    size="18"
                  />
                  <input
                    ref="usernameInput"
                    v-model="form.username"
                    type="text"
                    class="w-full pl-16 pr-6 py-5 bg-primary/2 border border-border rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand/30 focus:bg-surface transition-all font-bold placeholder:text-secondary/20 text-sm outline-none text-primary"
                    placeholder="E-mail ou Usuário"
                    required
                  />
                </div>
              </div>

              <div
                class="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
              >
                <label
                  class="block text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2"
                  >Senha Secreta <span class="text-brand">*</span></label
                >
                <div class="relative group">
                  <Lock
                    class="absolute left-6 top-1/2 -translate-y-1/2 text-secondary/30 group-focus-within:text-brand transition-all"
                    size="18"
                  />
                  <input
                    ref="passwordInput"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="w-full pl-16 pr-14 py-5 bg-primary/2 border border-border rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand/30 focus:bg-surface transition-all font-bold placeholder:text-secondary/20 text-sm outline-none text-primary"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-6 top-1/2 -translate-y-1/2 text-secondary/30 hover:text-brand transition-all"
                  >
                    <Eye v-if="!showPassword" size="18" />
                    <EyeOff v-else size="18" />
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between px-1">
              <label class="flex items-center space-x-3 cursor-pointer group">
                <div class="relative flex items-center justify-center">
                  <input
                    v-model="form.rememberMe"
                    type="checkbox"
                    class="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-border bg-primary/2 transition-all checked:bg-brand checked:border-brand"
                  />
                  <span
                    class="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                  >
                    <Check class="h-3 w-3" stroke-width="4" />
                  </span>
                </div>
                <span
                  class="text-[11px] font-black text-secondary uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity"
                  >Permanecer</span
                >
              </label>
              <NuxtLink
                to="/forgot-password"
                class="text-[11px] font-black text-brand uppercase tracking-widest hover:brightness-110 transition-all"
                >Esqueci a senha</NuxtLink
              >
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="group relative w-full py-6 bg-brand text-white rounded-2xl font-black text-sm uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-brand/20 disabled:opacity-50"
            >
              <div
                class="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"
              ></div>
              <span
                v-if="loading"
                class="flex items-center justify-center gap-3"
              >
                <RefreshCw class="w-5 h-5 animate-spin" />
                AUTENTICANDO...
              </span>
              <span v-else>Entrar no Sistema</span>
            </button>
          </form>

          <!-- Divider -->
          <div class="pt-8 flex items-center gap-4 text-secondary/10">
            <div class="flex-1 h-px bg-current"></div>
            <div class="w-2 h-2 rounded-full bg-current"></div>
            <div class="flex-1 h-px bg-current"></div>
          </div>

          <!-- Bottom Footer -->
          <footer
            class="flex flex-col md:flex-row items-center justify-between gap-4 opacity-40 hover:opacity-100 transition-opacity"
          >
            <p
              class="text-[9px] font-black uppercase tracking-[0.2em] text-secondary"
            >
              &copy; 2026 MEU CONCRETO OS
            </p>
            <div class="flex items-center gap-3">
              <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span
                class="text-[9px] font-black uppercase tracking-[0.2em] text-secondary"
                >SERVIDORES ONLINE</span
              >
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
import { ref, reactive, onMounted } from "vue";
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
  Check,
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
const { user: authUser, fetchUser } = useAuth();

const usernameInput = ref(null);
const passwordInput = ref(null);

// Recuperar usuário lembrado se houver
onMounted(() => {
  const remembered = localStorage.getItem("remembered_user");
  if (remembered) {
    form.username = remembered;
    form.rememberMe = true;
    passwordInput.value?.focus();
  } else {
    usernameInput.value?.focus();
  }
});

const triggerShake = () => {
  shake.value = true;
  setTimeout(() => {
    shake.value = false;
  }, 500);
};

const handleLogin = async () => {
  if (!form.username || !form.password) {
    addToast("Nome de usuário e senha são obrigatórios para acesso.", "error");
    triggerShake();
    return;
  }

  if (form.password.length < 6) {
    addToast(
      "A senha deve conter no mínimo 6 caracteres por segurança.",
      "error",
    );
    triggerShake();
    return;
  }

  loading.value = true;
  error.value = "";

  // Notificação de processamento (Info)
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

    addToast("Acesso autorizado! Iniciando sessão...", "success");
    info("AUTENTICACAO", `Usuário ${form.username} logou com sucesso`);

    // Atualizar estado global do usuário
    const userData = await fetchUser();

    // Lógica do Remember-me
    if (form.rememberMe) {
      localStorage.setItem("remembered_user", form.username);
    } else {
      localStorage.removeItem("remembered_user");
    }

    // Se o usuário tiver acesso a mais de uma empresa, redireciona para seleção
    if (userData?.acessoEmpresas && userData.acessoEmpresas.length > 0) {
      navigateTo("/select-company");
    } else {
      navigateTo("/");
    }
  } catch (err) {
    let msg = "Falha na autenticação corporativa.";

    if (err.statusCode === 401) {
      msg = "Usuário ou senha incorretos. Por favor, tente novamente.";
    } else if (err.statusCode === 403) {
      msg = "Este usuário não tem permissão para acessar o sistema.";
    } else if (err.data?.message) {
      msg = err.data.message;
    } else if (
      err.data?.statusMessage &&
      err.data.statusMessage !== "Internal Server Error"
    ) {
      msg = err.data.statusMessage;
    }

    error.value = msg;
    triggerShake();
    form.password = "";
    addToast(msg, "error");
    logError(
      "AUTENTICACAO",
      `Falha de login para o usuário: ${form.username}`,
      {
        error: err.message,
        status: err.statusCode,
      },
    );
  } finally {
    loading.value = false;
  }
};

const handleForgotPassword = () => {
  alert(
    "Portal de Recuperação: Por favor, entre em contato com o administrador da sua unidade.",
  );
};
</script>

<style>
@keyframes pulse-slow {
  0%,
  100% {
    transform: scale(1.05);
  }

  50% {
    transform: scale(1.1);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 20s ease-in-out infinite;
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
</style>
