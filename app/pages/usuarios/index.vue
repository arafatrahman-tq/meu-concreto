<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Usuários
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Gestão de acessos e permissões da equipe
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
          class="bg-brand text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-brand/20"
        >
          <Plus size="20" />
          Novo Usuário
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div
      class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden"
    >
      <BaseTable :headers="['Usuário', 'Acesso', 'Perfis', 'Status', '']">
        <tr
          v-for="user in displayedUsers"
          :key="user.id"
          class="group hover:bg-primary/2 transition-colors"
        >
          <td class="px-8 py-5">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-[1.2rem] bg-brand/10 flex items-center justify-center text-brand font-black text-xs border border-brand/20 group-hover:border-brand/40 transition-colors"
              >
                {{ user.nome.charAt(0).toUpperCase() }}
              </div>
              <span
                class="text-sm font-black uppercase tracking-tight text-primary"
                >{{ user.nome }}</span
              >
            </div>
          </td>
          <td class="px-8 py-5 text-secondary">
            <div class="flex flex-col gap-0.5">
              <span
                class="text-xs font-black uppercase tracking-widest text-primary"
                >{{ user.usuario }}</span
              >
              <span
                class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-40"
                >{{ user.email }}</span
              >
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center gap-2">
                <span
                  v-if="user.admin"
                  class="p-1 px-3 bg-brand/10 text-brand rounded-xl text-[9px] font-black uppercase tracking-widest"
                  >Admin</span
                >
                <span
                  class="p-1 px-3 bg-primary/3 text-secondary rounded-xl text-[9px] font-black uppercase tracking-widest"
                  >Equipe</span
                >
              </div>
              <div class="flex flex-wrap gap-1 max-w-50">
                <span
                  v-for="acesso in user.acessoEmpresas"
                  :key="acesso.idEmpresa"
                  class="text-[8px] font-bold bg-primary/2 text-secondary/60 px-1.5 py-0.5 rounded border border-border/50 whitespace-nowrap"
                >
                  {{ acesso.empresa?.empresa }}
                </span>
              </div>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full shadow-[0_0_10px]',
                  user.ativo
                    ? 'bg-emerald-500 shadow-emerald-500/50'
                    : 'bg-rose-500 shadow-rose-500/50',
                ]"
              ></div>
              <span
                class="text-[10px] font-black uppercase tracking-widest"
                :class="
                  user.ativo
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                "
              >
                {{ user.ativo ? "Ativo" : "Inativo" }}
              </span>
            </div>
          </td>
          <td class="px-6 py-4">
            <div class="flex items-center justify-end gap-2">
              <BaseTooltip text="Editar">
                <button
                  @click="openEditModal(user)"
                  class="p-2.5 rounded-xl text-secondary hover:text-brand hover:bg-primary/3 hover:scale-110 transition-all"
                >
                  <Edit3 size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Excluir">
                <button
                  @click="confirmDelete(user)"
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
      <div v-if="!filteredUsers.length" class="p-20 text-center">
        <div
          class="w-16 h-16 bg-primary/2 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border"
        >
          <Users size="32" class="text-secondary opacity-20" />
        </div>
        <h3 class="text-lg font-black uppercase tracking-tight text-primary">Nenhum usuário encontrado</h3>
        <p class="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-50">
          Experimente mudar o termo da busca ou adicionar um novo membro.
        </p>
      </div>

      <div
        v-else-if="itemsToShow < filteredUsers.length"
        class="p-8 flex justify-center border-t border-border"
      >
        <button
          @click="itemsToShow += 20"
          class="flex items-center gap-2 px-6 py-3 bg-primary/2 hover:bg-primary/3 text-primary text-xs font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-105"
        >
          <RefreshCw size="14" class="opacity-40" />
          Carregar mais usuários
        </button>
      </div>
    </div>

    <!-- Modal de Usuário -->
    <BaseModal
      :show="showUserModal"
      :title="isEditing ? 'Configurar Usuário' : 'Novo Membro da Equipe'"
      @close="showUserModal = false"
    >
      <template #default>
        <div class="space-y-6 pt-4">
          <!-- Informações Básicas -->
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label
                class="block text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1"
              >
                Nome Completo
              </label>
              <BaseInput
                v-model="form.nome"
                placeholder="Ex: Roberto Silva"
                :icon="User"
              />
            </div>
            <div>
              <label
                class="block text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1"
              >
                Nome de Usuário
              </label>
              <BaseInput
                v-model="form.usuario"
                placeholder="Ex: roberto.silva"
                :icon="AtSign"
              />
            </div>
            <div>
              <label
                class="block text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1"
              >
                WhatsApp
              </label>
              <BaseInput
                v-model="form.whatsapp"
                placeholder="(00) 00000-0000"
                :icon="Phone"
                mask="phone"
              />
            </div>
          </div>

          <div>
            <label
              class="block text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1"
            >
              Endereço de E-mail
            </label>
            <BaseInput
              v-model="form.email"
              placeholder="roberto@empresa.com.br"
              :icon="Mail"
            />
          </div>

          <!-- Senha (apenas novo usuário) -->
          <div v-if="!isEditing">
            <label
              class="block text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-2 ml-1"
            >
              Senha de Acesso
            </label>
            <BaseInput
              v-model="form.senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              :icon="Lock"
            />
          </div>

          <!-- Configurações de Perfil -->
          <div
            class="flex flex-col gap-4 p-5 bg-primary/2 rounded-xl border border-border"
          >
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span
                  class="text-xs font-black uppercase tracking-tight text-primary"
                  >Privilégios Administrativos</span
                >
                <span
                  class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mt-0.5"
                  >Gestão total do sistema</span
                >
              </div>
              <BaseToggle v-model="form.admin" color-class="bg-brand" />
            </div>

            <div class="h-px bg-border/50"></div>

            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span
                  class="text-xs font-black uppercase tracking-tight text-primary"
                  >Status da Conta</span
                >
                <span
                  class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mt-0.5"
                  >Permitir login no sistema</span
                >
              </div>
              <BaseToggle v-model="form.ativo" color-class="bg-emerald-500" />
            </div>
          </div>

          <!-- Seleção de Empresas -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <Building2 size="16" class="text-brand" />
              <label
                class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40"
                >Empresas com Acesso</label
              >
            </div>
            <div
              class="grid grid-cols-1 gap-2 p-5 bg-primary/2 rounded-xl border border-border max-h-48 overflow-y-auto"
            >
              <div
                v-for="empresa in empresas"
                :key="empresa.id"
                class="flex items-center gap-3"
              >
                <BaseCheckbox
                  :model-value="form.idEmpresasAcesso.includes(empresa.id)"
                  @update:model-value="(val) => toggleEmpresa(empresa.id, val)"
                  :label="
                    empresa.empresa +
                    (empresa.filial ? ' - ' + empresa.filial : '')
                  "
                />
              </div>
              <div
                v-if="!empresas?.length"
                class="text-[10px] font-bold text-secondary opacity-40 uppercase py-2 text-center"
              >
                Carregando unidades...
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-3">
          <button
            @click="showUserModal = false"
            class="flex-1 px-6 py-3.5 rounded-2xl border border-border text-secondary font-bold text-sm hover:bg-primary/3 transition-all outline-none"
          >
            Cancelar
          </button>
          <button
            @click="saveUser"
            class="flex-2 bg-brand hover:bg-brand-hover text-background px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand/20 active:scale-95 flex items-center justify-center gap-2 outline-none disabled:opacity-50"
            :disabled="loading"
          >
            <template v-if="loading">
              <div
                class="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin"
              ></div>
            </template>
            <template v-else>
              {{ isEditing ? "Salvar Alterações" : "Criar Usuário" }}
            </template>
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Diálogo de Exclusão -->
    <BaseDialog
      :show="showDeleteDialog"
      title="Excluir Usuário"
      :description="`Tem certeza que deseja remover ${userToDelete?.nome}? Esta ação não pode ser desfeita e ele perderá o acesso imediatamente.`"
      variant="danger"
      confirm-label="Excluir Permanentemente"
      @close="showDeleteDialog = false"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Lock,
  User,
  AtSign,
  UserCog,
  Users,
  Building2,
  RefreshCw,
} from "lucide-vue-next";
import { useToast } from "~/composables/useToast";
import { useLogger } from "~/composables/useLogger";

