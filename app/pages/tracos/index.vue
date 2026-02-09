<template>
  <div class="flex flex-col gap-6 animate-enter">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Mix <span class="text-brand">Design</span>
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Gestão de traços e composições de concreto
        </p>
      </div>
      <button
        @click="openModal()"
        class="bg-brand text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
      >
        <Plus size="20" />
        Novo Traço
      </button>
    </div>

    <!-- Lista de Traços -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="traco in tracos"
        :key="traco.id"
        class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden group hover:border-brand/30 transition-all flex flex-col"
      >
        <div class="p-8 border-b border-border bg-primary/2">
          <div class="flex items-start justify-between mb-6">
            <div
              class="w-14 h-14 bg-primary/3 rounded-2xl flex items-center justify-center text-secondary group-hover:text-brand group-hover:bg-brand/10 transition-all border border-border group-hover:border-brand/30"
            >
              <FlaskConical size="28" />
            </div>
            <div class="flex items-center gap-2">
              <BaseTooltip text="Editar">
                <button
                  @click="openModal(traco)"
                  class="p-2.5 rounded-xl bg-surface text-secondary hover:text-brand hover:scale-110 transition-all shadow-sm border border-border"
                >
                  <Edit3 size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Excluir">
                <button
                  @click="deleteTraco(traco.id)"
                  class="p-2.5 rounded-xl bg-surface text-secondary hover:text-red-500 hover:scale-110 transition-all shadow-sm border border-border"
                >
                  <Trash2 size="16" />
                </button>
              </BaseTooltip>
            </div>
          </div>
          <h3
            class="text-lg font-black text-primary mb-1 uppercase tracking-tight"
          >
            {{ traco.nome }}
          </h3>
          <p
            class="text-[10px] font-black text-secondary opacity-40 uppercase tracking-[0.15em]"
          >
            {{ traco.produto?.produto || "Produto não vinculado" }}
          </p>
        </div>

        <div class="p-8 space-y-4 flex-1">
          <div class="space-y-3">
            <div
              v-for="item in traco.itens"
              :key="item.id"
              class="flex items-center justify-between"
            >
              <span
                class="text-[11px] font-bold text-secondary uppercase tracking-tight"
                >{{ item.insumo?.nome }}</span
              >
              <span class="text-xs font-black text-primary tabular-nums"
                >{{ item.quantidade }} {{ item.insumo?.unidadeMedida }}</span
              >
            </div>
          </div>
        </div>

        <div
          class="px-8 py-5 border-t border-border bg-primary/2 flex items-center justify-between"
        >
          <span
            class="text-[9px] font-black uppercase tracking-[0.2em] text-secondary opacity-40"
            >Status do Projeto</span
          >
          <div class="flex items-center gap-2">
            <div
              :class="[
                'w-1.5 h-1.5 rounded-full shadow-[0_0_8px]',
                traco.ativo
                  ? 'bg-emerald-500 shadow-emerald-500/50'
                  : 'bg-rose-500 shadow-rose-500/50',
              ]"
            ></div>
            <span
              class="text-[9px] font-black uppercase tracking-[0.2em]"
              :class="traco.ativo ? 'text-emerald-500' : 'text-rose-500'"
            >
              {{ traco.ativo ? "ATIVO" : "INATIVO" }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <TracoFormModal
      v-if="showModal"
      @close="showModal = false"
      @saved="refresh"
      :traco="selectedTraco"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Plus, FlaskConical, Edit3, Trash2 } from "lucide-vue-next";

const showModal = ref(false);
const selectedTraco = ref(null);

const { data: tracos, refresh } = useFetch("/api/tracos");

const openModal = (traco = null) => {
  selectedTraco.value = traco;
  showModal.value = true;
};

const deleteTraco = async (id) => {
  if (!confirm("Deseja excluir este traço?")) return;
  try {
    await $fetch(`/api/tracos/${id}`, { method: "DELETE" });
    refresh();
  } catch (e) {
    alert("Erro ao excluir: " + (e.data?.message || e.message));
  }
};
</script>
