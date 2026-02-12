<template>
  <div
    class="min-h-screen bg-background text-primary flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
  >
    <!-- Background Elements -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-brand/5 rounded-full blur-[120px] -z-10 animate-pulse"
    ></div>
    <div
      class="absolute -top-24 -right-24 w-96 h-96 bg-brand/5 rounded-full blur-[100px] -z-10"
    ></div>

    <div class="max-w-xl w-full flex flex-col items-center">
      <!-- Error Icon/Graphic -->
      <div class="relative mb-10 group">
        <div
          class="w-32 h-32 bg-brand/10 rounded-3xl flex items-center justify-center border border-brand/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
        >
          <component
            :is="errorIcon"
            class="text-brand w-16 h-16 animate-in fade-in zoom-in duration-500"
          />
        </div>
        <div
          class="absolute -bottom-4 -right-4 bg-surface border border-border px-4 py-2 rounded-2xl shadow-xl animate-in slide-in-from-bottom-2 duration-700"
        >
          <span class="text-2xl font-black tracking-tighter text-primary">{{
            error.statusCode
          }}</span>
        </div>
      </div>

      <!-- Error Content -->
      <h1 class="text-4xl lg:text-6xl font-black tracking-tighter uppercase leading-[0.8] mb-6">
        {{ errorTitle }}
      </h1>
      
      <p class="text-secondary font-medium text-lg leading-relaxed mb-12 max-w-md">
        {{ errorDescription }}
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <button
          @click="handleError"
          class="px-10 py-5 bg-brand text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:scale-105 hover:shadow-[0_20px_40px_rgba(var(--color-brand),0.3)] transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <Home size="16" />
          Voltar ao Início
        </button>
        
        <button
          v-if="error.statusCode !== 404"
          @click="refreshPage"
          class="px-10 py-5 bg-surface border border-border text-primary rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-primary/5 transition-all flex items-center justify-center gap-3"
        >
          <RefreshCw size="16" class="animate-spin-slow" />
          Tentar Novamente
        </button>
      </div>

      <!-- Footer Info -->
      <div class="mt-16 flex flex-col items-center gap-4 opacity-40">
        <div class="flex items-center gap-2">
          <div class="w-1 h-1 bg-secondary rounded-full"></div>
          <span class="text-[10px] font-black uppercase tracking-[0.3em]">Central de Operações</span>
          <div class="w-1 h-1 bg-secondary rounded-full"></div>
        </div>
        
        <p v-if="error.message && error.statusCode !== 404" class="text-[10px] font-bold uppercase tracking-widest max-w-xs leading-loose">
          Log ID: <span class="text-brand">{{ Math.random().toString(36).substring(7).toUpperCase() }}</span>
        </p>
      </div>
    </div>

    <!-- Decorative Bottom Icon -->
    <Zap
      class="absolute right-[-5%] bottom-[-5%] text-primary/5 w-64 h-64 rotate-12 opacity-50 pointer-events-none"
    />
  </div>
</template>

<script setup>
import { 
  Home, 
  RefreshCw, 
  AlertTriangle, 
  Search, 
  ShieldAlert, 
  ServerCrash,
  Zap 
} from "lucide-vue-next";

const props = defineProps({
  error: Object
});

const errorTitle = computed(() => {
  if (props.error.statusCode === 404) return "Página Não\nEncontrada.";
  if (props.error.statusCode === 403) return "Acesso\nRestrito.";
  if (props.error.statusCode === 500) return "Erro de\nServidor.";
  return "Algo deu\nErrado.";
});

const errorDescription = computed(() => {
  if (props.error.statusCode === 404) {
    return "O caminho que você tentou acessar não existe ou foi movido para outra unidade de produção.";
  }
  if (props.error.statusCode === 403) {
    return "Você não tem as permissões necessárias para acessar esta área restrita do sistema.";
  }
  return props.error.message || "Ocorreu um erro inesperado em nossos servidores. Nossa equipe de inteligência já foi notificada.";
});

const errorIcon = computed(() => {
  if (props.error.statusCode === 404) return Search;
  if (props.error.statusCode === 403) return ShieldAlert;
  if (props.error.statusCode >= 500) return ServerCrash;
  return AlertTriangle;
});

const handleError = () => clearError({ redirect: "/" });
const refreshPage = () => window.location.reload();
</script>

<style scoped>
.animate-spin-slow {
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

h1 {
  white-space: pre-line;
}
</style>
