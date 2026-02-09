<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Empresas
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Gestão de unidades e filiais do grupo
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
            placeholder="Buscar unidade ou CNPJ..."
            class="pl-12 pr-4 py-3.5 bg-primary/2 border border-border rounded-2xl text-sm font-black uppercase tracking-widest text-primary placeholder:text-secondary/20 w-full md:w-80 focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all outline-none"
          />
        </div>
        <button
          @click="openAddModal"
          class="bg-brand text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-brand/20"
        >
          <Plus size="20" />
          Nova Empresa
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div
      class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden"
    >
      <BaseTable
        :headers="['Empresa / Unidade', 'CNPJ / IE', 'Contato', 'Endereço', '']"
      >
        <tr
          v-for="empresa in displayedEmpresas"
          :key="empresa.id"
          class="group hover:bg-primary/2 transition-colors"
        >
          <td class="px-8 py-5">
            <div class="flex items-center gap-4">
              <div
                v-if="empresa.logo"
                class="w-12 h-12 rounded-[1.2rem] bg-white border border-border overflow-hidden p-1 flex items-center justify-center"
              >
                <img
                  :src="empresa.logo"
                  class="max-w-full max-h-full object-contain"
                />
              </div>
              <div
                v-else
                class="w-12 h-12 rounded-[1.2rem] bg-primary/2 flex items-center justify-center text-secondary font-black text-xs border border-border group-hover:border-brand/30 group-hover:text-brand transition-colors"
              >
                {{ empresa.empresa.charAt(0).toUpperCase() }}
              </div>
              <div class="flex flex-col">
                <span
                  class="text-sm font-black uppercase tracking-tight text-primary"
                  >{{ empresa.empresa }}</span
                >
                <span
                  v-if="empresa.filial"
                  class="text-[9px] font-black uppercase tracking-widest text-brand"
                  >{{ empresa.filial }}</span
                >
              </div>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col gap-0.5">
              <span class="text-xs font-black text-primary tabular-nums">{{
                formatCnpj(empresa.cnpj)
              }}</span>
              <span
                class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40"
                >IE: {{ empresa.ie || "Isento" }}</span
              >
            </div>
          </td>
          <td class="px-8 py-5 text-secondary">
            <div class="flex flex-col gap-0.5 text-xs font-bold">
              <div class="flex items-center gap-2">
                <Phone size="12" class="opacity-30" />
                <span>{{ formatPhone(empresa.telefone) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Mail size="12" class="opacity-30" />
                <span class="lowercase opacity-60">{{ empresa.email }}</span>
              </div>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-primary max-w-50 truncate">{{
                empresa.endereco
              }}</span>
              <span
                class="text-[10px] font-bold text-secondary opacity-40 uppercase tracking-tight"
                >{{ empresa.bairro }}</span
              >
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center justify-end gap-2">
              <BaseTooltip text="Editar">
                <button
                  @click="openEditModal(empresa)"
                  class="p-2.5 rounded-xl bg-primary/3 text-secondary hover:text-brand hover:scale-110 active:scale-95 transition-all"
                >
                  <Edit3 size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Excluir">
                <button
                  @click="confirmDelete(empresa)"
                  class="p-2.5 rounded-xl bg-primary/3 text-secondary hover:text-rose-500 hover:scale-110 active:scale-95 transition-all"
                >
                  <Trash2 size="16" />
                </button>
              </BaseTooltip>
            </div>
          </td>
        </tr>
      </BaseTable>

      <!-- Empty State -->
      <div v-if="!filteredEmpresas.length && !pending" class="p-20 text-center">
        <div
          class="w-16 h-16 bg-primary/2 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border"
        >
          <Building2 size="32" class="text-secondary/20" />
        </div>
        <h3 class="text-lg font-black uppercase tracking-tight text-primary">
          Nenhuma empresa encontrada
        </h3>
        <p
          class="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-50"
        >
          Cadastre unidades para gerenciar o sistema de forma multi-empresa.
        </p>
      </div>
    </div>

    <!-- Pagination / Infinite Load -->
    <div
      v-if="filteredEmpresas.length > itemsToShow"
      class="flex justify-center py-8"
    >
      <button
        @click="itemsToShow += 10"
        class="bg-surface border border-border px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-secondary hover:text-brand hover:border-brand/30 transition-all flex items-center gap-3 group"
      >
        <RefreshCw
          size="14"
          class="group-hover:rotate-180 transition-transform duration-500"
        />
        Carregar mais unidades
      </button>
    </div>

    <!-- Add/Edit Modal -->
    <BaseModal
      v-model="showModal"
      :title="isEditing ? 'Editar Empresa' : 'Nova Unidade Empresarial'"
      size="md"
    >
      <form @submit.prevent="saveEmpresa" class="space-y-6 pt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 mb-1.5 block"
              >Nome da Empresa / Razão Social
              <span class="text-brand">*</span></label
            >
            <BaseInput
              v-model="form.empresa"
              placeholder="Ex: Concreteira Matriz LTDA"
              :icon="Building2"
              required
            />
          </div>

          <div class="md:col-span-1">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 mb-1.5 block"
              >CNPJ <span class="text-brand">*</span></label
            >
            <BaseInput
              v-model="form.cnpj"
              placeholder="00.000.000/0000-00"
              mask="cnpj"
              required
            />
          </div>

          <div class="md:col-span-1">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 mb-1.5 block"
              >Inscrição Estadual</label
            >
            <BaseInput v-model="form.ie" placeholder="000.000.000.000" />
          </div>

          <div class="md:col-span-2">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 mb-1.5 block"
              >Identificação da Filial</label
            >
            <BaseInput
              v-model="form.filial"
              placeholder="Ex: Matriz, Filial 02..."
              :icon="MapPin"
            />
          </div>

          <div class="md:col-span-1">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 mb-1.5 block"
              >E-mail Corporativo</label
            >
            <BaseInput
              v-model="form.email"
              placeholder="contato@empresa.com"
              :icon="Mail"
            />
          </div>

          <div class="md:col-span-1">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 mb-1.5 block"
              >Telefone</label
            >
            <BaseInput
              v-model="form.telefone"
              placeholder="(00) 0000-0000"
              mask="phone"
              :icon="Phone"
            />
          </div>

          <div class="md:col-span-2">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 mb-1.5 block"
              >Endereço Completo</label
            >
            <BaseInput
              v-model="form.endereco"
              placeholder="Rua, Número, Complemento"
              :icon="MapPin"
            />
          </div>

          <div class="md:col-span-1">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 mb-1.5 block"
              >Bairro</label
            >
            <BaseInput v-model="form.bairro" placeholder="Bairro" />
          </div>

          <div class="md:col-span-1">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 mb-1.5 block"
              >URL do Logo (Base64 ou Link)</label
            >
            <BaseInput
              v-model="form.logo"
              placeholder="https://..."
              :icon="Activity"
            />
          </div>
        </div>

        <!-- Configuração Fiscal -->
        <div class="pt-6 border-t border-border">
          <h4
            class="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2"
          >
            <Activity size="14" class="text-brand" />
            Configuração Fiscal para Emissão
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-1">
              <label
                class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 mb-1.5 flex items-center gap-1.5"
              >
                Regime Tributário (CRT)
                <BaseTooltip
                  text="Define as alíquotas de impostos. Simples Nacional é o padrão para pequenas empresas."
                >
                  <HelpCircle size="10" class="cursor-help" />
                </BaseTooltip>
              </label>
              <BaseSelect
                v-model="form.crt"
                :options="[
                  { label: 'Simples Nacional', value: 1 },
                  { label: 'Simples - Excesso Sublimite', value: 2 },
                  { label: 'Regime Normal', value: 3 },
                ]"
              />
            </div>

            <div class="md:col-span-1">
              <label
                class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2 mb-1.5 flex items-center gap-1.5"
              >
                Código Serviço Municipal
                <BaseTooltip
                  text="Código da LC 116/03 usado para emissão de NFS-e. 07.02 é o padrão para serviços de concretagem."
                >
                  <HelpCircle size="10" class="cursor-help" />
                </BaseTooltip>
              </label>
              <BaseInput
                v-model="form.codigoServicoMunicipal"
                placeholder="07.02"
              />
              <p class="text-[8px] font-medium text-secondary/40 mt-1 ml-2">
                Padrão: 07.02 (Edificações e Const. Civil)
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary text-background py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/10 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <template v-if="loading">
            <div
              class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></div>
            Processando...
          </template>
          <template v-else>
            <CheckCircle size="18" />
            {{ isEditing ? "Atualizar Unidade" : "Cadastrar Unidade" }}
          </template>
        </button>
      </form>
    </BaseModal>

    <!-- Delete Confirmation Dialog -->
    <BaseDialog
      v-model="showDeleteDialog"
      title="Remover Empresa"
      :message="`Deseja realmente remover a unidade ${empresaToDelete?.empresa}? Esta ação pode afetar registros vinculados.`"
      variant="danger"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Building2,
  MapPin,
  Phone,
  Mail,
  Activity,
  CheckCircle,
  X,
  RefreshCw,
  HelpCircle,
} from "lucide-vue-next";
import { useToast } from "~/composables/useToast";
import { useLogger } from "~/composables/useLogger";
import { useAuth } from "~/composables/useAuth";

