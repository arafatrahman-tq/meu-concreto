<template>
  <div class="min-h-screen bg-background pb-32">
    <!-- Mobile Header -->
    <header
      class="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-border px-6 py-6 flex items-center justify-between"
    >
      <button
        @click="confirmExit"
        class="p-2 -ml-2 text-secondary hover:text-primary transition-colors"
      >
        <X size="24" />
      </button>
      <div class="text-center">
        <h2 class="text-lg font-black tracking-tighter text-primary uppercase">
          Novo Orçamento
        </h2>
        <p class="text-[9px] font-black text-brand uppercase tracking-[0.2em]">
          Passo {{ step }} de 3
        </p>
      </div>
      <div class="w-10"></div>
      <!-- Spacer -->
    </header>

    <!-- Progress Bar -->
    <div
      class="h-1.5 w-full bg-primary/2 overflow-hidden sticky top-20.25 z-30"
    >
      <div
        class="h-full bg-brand transition-all duration-500"
        :style="{ width: `${(step / 3) * 100}%` }"
      ></div>
    </div>

    <!-- Main Content -->
    <main class="p-6 max-w-lg mx-auto">
      <form @submit.prevent>
        <!-- STEP 1: CLIENTE -->
        <div
          v-if="step === 1"
          class="space-y-8 animate-in slide-in-from-right-10 duration-500"
        >
          <div class="space-y-4">
            <h3
              class="text-2xl font-black text-primary tracking-tighter uppercase leading-none"
            >
              Quem é<br />o cliente?
            </h3>
            <p class="text-xs text-secondary font-medium leading-relaxed">
              Selecione um cliente cadastrado ou digite os dados abaixo.
            </p>
          </div>

          <div class="space-y-6">
            <div class="space-y-2">
              <label
                class="block text-[10px] font-black text-secondary uppercase tracking-widest ml-4"
                >Vincular Cadastro</label
              >
              <BaseAutocomplete
                v-model="form.idCliente"
                :options="autocompleteClienteOptions"
                :loading="isSearching"
                placeholder="Buscar cliente..."
                @search="onSearchCliente"
                @select="onClienteSelect"
                :icon="Search"
              />
            </div>

            <div class="space-y-2">
              <label
                class="block text-[10px] font-black text-secondary uppercase tracking-widest ml-4"
                >Nome do Cliente <span class="text-brand">*</span></label
              >
              <BaseInput
                v-model="form.nomeCliente"
                placeholder="Nome completo"
                :icon="User"
                required
                :error="errors.nomeCliente"
              />
            </div>

            <div class="space-y-2">
              <label
                class="block text-[10px] font-black text-secondary uppercase tracking-widest ml-4"
                >WhatsApp / Celular</label
              >
              <BaseInput
                v-model="form.telefone"
                placeholder="(00) 00000-0000"
                mask="phone"
                :icon="Phone"
                :error="errors.telefone"
              />
            </div>

            <div class="space-y-2">
              <label
                class="block text-[10px] font-black text-secondary uppercase tracking-widest ml-4"
                >CPF ou CNPJ</label
              >
              <BaseInput
                v-model="form.cpfCnpj"
                placeholder="Documento"
                mask="cpfCnpj"
                :icon="CreditCard"
                :error="errors.cpfCnpj"
              />
            </div>

            <div class="pt-6 border-t border-border mt-6">
              <div class="flex items-center gap-2 mb-4">
                <MapPin size="16" class="text-brand" />
                <h4
                  class="text-xs font-black text-primary uppercase tracking-widest"
                >
                  Local da Obra
                </h4>
              </div>

              <div class="space-y-6">
                <div class="space-y-2">
                  <div class="flex items-center gap-2 ml-4">
                    <label
                      class="block text-[10px] font-black text-secondary uppercase tracking-widest"
                      >CEP</label
                    >
                    <BaseTooltip
                      text="Os campos de endereço serão preenchidos automaticamente."
                    >
                      <HelpCircle size="12" class="text-brand/50 cursor-help" />
                    </BaseTooltip>
                  </div>
                  <BaseInput
                    v-model="form.cep"
                    placeholder="00000-000"
                    mask="cep"
                    @input="onCepInput"
                  />
                </div>

                <div class="space-y-2">
                  <label
                    class="block text-[10px] font-black text-secondary uppercase tracking-widest ml-4"
                    >Endereço da Obra</label
                  >
                  <BaseInput
                    v-model="form.enderecoEntrega"
                    placeholder="Rua, número, complemento"
                  />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label
                      class="block text-[10px] font-black text-secondary uppercase tracking-widest ml-4"
                      >Bairro</label
                    >
                    <BaseInput v-model="form.bairro" placeholder="Bairro" />
                  </div>
                  <div class="space-y-2">
                    <label
                      class="block text-[10px] font-black text-secondary uppercase tracking-widest ml-4"
                      >Cidade / UF</label
                    >
                    <div class="grid grid-cols-3 gap-2">
                      <BaseInput
                        v-model="form.cidade"
                        placeholder="Cidade"
                        class="col-span-2"
                      />
                      <BaseInput
                        v-model="form.estado"
                        placeholder="UF"
                        maxlength="2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 2: PRODUTO E QUANTIDADE -->
        <div
          v-if="step === 2"
          class="space-y-8 animate-in slide-in-from-right-10 duration-500"
        >
          <div class="space-y-4">
            <h3
              class="text-2xl font-black text-primary tracking-tighter uppercase leading-none"
            >
              O que<br />precisam?
            </h3>
            <p class="text-xs text-secondary font-medium leading-relaxed">
              Selecione os produtos e informe as quantidades em m³.
            </p>
          </div>

          <div class="space-y-12">
            <div
              v-for="(item, index) in form.itens"
              :key="index"
              class="space-y-6 p-6 rounded-[2rem] bg-surface border border-border relative"
            >
              <button
                v-if="form.itens.length > 1"
                @click="removeItem(index)"
                class="absolute -top-3 -right-3 w-8 h-8 bg-danger text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
              >
                <Trash2 size="14" />
              </button>

              <div class="space-y-2">
                <label
                  class="block text-[10px] font-black text-secondary uppercase tracking-widest ml-4"
                  >Produto {{ index + 1 }}
                  <span class="text-brand">*</span></label
                >
                <BaseSelect
                  v-model="item.idProduto"
                  :options="produtoOptions"
                  placeholder="Selecione o concreto"
                  @update:modelValue="onProdutoSelect($event, index)"
                  :icon="Package"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label
                    class="block text-[10px] font-black text-secondary uppercase tracking-widest ml-4"
                    >Qtd (m³) <span class="text-brand">*</span></label
                  >
                  <BaseInput
                    v-model.number="item.qtd"
                    type="number"
                    step="0.5"
                    placeholder="0.0"
                    :icon="Activity"
                    @input="calculateTotal"
                  />
                </div>
                <div class="space-y-2">
                  <label
                    class="block text-[10px] font-black text-secondary uppercase tracking-widest ml-4"
                    >Valor p/ m³ <span class="text-brand">*</span></label
                  >
                  <BaseInput
                    v-model.number="item.valorUnitDisplay"
                    type="number"
                    placeholder="0,00"
                    :icon="DollarSign"
                    @input="onItemValueInput(index)"
                  />
                </div>
              </div>
            </div>

            <button
              @click="addItem"
              class="w-full py-6 border-2 border-dashed border-border rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-secondary hover:text-brand hover:border-brand transition-all flex items-center justify-center gap-2"
            >
              <Plus size="16" />
              Adicionar outro produto
            </button>

            <div
              class="bg-primary/2 p-6 rounded-3xl border border-border flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand"
                >
                  <Truck size="20" />
                </div>
                <div>
                  <p
                    class="text-[10px] font-black text-primary uppercase tracking-widest"
                  >
                    Bomba Necessária?
                  </p>
                  <p
                    class="text-[9px] font-bold text-secondary uppercase tracking-widest leading-none mt-1"
                  >
                    Serviço de bombeamento
                  </p>
                </div>
              </div>
              <BaseCheckbox
                v-model="form.bombaNecessaria"
                @change="calculateTotal"
              />
            </div>

            <div
              v-if="form.bombaNecessaria"
              class="space-y-2 animate-in fade-in slide-in-from-top-4"
            >
              <label
                class="block text-[10px] font-black text-secondary uppercase tracking-widest ml-4"
                >Valor da Bomba</label
              >
              <BaseInput
                v-model.number="form.valorBombaDisplay"
                type="number"
                placeholder="R$ 0,00"
                :icon="DollarSign"
                @input="onValorBombaInput"
              />
            </div>
          </div>
        </div>

        <!-- STEP 3: RESUMO E PAGAMENTO -->
        <div
          v-if="step === 3"
          class="space-y-8 animate-in slide-in-from-right-10 duration-500"
        >
          <div class="space-y-4">
            <h3
              class="text-2xl font-black text-primary tracking-tighter uppercase leading-none"
            >
              Quase<br />lá...
            </h3>
            <p class="text-xs text-secondary font-medium leading-relaxed">
              Confira os valores e selecione a forma de pagamento.
            </p>
          </div>

          <div
            class="bg-surface border border-border rounded-[3rem] p-8 space-y-6 shadow-xl shadow-black/5 relative overflow-hidden"
          >
            <div class="absolute top-0 right-0 p-4 opacity-5 text-brand">
              <FileText size="80" />
            </div>

            <div class="space-y-4 relative z-10">
              <div
                class="flex justify-between items-center text-[10px] font-black text-secondary uppercase tracking-widest"
              >
                <span>Resumo</span>
                <span class="text-brand">Orçamento Mobile</span>
              </div>

              <!-- Address Summary -->
              <div
                v-if="form.enderecoEntrega"
                class="pb-4 border-b border-border/50 flex items-start gap-2"
              >
                <MapPin size="14" class="text-brand mt-1 shrink-0" />
                <div>
                  <p
                    class="text-[10px] font-black text-primary uppercase leading-tight"
                  >
                    {{ form.enderecoEntrega }}
                  </p>
                  <p
                    class="text-[9px] font-bold text-secondary uppercase leading-none mt-1"
                  >
                    {{ form.bairro }} - {{ form.cidade }}
                  </p>
                </div>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(item, idx) in form.itens"
                  :key="idx"
                  class="flex justify-between text-sm font-bold text-primary"
                >
                  <span class="flex-1 opacity-70"
                    >{{ item.produtoNome || "Produto" }} ({{
                      item.qtd
                    }}m³)</span
                  >
                  <span class="font-black">{{
                    formatCurrency(item.total)
                  }}</span>
                </div>
                <div
                  v-if="form.bombaNecessaria"
                  class="flex justify-between text-sm font-bold text-primary pt-2 border-t border-border/50"
                >
                  <span class="flex-1 opacity-70">Serviço de Bomba</span>
                  <span class="font-black">{{
                    formatCurrency(form.valorBomba)
                  }}</span>
                </div>
              </div>
              <div
                class="pt-4 border-t border-dashed border-border flex justify-between items-end"
              >
                <span
                  class="text-[11px] font-black text-secondary uppercase tracking-widest"
                  >Total Geral</span
                >
                <span class="text-3xl font-black text-brand tracking-tighter">{{
                  formatCurrency(form.total)
                }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="space-y-2">
              <label
                class="block text-[10px] font-black text-secondary uppercase tracking-widest ml-4"
                >Forma de Pagamento <span class="text-brand">*</span></label
              >
              <BaseSelect
                v-model="form.idFormaPgto"
                :options="formaPgtoOptions"
                placeholder="Selecione..."
                :icon="CreditCard"
                :error="errors.idFormaPgto"
              />
            </div>

            <div class="space-y-4">
              <label
                class="block text-[10px] font-black text-secondary uppercase tracking-widest ml-4"
                >Identificação do Vendedor (PIN)
                <span class="text-brand">*</span></label
              >
              <div class="flex gap-4">
                <div class="flex-1">
                  <BaseInput
                    v-model="form.vendedorPin"
                    type="password"
                    placeholder="PIN 4 dígitos"
                    :icon="Lock"
                    maxlength="4"
                    @input="onPinInput"
                  />
                </div>
                <div
                  v-if="form.vendedorNome"
                  class="flex-[1.5] flex items-center px-6 bg-brand/5 border border-brand/20 rounded-2xl animate-in fade-in zoom-in duration-300"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white"
                    >
                      <UserCheck size="16" />
                    </div>
                    <span
                      class="text-xs font-black text-brand uppercase truncate"
                      >{{ form.vendedorNome }}</span
                    >
                  </div>
                </div>
              </div>
              <p
                v-if="form.vendedorPin.length === 4 && !form.vendedorNome"
                class="text-[9px] font-bold text-danger uppercase tracking-widest ml-4 animate-pulse"
              >
                PIN Inválido ou Vendedor Inativo
              </p>
            </div>

            <div class="space-y-2">
              <label
                class="block text-[10px] font-black text-secondary uppercase tracking-widest ml-4"
                >Observações (Interno)</label
              >
              <textarea
                v-model="form.obs"
                class="w-full bg-primary/2 border border-border rounded-[2rem] py-4 px-6 text-sm font-bold text-primary placeholder:text-secondary/20 focus:ring-4 focus:ring-brand/10 transition-all outline-none"
                rows="3"
                placeholder="Algo importante sobre a obra?"
              ></textarea>
            </div>
          </div>
        </div>
      </form>
    </main>

    <!-- Navigation Actions -->
    <div
      class="fixed bottom-0 left-0 right-0 p-6 bg-surface/80 backdrop-blur-xl border-t border-border z-40 flex gap-4"
    >
      <button
        v-if="step > 1"
        @click="step--"
        class="flex-1 py-5 rounded-2xl border-2 border-border text-xs font-black uppercase tracking-widest text-secondary hover:bg-primary/2 transition-all"
      >
        Voltar
      </button>

      <button
        v-if="step < 3"
        @click="nextStep"
        class="flex-2 py-5 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10"
      >
        Próximo Passo
      </button>

      <button
        v-if="step === 3"
        @click="saveOrcamento"
        :disabled="saving"
        class="flex-2 py-5 bg-brand text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-brand/20 flex items-center justify-center gap-3"
      >
        <span
          v-if="saving"
          class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"
        ></span>
        {{ saving ? "Enviando..." : "Finalizar e Enviar" }}
      </button>
    </div>

    <!-- Success Confirmation Dialog -->
    <BaseDialog
      v-model="showSuccessDialog"
      title="Orçamento Criado!"
      message="O PDF foi enviado automaticamente para o seu WhatsApp. Deseja enviar também para o cliente?"
      confirm-label="Sim, Enviar para Cliente"
      variant="brand"
      @confirm="handleSendToClient"
      @close="handleFinishedSuccess"
    />
  </div>
</template>

<script setup>
import {
  X,
  User,
  Phone,
  Search,
  CreditCard,
  Package,
  Activity,
  DollarSign,
  Truck,
  FileText,
  CheckCircle,
  UserCheck,
  Plus,
  Trash2,
  MapPin,
  HelpCircle,
} from "lucide-vue-next";
import { generateOrcamentoPdf } from "~/utils/orcamentoPdf";

definePageMeta({
  layout: false,
});

const { user } = useAuth();
const toast = useToast();
const { sendMessage: sendWS } = useWhatsApp();

const errors = ref({});

const step = ref(1);
const saving = ref(false);
const showSuccessDialog = ref(false);
const lastOrcamentoId = ref(null);
const savedOrcamento = ref(null);

// Autocomplete Search
const isSearching = ref(false);
const searchResults = ref([]);
let searchTimeout = null;

const onSearchCliente = (term) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (!term || term.length < 2) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  searchTimeout = setTimeout(async () => {
    try {
      const data = await $fetch(`/api/search?q=${term}`);
      // Filter only clients from the flat list
      searchResults.value = (data.results || []).filter(
        (r) => r.category === "Clientes",
      );
    } catch (e) {
      console.error("Erro na busca:", e);
    } finally {
      isSearching.value = false;
    }
  }, 300);
};

