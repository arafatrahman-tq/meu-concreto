<template>
  <div class="flex flex-col gap-8 animate-enter">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Sistema
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Variáveis globais e feature flags do ERP
        </p>
      </div>
      <button
        @click="openModal()"
        class="bg-brand text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-brand/20"
      >
        <Plus size="20" />
        Nova Variável
      </button>
    </div>

    <div v-if="pending" class="flex justify-center py-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"
      ></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BaseCard
        v-for="config in configs"
        :key="config.id"
        class="relative group hover:border-brand/30 transition-all"
      >
        <div class="flex justify-between items-start mb-4">
          <div
            :class="[
              'px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest',
              config.categoria === 'FEATURE_FLAG'
                ? 'bg-indigo-500/10 text-indigo-600'
                : 'bg-brand/10 text-brand',
            ]"
          >
            {{ config.categoria }}
          </div>
          <div
            class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button
              @click="openModal(config)"
              class="p-2 hover:bg-primary/5 rounded-xl text-secondary transition-colors"
            >
              <Edit2 size="16" />
            </button>
          </div>
        </div>

        <h3
          class="text-xs font-black uppercase tracking-widest text-primary mb-1"
        >
          {{ config.chave }}
        </h3>
        <p
          class="text-[10px] font-bold text-secondary uppercase tracking-tight mb-4 line-clamp-2 opacity-50"
        >
          {{ config.descricao || "Sem descrição cadastrada" }}
        </p>

        <div
          class="bg-primary/2 border border-border/50 rounded-2xl p-4 font-mono text-xs break-all overflow-hidden max-h-24 text-secondary"
        >
          {{ config.valor }}
        </div>

        <div
          class="mt-4 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-secondary opacity-30"
        >
          <span>#ID: {{ config.id }}</span>
          <span class="flex items-center gap-1.5">
            <div
              class="w-1.5 h-1.5 rounded-full"
              :class="config.idEmpresa ? 'bg-emerald-500' : 'bg-brand'"
            ></div>
            {{ config.idEmpresa ? "Unidade Local" : "Global" }}
          </span>
        </div>
      </BaseCard>
    </div>

    <!-- Modal de Configuração -->
    <BaseModal
      :show="showModal"
      @close="showModal = false"
      :title="editingConfig ? 'Editar Variável' : 'Nova Variável de Sistema'"
    >
      <form @submit.prevent="saveConfig" class="space-y-6 pt-4">
        <div>
          <label
            class="block text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1"
            >Chave (Identificador Único)</label
          >
          <BaseInput
            v-model="form.chave"
            placeholder="Ex: MANUTENCAO_SITE"
            :disabled="!!editingConfig"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              class="block text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1"
              >Categoria</label
            >
            <BaseSelect
              v-model="form.categoria"
              :options="[
                { label: 'Geral', value: 'GERAL' },
                { label: 'Feature Flag', value: 'FEATURE_FLAG' },
                { label: 'Negócio', value: 'NEGOCIO' },
                { label: 'UI/Layout', value: 'UI' },
              ]"
            />
          </div>
          <div>
            <label
              class="block text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1"
              >Escopo de Aplicação</label
            >
            <BaseSelect
              v-model="form.scope"
              :options="[
                { label: 'Global (Todos)', value: 'global' },
                { label: 'Esta Empresa', value: 'empresa' },
              ]"
              :disabled="!!editingConfig"
            />
          </div>
        </div>

        <div>
          <label
            class="block text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1"
            >Valor (JSON ou String)</label
          >
          <textarea
            v-model="form.valor"
            class="w-full bg-primary/2 border border-border rounded-2xl py-4 px-5 text-sm font-mono text-primary placeholder:text-secondary/20 focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all outline-none resize-none"
            rows="4"
            placeholder='true ou { "active": true }'
          ></textarea>
        </div>

        <div>
          <label
            class="block text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1"
            >Descrição</label
          >
          <BaseInput
            v-model="form.descricao"
            placeholder="Explique para que serve esta variável..."
          />
        </div>

        <div class="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4">
          <button
            type="button"
            @click="showModal = false"
            class="px-8 py-4 rounded-2xl border border-border text-xs font-black uppercase tracking-widest text-secondary hover:bg-primary/2 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="bg-brand text-background px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand/20 disabled:opacity-50"
          >
            <RefreshCw v-if="saving" size="18" class="animate-spin" />
            <Save v-else size="18" />
            {{ editingConfig ? "Salvar Alterações" : "Criar Variável" }}
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { Settings2, Plus, Edit2, RefreshCw, Save } from "lucide-vue-next";
import { useAuth, useToast } from "#imports";

definePageMeta({
  middleware: ["admin"], // Apenas admins podem ver isso
});

const { user } = useAuth();
const { add: addToast } = useToast();

const {
  data: configs,
  pending,
  refresh,
} = useFetch("/api/configuracoes/sistema");

const showModal = ref(false);
const saving = ref(false);
const editingConfig = ref(null);

const form = ref({
  chave: "",
  valor: "",
  descricao: "",
  categoria: "GERAL",
  scope: "empresa",
});

const openModal = (config = null) => {
  editingConfig.value = config;
  if (config) {
    form.value = {
      ...config,
      scope: config.idEmpresa ? "empresa" : "global",
    };
  } else {
    form.value = {
      chave: "",
      valor: "",
      descricao: "",
      categoria: "GERAL",
      scope: "empresa",
    };
  }
  showModal.value = true;
};

const saveConfig = async () => {
  try {
    saving.value = true;

    const payload = {
      chave: form.value.chave,
      valor: form.value.valor,
      descricao: form.value.descricao,
      categoria: form.value.categoria,
      idEmpresa: form.value.scope === "empresa" ? user.value.idEmpresa : null,
    };

    await $fetch("/api/configuracoes/sistema", {
      method: "POST",
      body: payload,
    });

    addToast({
      title: "Sucesso",
      description: editingConfig.value
        ? "Configuração atualizada!"
        : "Configuração criada!",
      type: "success",
    });

    showModal.value = false;
    refresh();
  } catch (error) {
    addToast({
      title: "Erro",
      description: error.data?.statusMessage || "Erro ao salvar configuração",
      type: "error",
    });
  } finally {
    saving.value = false;
  }
};
</script>