definePageMeta({
  layout: "default",
  middleware: ["admin"],
});

const { add: addToast } = useToast();
const { info, error: logError } = useLogger();
const { user } = useAuth();

const { data: empresas, refresh, pending } = useFetch("/api/empresas");

const searchTerm = ref("");
const itemsToShow = ref(10);
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const showDeleteDialog = ref(false);
const empresaToDelete = ref(null);

const form = reactive({
  id: null,
  empresa: "",
  cnpj: "",
  ie: "",
  logo: "",
  endereco: "",
  bairro: "",
  telefone: "",
  email: "",
  filial: "",
  crt: 1,
  codigoServicoMunicipal: "07.02",
});

const filteredEmpresas = computed(() => {
  if (!empresas.value) return [];
  const term = searchTerm.value.toLowerCase();
  return empresas.value.filter(
    (e) =>
      e.empresa.toLowerCase().includes(term) ||
      e.cnpj.includes(term) ||
      (e.filial && e.filial.toLowerCase().includes(term)),
  );
});

const displayedEmpresas = computed(() => {
  return filteredEmpresas.value.slice(0, itemsToShow.value);
});

const openAddModal = () => {
  isEditing.value = false;
  Object.assign(form, {
    id: null,
    empresa: "",
    cnpj: "",
    ie: "",
    logo: "",
    endereco: "",
    bairro: "",
    telefone: "",
    email: "",
    filial: "",
    crt: 1,
    codigoServicoMunicipal: "07.02",
  });
  showModal.value = true;
};