definePageMeta({
  layout: "default",
  middleware: ["admin"],
});

const { add: addToast } = useToast();
const { info, error: logError } = useLogger();
const { data: users, refresh } = await useFetch("/api/usuarios");
const { data: empresas } = await useFetch("/api/empresas");

const searchTerm = ref("");
const itemsToShow = ref(20);
const loading = ref(false);
const error = ref("");
const showUserModal = ref(false);
const isEditing = ref(false);
const showDeleteDialog = ref(false);
const userToDelete = ref(null);

const form = reactive({
  id: null,
  nome: "",
  usuario: "",
  email: "",
  whatsapp: "",
  senha: "",
  admin: false,
  ativo: true,
  idEmpresasAcesso: [],
});

const filteredUsers = computed(() => {
  if (!users.value) return [];
  const term = searchTerm.value.toLowerCase();
  return users.value.filter(
    (u) =>
      u.nome.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.usuario.toLowerCase().includes(term),
  );
});

const displayedUsers = computed(() =>
  filteredUsers.value.slice(0, itemsToShow.value),
);

const openAddModal = () => {
  isEditing.value = false;
  Object.assign(form, {
    id: null,
    nome: "",
    usuario: "",
    email: "",
    whatsapp: "",
    senha: "",
    admin: false,
    ativo: true,
    idEmpresasAcesso: [],
  });
  showUserModal.value = true;
  error.value = "";
};

