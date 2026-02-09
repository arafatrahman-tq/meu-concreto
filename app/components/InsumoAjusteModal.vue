<template>
  <BaseModal
    v-model="isOpen"
    title="Ajuste de Inventário"
    subtitle="Correções manuais e entradas de carga"
  >
    <div
      class="mb-8 p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex gap-4"
    >
      <div
        class="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center shrink-0"
      >
        <Info size="20" />
      </div>
      <div>
        <p class="text-xs font-bold text-amber-700 leading-relaxed">
          Ajustes manuais impactam diretamente o relatório de eficiência. Use
          este recurso para lançar compras (ENTRADA) ou perdas (SAÍDA REAL)
          detectadas no pátio.
        </p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6 py-2">
      <div class="space-y-4">
        <div>
          <label
            class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 block"
            >Material <span class="text-brand">*</span></label
          >
          <BaseSelect
            v-model="form.idInsumo"
            :options="insumosOptions"
            placeholder="SELECIONE O MATERIAL..."
            :icon="Package"
            required
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 block"
              >Tipo de Movimento <span class="text-brand">*</span></label
            >
            <BaseSelect
              v-model="form.tipo"
              :options="tipos"
              placeholder="SELECIONE..."
              required
            />
          </div>
          <div>
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 block"
            >
              {{ form.tipo === "AJUSTE" ? "Novo Saldo Físico" : "Quantidade" }}
              <span class="text-brand">*</span>
            </label>
            <BaseInput
              v-model.number="form.quantidade"
              type="number"
              step="0.01"
              :icon="Layers"
              required
            />
          </div>
        </div>

        <div>
          <label
            class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 block"
            >Observação / Justificativa</label
          >
          <BaseInput
            v-model="form.observacao"
            placeholder="EX: COMPRA NF 1234 OU QUEBRA DE EMBALAGEM..."
            :icon="FileText"
          />
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-6">
        <button
          type="button"
          @click="isOpen = false"
          class="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-primary/3 transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="bg-brand text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          {{ loading ? "Processando..." : "Confirmar Ajuste" }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, watch, computed } from "vue";
import { Package, Layers, FileText, Info } from "lucide-vue-next";
import { useLogger } from "~/composables/useLogger";

const emit = defineEmits(["close", "saved"]);

const isOpen = ref(true);
const loading = ref(false);
const { info, error: logError } = useLogger();

const { data: insumos } = useFetch("/api/insumos");

const insumosOptions = computed(() => {
  if (!insumos.value) return [];
  return insumos.value.map((i) => ({ label: i.nome, value: i.id }));
});

const tipos = [
  { label: "ENTRADA DE CARGA (COMPRA)", value: "ENTRADA" },
  { label: "PERDA IDENTIFICADA (SAÍDA)", value: "SAIDA_REAL" },
  { label: "CORREÇÃO DE SALDO (INVENTÁRIO)", value: "AJUSTE" },
];

const form = reactive({
  idInsumo: null,
  tipo: "AJUSTE",
  quantidade: 0,
  observacao: "",
});

watch(isOpen, (val) => {
  if (!val) emit("close");
});

const handleSubmit = async () => {
  if (!form.idInsumo) return alert("Selecione um material");

  loading.value = true;
  try {
    const selectedInsumo = insumos.value?.find((i) => i.id === form.idInsumo);
    await $fetch("/api/insumos/ajuste", { method: "POST", body: form });

    info(
      "INSUMOS",
      `Ajuste de estoque realizado: ${selectedInsumo?.nome || "Material #" + form.idInsumo}`,
      {
        materialId: form.idInsumo,
        tipo: form.tipo,
        quantidade: form.quantidade,
        obs: form.observacao,
      },
    );

    emit("saved");
    isOpen.value = false;
  } catch (e) {
    logError("INSUMOS", "Erro ao realizar ajuste de estoque", {
      error: e.message,
      form,
    });
    alert("Erro ao processar ajuste: " + (e.data?.message || e.message));
  } finally {
    loading.value = false;
  }
};
</script>
