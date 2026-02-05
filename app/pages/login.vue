<template>
  <div
    class="relative min-h-screen flex items-center justify-center overflow-hidden bg-background font-sans transition-colors duration-500"
  >
    <!-- Background Decorativo -->
    <div class="absolute inset-0 z-0 opacity-40">
      <div
        class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 rounded-full blur-[120px]"
      ></div>
      <div
        class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]"
      ></div>
    </div>

    <!-- Theme Toggle Floating -->
    <div class="absolute top-8 right-8 z-50">
      <button
        @click="toggleTheme"
        class="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-secondary hover:text-brand transition-all shadow-lg shadow-black/5 group"
      >
        <Sun
          v-if="colorMode.preference === 'dark'"
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

    <!-- Floating Content Wrapper -->
    <div class="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
      <!-- Brand Header -->
      <div
        class="mb-10 text-center animate-in fade-in slide-in-from-top-10 duration-1000"
      >
        <div
          class="inline-flex items-center justify-center w-20 h-20 bg-brand rounded-3xl shadow-2xl shadow-brand/20 mb-6 group transition-all hover:rounded-xl hover:scale-105"
        >
          <svg
            viewBox="0 0 100 100"
            class="w-12 h-12 text-white fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <!-- Truck Body -->
            <path d="M15 45h50v20h-50z" opacity="0.8" />
            <path d="M65 47h18l4 8v10h-22z" />
            <!-- Concrete Drum -->
            <path d="M22 35c0-10 40-10 40 0l-5 18c0 5-30 5-30 0z" />
            <path
              d="M30 38l25 6"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              opacity="0.5"
            />
            <!-- Wheels -->
            <circle cx="28" cy="70" r="7" />
            <circle cx="48" cy="70" r="7" />
            <circle cx="75" cy="70" r="7" />
            <!-- Windows -->
            <path d="M68 50h8l2 5h-10z" fill="white" opacity="0.3" />
          </svg>
        </div>
        <h1 class="text-primary text-4xl font-black tracking-tighter mb-2">
          Meu Concreto
        </h1>
        <p
          class="text-secondary/60 text-[10px] font-black uppercase tracking-[0.3em]"
        >
          Operational Intelligence
        </p>
      </div>

      <!-- Login Card -->
      <div
        class="w-full bg-surface p-10 md:p-14 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-border animate-in zoom-in-95 fade-in duration-700 relative overflow-hidden"
      >
        <div
          class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-brand/20 to-transparent"
        ></div>

        <div class="mb-10 text-center">
          <h2
            class="text-2xl font-black tracking-tighter text-primary uppercase"
          >
            Autenticação
          </h2>
          <p class="text-secondary text-sm font-bold mt-2 opacity-60">
            Acesse sua painel de controle
          </p>
        </div>

        <div
          v-if="error"
          class="mb-8 p-5 bg-rose-500/10 text-rose-500 rounded-3xl text-[11px] border border-rose-500/20 font-black text-center animate-in shake-1 uppercase tracking-widest"
        >
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <label
              class="block text-[10px] font-black text-secondary uppercase tracking-[0.15em] ml-5"
              >Usuário / E-mail</label
            >
            <div class="relative group">
              <User
                class="absolute left-6 top-1/2 -translate-y-1/2 text-secondary/30 group-focus-within:text-brand transition-all"
                size="18"
              />
              <input
                v-model="form.username"
                type="text"
                class="w-full pl-16 pr-6 py-4.5 bg-primary/2 border border-border rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand/30 transition-all font-bold placeholder:text-secondary/20 text-[13px] outline-none text-primary"
                placeholder="Ex: usuario.admin"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <label
              class="block text-[10px] font-black text-secondary uppercase tracking-[0.15em] ml-5"
              >Sua Senha</label
            >
            <div class="relative group">
              <Lock
                class="absolute left-6 top-1/2 -translate-y-1/2 text-secondary/30 group-focus-within:text-brand transition-all"
                size="18"
              />
              <input
                v-model="form.password"
                type="password"
                class="w-full pl-16 pr-6 py-4.5 bg-primary/2 border border-border rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand/30 transition-all font-bold placeholder:text-secondary/20 text-[13px] outline-none text-primary"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div class="flex items-center justify-between px-3">
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
              </div>
              <span
                class="text-[11px] font-black text-secondary uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity"
                >Manter Conectado</span
              >
            </label>
            <NuxtLink
              to="/forgot-password"
              class="text-[11px] font-black text-brand uppercase tracking-widest hover:underline"
              >Recuperar Senha</NuxtLink
            >
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-5 bg-brand text-white rounded-xl font-black text-[13px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-3 shadow-2xl shadow-brand/20 disabled:opacity-50"
          >
            <span
              v-if="loading"
              class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"
            ></span>
            {{ loading ? "Sincronizando..." : "Entrar no Sistema" }}
          </button>
        </form>

        <div class="mt-12 flex justify-center">
          <div
            class="flex items-center gap-3 px-6 py-3 bg-primary/2 rounded-full border border-border group cursor-default"
          >
            <div
              class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
            ></div>
            <span
              class="text-[9px] font-black text-secondary opacity-40 uppercase tracking-[0.2em] group-hover:opacity-100 transition-opacity"
              >Servidores Ativos</span
            >
          </div>
        </div>
      </div>

      <footer
        class="mt-12 text-center animate-in fade-in duration-1000 delay-500 opacity-30"
      >
        <p
          class="text-secondary text-[10px] font-black uppercase tracking-[0.3em]"
        >
          &copy; 2026 Meu Concreto • v1.0.0
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
});
import { ref, reactive, onMounted } from "vue";
import { useCookie, navigateTo, useFetch, useColorMode } from "#imports";
import { User, Lock, Sun, Moon } from "lucide-vue-next";
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
const { user: authUser, fetchUser } = useAuth();

// Recuperar usuário lembrado se houver
onMounted(() => {
  const remembered = localStorage.getItem("remembered_user");
  if (remembered) {
    form.username = remembered;
    form.rememberMe = true;
  }
});

const handleLogin = async () => {
  if (!form.username || !form.password) {
    addToast("Nome de usuário e senha são obrigatórios para acesso.", "error");
    return;
  }

  if (form.password.length < 6) {
    addToast(
      "A senha deve conter no mínimo 6 caracteres por segurança.",
      "error",
    );
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
    await fetchUser();

    // Lógica do Remember-me
    if (form.rememberMe) {
      localStorage.setItem("remembered_user", form.username);
    } else {
      localStorage.removeItem("remembered_user");
    }

    navigateTo("/");
  } catch (err) {
    const msg =
      err.data?.statusMessage ||
      err.message ||
      "Falha na autenticação corporativa.";
    error.value = msg;
    addToast(msg, "error");
    logError(
      "AUTENTICACAO",
      `Falha de login para o usuário: ${form.username}`,
      { error: err.message, status: err.statusCode },
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

.animate-pulse-slow {
  animation: pulse-slow 20s ease-in-out infinite;
}
</style>