const form = reactive({
  id: null,
  idCliente: null,
  nomeCliente: "",
  cpfCnpj: "",
  telefone: "",
  email: "",
  enderecoEntrega: "",
  bairro: "",
  cidade: "",
  cep: "",
  estado: "",
  // Header details (required by schema)
  idProduto: null,
  produtoNome: "",
  qtd: 0,
  valorUnit: 0,
  total: 0,
  // All items
  itens: [],
  idVendedor: null, // Resolvido via PIN
  vendedorNome: "", // Apenas exibição
  vendedorPin: "",
  idFormaPgto: null,
  idUsuario: user.value?.id,
  idEmpresa: user.value?.idEmpresa,
  bombaNecessaria: false,
  valorBomba: 0,
  valorBombaDisplay: 0,
  obs: "",
  status: "PENDENTE",
});

// Initialize with one empty item
onMounted(() => {
  addItem();
});

const addItem = () => {
  form.itens.push({
    idProduto: null,
    produtoNome: "",
    qtd: 0,
    valorUnit: 0,
    valorUnitDisplay: 0,
    total: 0,
  });
};

const removeItem = (index) => {
  if (form.itens.length > 1) {
    form.itens.splice(index, 1);
    calculateTotal();
  }
};

const { data: produtos } = useFetch("/api/produtos");
const { data: formasPgto } = useFetch("/api/forma-pgto");
const { data: vendedores } = useFetch("/api/vendedores");