const openEditModal = (user) => {
  isEditing.value = true;
  // Extrair IDs das empresas que o usuário tem acesso
  const idsAcesso = user.acessoEmpresas?.map((a) => a.idEmpresa) || [];

  Object.assign(form, {
    ...user,
    admin: !!user.admin,
    ativo: !!user.ativo,
    idEmpresasAcesso: idsAcesso,
  });
  showUserModal.value = true;
  error.value = "";
};

const toggleEmpresa = (id, checked) => {
  if (checked) {
    if (!form.idEmpresasAcesso.includes(id)) {
      form.idEmpresasAcesso.push(id);
    }
  } else {
    form.idEmpresasAcesso = form.idEmpresasAcesso.filter((eid) => eid !== id);
  }
};

const saveUser = async () => {
  loading.value = true;
  error.value = "";

  try {
    const { user: authUser } = useAuth();
    if (!authUser.value) throw new Error("Sessão expirada");

    // Prepara o payload removendo campos nulos ou sensíveis
    const payload = {
      nome: form.nome,
      usuario: form.usuario,
      email: form.email,
      whatsapp: form.whatsapp || null,
      admin: !!form.admin,
      ativo: !!form.ativo,
      idEmpresa: authUser.value.idEmpresa,
      idEmpresasAcesso: form.idEmpresasAcesso,
    };

    // Só envia a senha se estiver preenchida (útil para POST ou troca de senha no PUT)
    if (form.senha) {
      payload.senha = form.senha;
    } else if (!isEditing.value) {
      throw new Error("A senha é obrigatória para novos usuários");
    }

    const url = isEditing.value ? `/api/usuarios/${form.id}` : "/api/usuarios";
    const method = isEditing.value ? "PUT" : "POST";

    await $fetch(url, {
      method,
      body: payload,
    });

    addToast(
      isEditing.value
        ? "Usuário atualizado com sucesso!"
        : "Usuário cadastrado com sucesso!",
      "success",
    );
    info(
      "USUARIOS",
      `${isEditing.value ? "Edição" : "Cadastro"} de usuário: ${form.usuario}`,
      { usuario: payload },
    );
    showUserModal.value = false;
    refresh();
  } catch (err) {
    addToast(err.message, "error");
    error.value = err.message;
    logError(
      "USUARIOS",
      `Erro ao ${isEditing.value ? "editar" : "cadastrar"} usuário`,
      { error: err.message, form },
    );
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (user) => {
  userToDelete.value = user;
  showDeleteDialog.value = true;
};

const handleDelete = async () => {
  try {
    await $fetch(`/api/usuarios/${userToDelete.value.id}`, {
      method: "DELETE",
    });

    addToast("Usuário excluído com sucesso!", "success");
    info("USUARIOS", `Usuário excluído: ${userToDelete.value.usuario}`, {
      id: userToDelete.value.id,
    });
    showDeleteDialog.value = false;
    refresh();
  } catch (err) {
    addToast(err.message, "error");
    logError(
      "USUARIOS",
      `Erro ao excluir usuário: ${userToDelete.value?.usuario}`,
      { error: err.message, id: userToDelete.value?.id },
    );
  }
};
</script>
