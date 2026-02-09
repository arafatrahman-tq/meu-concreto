<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Motoristas
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Gestão de operadores e condutores da frota
        </p>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <div class="relative flex-1 md:flex-none">
          <Search
            class="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40"
            size="18"
          />
          <input
            v-model="searchTerm"
            placeholder="Buscar por..."
            class="pl-12 pr-4 py-3.5 bg-primary/2 border border-border rounded-2xl text-sm font-black uppercase tracking-widest text-primary placeholder:text-secondary/20 w-full md:w-64 focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all outline-none"
          />
        </div>
        <button
          @click="openAddModal"
          class="bg-brand text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-brand/20 outline-none"
        >
          <Plus size="20" />
          Novo Motorista
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div
      class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden"
    >
      <BaseTable
        :headers="['Motorista', 'Veículo Fixo', 'CNH', 'Contato', 'Status', '']"
      >
        <tr
          v-for="motorista in displayedMotoristas"
          :key="motorista.id"
          class="group hover:bg-primary/2 transition-colors"
        >
          <td class="px-8 py-5">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-[1.2rem] bg-brand/10 flex items-center justify-center text-brand font-black text-xs border border-brand/20 group-hover:border-brand/40 transition-colors"
              >
                {{ motorista.nome.charAt(0).toUpperCase() }}
              </div>
              <span
                class="text-sm font-black uppercase tracking-tight text-primary"
                >{{ motorista.nome }}</span
              >
            </div>
          </td>
          <td class="px-8 py-5">
            <div v-if="motorista.idCaminhao" class="flex items-center gap-2">
              <Truck size="14" class="text-brand opacity-60" />
              <span
                class="text-[10px] font-black uppercase text-primary tracking-tight"
              >
                {{ getCaminhaoLabel(motorista.idCaminhao) }}
              </span>
            </div>
            <span
              v-else
              class="text-[10px] font-black uppercase text-secondary opacity-30 tracking-widest italic"
            >
              Nenhum
            </span>
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col gap-0.5">
              <span
                class="text-xs font-black uppercase tracking-widest text-primary"
                >{{ motorista.telefone || "---" }}</span
              >
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full shadow-[0_0_10px]',
                  motorista.ativo
                    ? 'bg-emerald-500 shadow-emerald-500/50'
                    : 'bg-rose-500 shadow-rose-500/50',
                ]"
              ></div>
              <span
                class="text-[10px] font-black uppercase tracking-widest"
                :class="
                  motorista.ativo
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                "
              >
                {{ motorista.ativo ? "Ativo" : "Inativo" }}
              </span>
            </div>
          </td>
          <td class="px-6 py-4">
            <div class="flex items-center justify-end gap-2">
              <BaseTooltip text="Editar">
                <button
                  @click="openEditModal(motorista)"
                  class="p-2.5 rounded-xl text-secondary hover:text-brand hover:bg-primary/3 hover:scale-110 transition-all"
                >
                  <Edit3 size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Excluir">
                <button
                  @click="confirmDelete(motorista)"
                  class="p-2.5 rounded-xl text-secondary hover:text-rose-500 hover:bg-rose-500/10 hover:scale-110 transition-all"
                >
                  <Trash2 size="16" />
                </button>
              </BaseTooltip>
            </div>
          </td>
        </tr>
      </BaseTable>

      <!-- Empty State & Load More -->
      <div v-if="!filteredMotoristas.length" class="p-20 text-center">
        <div
          class="w-16 h-16 bg-primary/2 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border"
        >
          <UserCheck size="32" class="text-secondary opacity-20" />
        </div>
        <h3 class="text-lg font-black uppercase tracking-tight text-primary">
          Nenhum motorista encontrado
        </h3>
        <p
          class="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-50"
        >
          Experimente mudar o termo da busca ou adicionar um novo condutor.
        </p>
      </div>

      <div
        v-else-if="itemsToShow < filteredMotoristas.length"
        class="p-8 flex justify-center border-t border-border"
      >
        <button
          @click="itemsToShow += 20"
          class="flex items-center gap-2 px-6 py-3 bg-primary/2 hover:bg-primary/3 text-primary text-xs font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-105"
        >
          <RefreshCw size="14" class="opacity-40" />
          Carregar mais motoristas
        </button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <BaseModal
      v-model="showModal"
      :title="isEditing ? 'Editar Motorista' : 'Novo Motorista'"
      size="md"
    >
      <form @submit.prevent="saveMotorista" class="space-y-6 pt-4">
        <div class="space-y-2">
          <label
            class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
            >Nome Completo <span class="text-brand">*</span></label
          >
          <BaseInput
            v-model="form.nome"
            placeholder="Ex: João da Silva"
            :icon="User"
            required
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
              >Telefone</label
            >
            <BaseInput
              v-model="form.telefone"
              mask="phone"
              placeholder="(00) 00000-0000"
              :icon="Phone"
            />
          </div>
          <div class="space-y-2">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
              >CNH</label
            >
            <BaseInput
              v-model="form.cnh"
              placeholder="0000000000"
              :icon="CreditCard"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label
            class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
            >PIN de Acesso Mobile (4 dígitos)</label
          >
          <BaseInput
            v-model="form.pin"
            placeholder="Ex: 1234"
            :icon="Lock"
            maxlength="4"
          />
          <p
            class="text-[9px] font-bold text-secondary uppercase opacity-40 ml-2 mt-1"
          >
            Utilizado pelo motorista para acessar o portal de entregas.
          </p>
        </div>

        <div class="space-y-2">
          <label
            class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 block"
            >Veículo Fixo (Opcional)</label
          >
          <BaseSelect
            v-model="form.idCaminhao"
            :options="caminhaoOptions"
            placeholder="Vincular caminhão..."
            :icon="Truck"
          />
        </div>

        <div
          class="flex items-center gap-3 p-4 bg-primary/2 rounded-2xl border border-border"
        >
          <div class="flex-1">
            <h4
              class="text-[10px] font-black uppercase tracking-widest text-primary"
            >
              Status Ativo
            </h4>
            <p class="text-[9px] font-bold text-secondary uppercase opacity-40">
              Motorista disponível para escalas
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="form.ativo" class="sr-only peer" />
            <div
              class="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"
            ></div>
          </label>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="showModal = false"
            class="flex-1 px-6 py-4 border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-primary/2 transition-all outline-none"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-2 bg-brand text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand/20 disabled:opacity-50 outline-none"
          >
            {{
              loading
                ? "Salvando..."
                : isEditing
                  ? "Salvar Alterações"
                  : "Criar Motorista"
            }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Confirmation -->
    <BaseDialog
      v-model="showDeleteDialog"
      title="Remover Motorista"
      message="Esta ação não pode ser desfeita. O motorista será removido permanentemente do sistema."
      type="danger"
      confirmLabel="Sim, Remover"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import {
  Search,
  Plus,
  User,
  Phone,
  Edit3,
  Trash2,
  UserCheck,
  CreditCard,
  Truck,
  Lock,
  RefreshCw,
} from "lucide-vue-next";
import { useToast } from "~/composables/useToast";
import { useLogger } from "~/composables/useLogger";
import { useAuth } from "~/composables/useAuth";

definePageMeta({ layout: "default" });

const { add: addToast } = useToast();
const { info, error: logError } = useLogger();
const { user: authUser } = useAuth();

const { data: motoristas, refresh } = await useFetch("/api/motoristas");
const { data: caminhoes } = await useFetch("/api/caminhoes");

const caminhaoOptions = computed(() =>
  (caminhoes.value || []).map((c) => ({
    label: `${c.placa} - ${c.modelo}`,
    value: c.id,
  })),
);

const getCaminhaoLabel = (id) => {
  const caminhao = caminhoes.value?.find((c) => c.id === id);
  return caminhao ? `${caminhao.placa}` : "---";
};

const searchTerm = ref("");
const itemsToShow = ref(20);
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const showDeleteDialog = ref(false);
const motoristaToDelete = ref(null);

const form = reactive({
  id: null,
  nome: "",
  telefone: "",
  cnh: "",
  pin: "",
  idCaminhao: null,
  ativo: true,
  idEmpresa: 1,
});

const filteredMotoristas = computed(() => {
  if (!motoristas.value) return [];
  const term = searchTerm.value.toLowerCase();
  return motoristas.value.filter((m) => m.nome.toLowerCase().includes(term));
});

const displayedMotoristas = computed(() =>
  filteredMotoristas.value.slice(0, itemsToShow.value),
);

const openAddModal = () => {
  isEditing.value = false;
  Object.assign(form, {
    id: null,
    nome: "",
    telefone: "",
    cnh: "",
    pin: "",
    idCaminhao: null,
    ativo: true,
    idEmpresa: 1,
  });
  showModal.value = true;
};

const openEditModal = (motorista) => {
  isEditing.value = true;
  Object.assign(form, { ...motorista, ativo: !!motorista.ativo });
  showModal.value = true;
};

const saveMotorista = async () => {
  loading.value = true;
  try {
    if (!authUser.value) throw new Error("Sessão expirada");

    const payload = {
      ...form,
      idEmpresa: authUser.value.idEmpresa,
      ativo: !!form.ativo,
    };

    const url = isEditing.value
      ? `/api/motoristas/${form.id}`
      : "/api/motoristas";
    const method = isEditing.value ? "PUT" : "POST";

    await $fetch(url, { method, body: payload });

    addToast({
      title: isEditing.value ? "Cadastro Atualizado" : "Motorista Cadastrado",
      description: "As informações foram salvas com sucesso.",
      type: "success",
    });

    info(
      "MOTORISTAS",
      `${isEditing.value ? "Edição" : "Cadastro"} de motorista: ${form.nome}`,
      { motorista: payload },
    );
    showModal.value = false;
    refresh();
  } catch (err) {
    addToast({
      title: "Erro",
      description:
        err.data?.message ||
        err.data?.statusMessage ||
        "Não foi possível salvar os dados do motorista.",
      type: "error",
    });
    logError(
      "MOTORISTAS",
      `Erro ao ${isEditing.value ? "editar" : "cadastrar"} motorista`,
      { error: err.message, form },
    );
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (motorista) => {
  motoristaToDelete.value = motorista;
  showDeleteDialog.value = true;
};

const handleDelete = async () => {
  try {
    await $fetch(`/api/motoristas/${motoristaToDelete.value.id}`, {
      method: "DELETE",
    });
    addToast({
      title: "Removido",
      description: "O registro do motorista foi removido com sucesso.",
      type: "success",
    });
    refresh();
  } catch (err) {
    addToast({
      title: "Erro",
      description:
        err.data?.message ||
        "Falha ao tentar remover o motorista. Verifique se ele possui entregas vinculadas.",
      type: "error",
    });
  } finally {
    showDeleteDialog.value = false;
  }
};
</script>