const autocompleteClienteOptions = computed(() =>
  searchResults.value.map((c) => ({
    label: c.title,
    value: c.id,
    sublabel: c.subtitle,
  })),
);

const produtoOptions = computed(
  () =>
    produtos.value
      ?.filter((p) => p.ativo)
      .map((p) => ({ label: p.produto, value: p.id })) || [],
);
const formaPgtoOptions = computed(
  () =>
    formasPgto.value?.map((f) => ({ label: f.formaPagamento, value: f.id })) ||
    [],
);
const vendedorOptions = computed(
  () =>
    vendedores.value
      ?.filter((v) => v.ativo)
      .map((v) => ({ label: v.nome, value: v.id })) || [],
);

const onPinInput = () => {
  if (form.vendedorPin?.length === 4) {
    const v = vendedores.value?.find(
      (v) => v.pin === form.vendedorPin && v.ativo,
    );
    if (v) {
      form.idVendedor = v.id;
      form.vendedorNome = v.nome;
    } else {
      form.idVendedor = null;
      form.vendedorNome = "";
    }
  } else {
    form.idVendedor = null;
    form.vendedorNome = "";
  }
};

const onClienteSelect = async (id) => {
  if (!id) return;
  try {
    const cliente = await $fetch(`/api/clientes/${id}`);
    if (cliente) {
      form.nomeCliente = cliente.nome;
      form.cpfCnpj = cliente.cpfCnpj;
      form.telefone = cliente.telefone;
      form.enderecoEntrega = cliente.enderecoEntrega || cliente.endereco || "";
      form.bairro = cliente.bairro || "";
      form.cidade = cliente.cidade || "";
      form.cep = cliente.cep || "";
      form.estado = cliente.estado || "";
    }
  } catch (e) {
    console.error("Erro ao carregar detalhes do cliente:", e);
  }
};

