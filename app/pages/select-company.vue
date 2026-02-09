<template>
  <div
    class="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden"
  >
    <!-- Background Decor -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none">
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

    <div class="w-full max-w-xl relative z-10">
      <div class="text-center mb-12">
        <div
          class="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-brand/20 mb-8 p-4"
        >
          <svg
            viewBox="0 0 512 300"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="155" cy="245" r="45" />
            <circle cx="265" cy="245" r="45" />
            <circle cx="435" cy="245" r="45" />
            <path
              d="M40 170h430v60H40zM350 70h80c40 0 45 40 45 40v60H350V70z M440 90h25v45h-25z"
            />
            <path
              d="M60 80l240-50c15-3 30 10 30 25v120c0 15-15 28-30 25L60 150c-15-3-20-15-20-30V110c0-15 5-27 20-30z"
            />
            <path d="M40 70l20 20v60l-20 20z" />
          </svg>
        </div>
        <h1
          class="text-4xl font-black text-primary tracking-tighter uppercase mb-2"
        >
          Selecione a Unidade
        </h1>
        <p
          class="text-secondary font-medium uppercase tracking-[0.2em] text-[10px] opacity-60"
        >
          Escolha qual empresa deseja gerenciar agora
        </p>
      </div>

      <div class="grid gap-4">
        <button
          v-for="emp in allEmpresas"
          :key="emp.id"
          @click="selectCompany(emp.id)"
          :disabled="loading"
          class="group bg-surface border-2 border-primary/5 p-6 rounded-2xl flex items-center justify-between hover:border-brand hover:shadow-xl hover:shadow-brand/5 transition-all text-left"
        >
          <div class="flex items-center gap-5">
            <div
              class="w-12 h-12 rounded-xl bg-primary/3 flex items-center justify-center text-primary group-hover:bg-brand group-hover:text-white transition-colors"
            >
              <Building2 size="24" />
            </div>
            <div>
              <h3
                class="font-black text-lg text-primary uppercase leading-tight tracking-tight"
              >
                {{ emp.empresa }}
                <span
                  v-if="emp.filial"
                  class="text-brand opacity-60 ml-1 text-sm font-black"
                  >- {{ emp.filial }}</span
                >
              </h3>
              <p
                class="text-[10px] text-secondary font-bold uppercase tracking-widest mt-1 opacity-60"
              >
                CNPJ: {{ emp.cnpj }}
              </p>
              <p
                v-if="emp.endereco"
                class="text-[9px] text-secondary/40 font-bold uppercase tracking-widest mt-1.5 leading-none"
              >
                {{ emp.endereco }}, {{ emp.numero }} - {{ emp.cidade }}/{{
                  emp.estado
                }}
              </p>
            </div>
          </div>
          <ChevronRight
            size="20"
            class="text-secondary group-hover:text-brand group-hover:translate-x-1 transition-all"
          />
        </button>
      </div>

      <div class="mt-12 text-center">
        <button
          @click="logout"
          class="text-[10px] font-black uppercase tracking-widest text-danger hover:brightness-110 transition-all"
        >
          Sair do Sistema
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Building2, ChevronRight } from "lucide-vue-next";
import { useAuth } from "~/composables/useAuth";

definePageMeta({
  layout: false,
});

const { user, logout, fetchUser } = useAuth();
const { add: addToast } = useToast();
const loading = ref(false);

const allEmpresas = computed(() => {
  if (!user.value) return [];

  const main = { ...user.value.empresa };
  const others = user.value.acessoEmpresas?.map((a) => a.empresa) || [];

  // Unificar e remover duplicatas caso existam
  const merged = [main, ...others].filter((e) => e && e.id);
  return Array.from(new Map(merged.map((item) => [item.id, item])).values());
});

async function selectCompany(id) {
  loading.value = true;
  try {
    const result = await $fetch("/api/auth/switch-company", {
      method: "POST",
      body: { idEmpresa: id },
    });

    if (result.success) {
      // Atualizar o estado global do usuário para refletir a nova idEmpresa na sessão
      await fetchUser(true);

      addToast({
        title: "Unidade Alterada",
        description: "Você trocou de unidade com sucesso.",
        type: "success",
      });

      // Redirecionar para o dashboard
      navigateTo("/");
    }
  } catch (error) {
    console.error("Erro ao trocar empresa:", error);
    addToast({
      title: "Erro",
      description: "Não foi possível trocar de unidade.",
      type: "danger",
    });
  } finally {
    loading.value = false;
  }
}
</script>