const openEditModal = (emp) => {
  isEditing.value = true;
  Object.assign(form, { ...emp });
  showModal.value = true;
};

const saveEmpresa = async () => {
  loading.value = true;
  try {
    const url = isEditing.value ? `/api/empresas/${form.id}` : "/api/empresas";
    const method = isEditing.value ? "PUT" : "POST";

    await $fetch(url, {
      method,
      body: form,
    });

    addToast({
      title: isEditing.value ? "Empresa Atualizada" : "Empresa Cadastrada",
      description: `A unidade ${form.empresa} foi salva com sucesso.`,
      type: "success",
    });

    info(
      "EMPRESAS",
      `${isEditing.value ? "Edição" : "Cadastro"} de empresa: ${form.empresa}`,
    );
    showModal.value = false;
    refresh();
  } catch (err) {
    const validationErrors = err.data?.data;
    const errorMessage = validationErrors
      ? validationErrors.map((e) => e.message).join(". ")
      : err.data?.message || "Não foi possível salvar os dados.";

    addToast({
      title: "Erro no Processamento",
      description: errorMessage,
      type: "error",
    });
    logError("EMPRESAS", "Erro ao salvar empresa", {
      error: err.message,
      form,
    });
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (emp) => {
  empresaToDelete.value = emp;
  showDeleteDialog.value = true;
};

const handleDelete = async () => {
  try {
    await $fetch(`/api/empresas/${empresaToDelete.value.id}`, {
      method: "DELETE",
    });
    addToast({
      title: "Removido",
      description: "Empresa removida com sucesso.",
      type: "success",
    });
    info("EMPRESAS", `Remoção de empresa ID: ${empresaToDelete.value.id}`);
    refresh();
  } catch (err) {
    addToast({
      title: "Erro",
      description:
        err.data?.message ||
        "Esta empresa não pode ser removida. Verifique se existem usuários ou dados vinculados a ela.",
      type: "error",
    });
    logError("EMPRESAS", "Erro ao remover empresa", { error: err.message });
  } finally {
    showDeleteDialog.value = false;
  }
};

// Helpers
const formatCnpj = (val) => {
  if (!val) return "";
  const clean = val.replace(/\D/g, "");
  return clean.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
};

const formatPhone = (val) => {
  if (!val) return "Não informado";
  const clean = val.replace(/\D/g, "");
  if (clean.length === 11) {
    return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  return clean.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
};
</script>