const onCepInput = async () => {
  const cleanCep = form.cep?.replace(/\D/g, "");
  if (cleanCep?.length === 8) {
    try {
      const { data } = await useFetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );
      if (data.value && !data.value.erro) {
        form.enderecoEntrega = data.value.logradouro;
        form.bairro = data.value.bairro;
        form.cidade = data.value.localidade;
        form.estado = data.value.uf;
      }
    } catch (e) {
      console.error("Erro ao buscar CEP:", e);
    }
  }
};

const onProdutoSelect = (id, index) => {
  const produto = produtos.value?.find((p) => p.id === id);
  const item = form.itens[index];
  if (produto && item) {
    item.produtoNome = produto.produto;
    item.valorUnit = produto.valorVenda || 0;
    item.valorUnitDisplay = item.valorUnit / 100;
    calculateTotal();
  }
};

const onItemValueInput = (index) => {
  const item = form.itens[index];
  item.valorUnit = Math.round(item.valorUnitDisplay * 100);
  calculateTotal();
};

const onValorBombaInput = () => {
  form.valorBomba = Math.round(form.valorBombaDisplay * 100);
  calculateTotal();
};

const calculateTotal = () => {
  let subtotal = 0;
  form.itens.forEach((item) => {
    item.total = Math.round(item.qtd * item.valorUnit);
    subtotal += item.total;
  });

  const vBomba = form.bombaNecessaria ? form.valorBomba : 0;
  form.total = subtotal + vBomba;

  // Sync first item to header for schema compatibility
  if (form.itens.length > 0) {
    const first = form.itens[0];
    form.idProduto = first.idProduto;
    form.produtoNome = first.produtoNome;
    form.qtd = first.qtd;
    form.valorUnit = first.valorUnit;
  }
};

