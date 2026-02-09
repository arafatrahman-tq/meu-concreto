<template>
  <BaseModal
    v-model="isOpen"
    :title="insumo ? 'Editar Insumo' : 'Novo Insumo'"
    subtitle="Gestão de agregados e aditivos"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6 py-2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div class="col-span-1 md:col-span-2">
          <label
            class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 block"
            >Nome do Material <span class="text-brand">*</span></label
          >
          <BaseInput
            v-model="form.nome"
            placeholder="EX: CIMENTO CP-II, AREIA GROSSA..."
            :icon="Package"
            required
          />
        </div>

        <div>
          <label
            class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 block"
            >Unidade de Medida <span class="text-brand">*</span></label
          >
          <BaseSelect
            v-model="form.unidadeMedida"
            :options="unidades"
            placeholder="SELECIONE..."
            :icon="Layers"
            required
          />
        </div>

        <div>
          <label
            class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 block"
            >Custo Unitário (R$)</label
          >
          <BaseInput
            v-model="form.custoDisplay"
            placeholder="0,00"
            :icon="DollarSign"
          />
        </div>

        <div>
          <label
            class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 block"
            >Estoque Atual</label
          >
          <BaseInput
            v-model.number="form.estoqueAtual"
            type="number"
            step="0.01"
            :icon="Database"
          />
        </div>

        <div>
          <label
            class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 block"
            >Estoque Mínimo</label
          >
          <BaseInput
            v-model.number="form.estoqueMinimo"
            type="number"
            step="0.01"
            :icon="AlertTriangle"
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
          {{
            loading
              ? "Salvando..."
              : insumo
                ? "Atualizar Insumo"
                : "Criar Insumo"
          }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import {
  Package,
  Layers,
  DollarSign,
  Database,
  AlertTriangle,
} from "lucide-vue-next";
import { useLogger } from "~/composables/useLogger";
import { useToast } from "~/composables/useToast";

const props = defineProps({
  insumo: Object,
});

const emit = defineEmits(["close", "saved"]);

const isOpen = ref(true);
const loading = ref(false);
const { info, error: logError } = useLogger();
const { add: addToast } = useToast();

const unidades = [
  { label: "KILOGRAMA (KG)", value: "kg" },
  { label: "METRO CÚBICO (M³)", value: "m³" },
  { label: "LITRO (L)", value: "L" },
  { label: "UNIDADE (UN)", value: "un" },
  { label: "TONELADA (TON)", value: "ton" },
];

const form = reactive({
  nome: "",
  unidadeMedida: "kg",
  custoDisplay: "",
  estoqueAtual: 0,
  estoqueMinimo: 0,
});

watch(
  () => props.insumo,
  (val) => {
    if (val) {
      Object.assign(form, {
        ...val,
        custoDisplay: val.custoUnitario
          ? (val.custoUnitario / 100).toFixed(2).replace(".", ",")
          : "0,00",
      });
    } else {
      Object.assign(form, {
        nome: "",
        unidadeMedida: "kg",
        custoDisplay: "",
        estoqueAtual: 0,
        estoqueMinimo: 0,
      });
    }
  },
  { immediate: true },
);

watch(isOpen, (val) => {
  if (!val) emit("close");
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    const custoCentavos =
      Math.round(parseFloat(form.custoDisplay.replace(",", ".")) * 100) || 0;
    const payload = {
      ...form,
      custoUnitario: custoCentavos,
    };

    if (props.insumo) {
      await $fetch(`/api/insumos/${props.insumo.id}`, {
        method: "PUT",
        body: payload,
      });
      info("INSUMOS", `Insumo atualizado: ${form.nome}`, {
        id: props.insumo.id,
        payload,
      });
    } else {
      await $fetch("/api/insumos", { method: "POST", body: payload });
      info("INSUMOS", `Novo insumo criado: ${form.nome}`, { payload });
    }

    emit("saved");
    addToast({
      title: "Sucesso",
      description: props.insumo ? "Insumo atualizado!" : "Insumo cadastrado!",
      type: "success",
    });
    isOpen.value = false;
  } catch (e) {
    logError("INSUMOS", `Erro ao salvar insumo: ${form.nome}`, {
      error: e.message,
    });
    addToast({
      title: "Erro",
      description:
        e.data?.message ||
        "Não foi possível salvar os dados do insumo. Verifique as informações e tente novamente.",
      type: "error",
    });
  } finally {
    loading.value = false;
  }
};
</script>