const nextStep = () => {
  if (step.value === 1 && !form.nomeCliente) {
    toast.add({
      title: "Atenção",
      description: "O nome do cliente é obrigatório.",
      type: "warn",
    });
    return;
  }
  if (step.value === 2) {
    const invalid = form.itens.some((item) => !item.idProduto || item.qtd <= 0);
    if (invalid) {
      toast.add({
        title: "Atenção",
        description: "Todos os produtos devem ter seleção e quantidade.",
        type: "warn",
      });
      return;
    }
  }
  step.value++;
};

const saveOrcamento = async () => {
  errors.value = {};
  if (!form.idFormaPgto || !form.idVendedor) {
    toast.add({
      title: "Atenção",
      description: "Selecione a forma de pagamento e o vendedor.",
      type: "warn",
    });
    return;
  }

  try {
    saving.value = true;
    const payload = {
      ...form,
      itens: form.itens.map((i) => ({
        idProduto: i.idProduto,
        produtoNome: i.produtoNome,
        qtd: i.qtd,
        valorUnit: i.valorUnit,
        total: i.total,
      })),
    };

    const response = await $fetch("/api/orcamentos", {
      method: "POST",
      body: payload,
    });

    lastOrcamentoId.value = response.id;
    savedOrcamento.value = { ...response, itens: payload.itens }; // Anexa os itens para o PDF

    // Enviar PDF automaticamente para o Vendedor
    const v = vendedores.value?.find((v) => v.id === form.idVendedor);
    if (v && v.telefone) {
      try {
        const pdfBase64 = generateOrcamentoPdf(
          savedOrcamento.value,
          user.value?.empresa,
        );
        await sendWS(v.telefone, {
          document: pdfBase64,
          fileName: `Orcamento_${String(response.id).padStart(4, "0")}.pdf`,
          mimetype: "application/pdf",
          caption: `Novo Orçamento Gerado: #${String(response.id).padStart(4, "0")} para ${form.nomeCliente}.`,
        });
        toast.add({
          title: "Cópia Enviada",
          description: "O orçamento foi enviado para seu WhatsApp.",
          type: "success",
        });
      } catch (err) {
        console.error("Erro ao enviar para vendedor:", err);
        toast.add({
          title: "Aviso",
          description: "Não foi possível enviar sua cópia via WhatsApp.",
          type: "warn",
        });
      }
    }

    showSuccessDialog.value = true;
  } catch (err) {
    const msg =
      err.data?.message || err.message || "Falha ao salvar orçamento.";

    // Tentar mapear erros de validação Zod
    if (err.data?.message && err.data.message.includes(":")) {
      const parts = err.data.message.split(", ");
      parts.forEach((p) => {
        const [field, m] = p.split(": ");
        if (field && m) errors.value[field] = m;
      });
    }

    toast.add({ title: "Erro", description: msg, type: "error" });
  } finally {
    saving.value = false;
  }
};

const resetForm = () => {
  step.value = 1;
  Object.assign(form, {
    id: null,
    idCliente: null,
    nomeCliente: "",
    cpfCnpj: "",
    telefone: "",
    email: "",
    enderecoEntrega: "",
    bairro: "",
    cidade: "",
    cep: "",
    estado: "",
    idProduto: null,
    produtoNome: "",
    qtd: 0,
    valorUnit: 0,
    total: 0,
    itens: [],
    idVendedor: null,
    vendedorNome: "",
    vendedorPin: "",
    idFormaPgto: null,
    bombaNecessaria: false,
    valorBomba: 0,
    valorBombaDisplay: 0,
    obs: "",
    status: "PENDENTE",
  });
  addItem();
};

const handleSendToClient = async () => {
  if (!form.telefone) {
    toast.add({
      title: "Atenção",
      description: "Cliente sem telefone informado.",
      type: "warn",
    });
    return;
  }

  try {
    const pdfBase64 = generateOrcamentoPdf(
      savedOrcamento.value,
      user.value?.empresa,
    );

    await sendWS(form.telefone, {
      document: pdfBase64,
      fileName: `Orcamento_${String(lastOrcamentoId.value).padStart(4, "0")}.pdf`,
      mimetype: "application/pdf",
      caption: `Olá ${form.nomeCliente}, conforme conversamos, segue em anexo o seu orçamento.`,
    });

    setTimeout(() => {
      showSuccessDialog.value = false;
      resetForm();
    }, 1500);
  } catch (error) {
    console.error("Erro ao enviar para cliente:", error);
  }
};

const handleFinishedSuccess = () => {
  showSuccessDialog.value = false;
  resetForm();
};

const confirmExit = () => {
  if (confirm("Deseja cancelar a criação deste orçamento?")) {
    navigateTo("/orcamentos");
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
};
</script>

<style scoped>
.animate-enter {
  animation: enter 0.5s ease-out;
}

@keyframes enter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
