<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Orçamentos
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Cotações de concreto e serviços em aberto
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
            placeholder="Buscar por cliente ou ID..."
            class="pl-12 pr-4 py-3.5 bg-primary/2 border border-border rounded-2xl text-sm font-black uppercase tracking-widest text-primary placeholder:text-secondary/20 w-full md:w-80 focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all outline-none"
          />
        </div>
        <button
          @click="openAddModal"
          class="bg-brand text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-brand/20"
        >
          <Plus size="20" />
          Novo Orçamento
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div
      class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden"
    >
      <BaseTable
        :headers="['ID', 'Cliente', 'Produtos', 'Total', 'Status', '']"
      >
        <tr
          v-for="orcamento in displayedOrcamentos"
          :key="orcamento.id"
          class="group hover:bg-primary/2 transition-colors"
        >
          <td class="px-8 py-5">
            <span
              class="text-xs font-black text-secondary opacity-40 tabular-nums"
              >#{{ String(orcamento.id).padStart(4, "0") }}</span
            >
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col">
              <span
                class="text-sm font-black uppercase tracking-tight text-primary"
                >{{ orcamento.nomeCliente }}</span
              >
              <span
                class="text-[10px] font-black uppercase opacity-30 mt-0.5 tracking-widest"
                >{{ orcamento.cpfCnpj }}</span
              >
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col gap-1">
              <div
                v-for="item in orcamento.itens"
                :key="item.id"
                class="flex flex-col"
              >
                <span
                  class="text-xs font-black uppercase tracking-tight text-primary"
                  >{{ item.produtoNome }}</span
                >
                <span
                  class="text-[9px] font-black uppercase opacity-30 tracking-widest"
                  >{{ item.qtd }} m³ @
                  {{ formatCurrency(item.valorUnit) }}</span
                >
              </div>
              <div v-if="!orcamento.itens?.length" class="flex flex-col">
                <span
                  class="text-xs font-black uppercase tracking-tight text-primary"
                  >{{ orcamento.produtoNome || "N/A" }}</span
                >
                <span
                  class="text-[9px] font-black uppercase opacity-30 tracking-widest"
                  >{{ orcamento.qtd }} m³</span
                >
              </div>
            </div>
          </td>
          <td class="px-8 py-5">
            <span
              class="text-sm font-black uppercase tracking-tight text-brand"
            >
              {{ formatCurrency(orcamento.total) }}
            </span>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full shadow-[0_0_10px]',
                  statusColor[orcamento.status],
                ]"
              ></div>
              <span
                class="text-[10px] font-black uppercase tracking-widest"
                :class="statusTextColor[orcamento.status]"
              >
                {{ orcamento.status }}
              </span>
            </div>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center justify-end gap-2">
              <BaseTooltip text="Enviar Resumo WhatsApp">
                <button
                  @click="sendWhatsAppOrcamento(orcamento)"
                  class="p-2.5 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:scale-110 active:scale-95 transition-all"
                >
                  <MessageSquare size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Enviar PDF WhatsApp">
                <button
                  @click="sendWhatsAppDocument(orcamento)"
                  class="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:scale-110 active:scale-95 transition-all"
                >
                  <FileText size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Baixar PDF / Imprimir">
                <button
                  @click="downloadOrcamentoPdf(orcamento)"
                  class="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:scale-110 active:scale-95 transition-all"
                >
                  <Printer size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip
                v-if="orcamento.status === 'PENDENTE'"
                text="Aprovar"
              >
                <button
                  @click="approveOrcamento(orcamento)"
                  class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:scale-110 active:scale-95 transition-all"
                >
                  <CheckCircle size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Editar">
                <button
                  @click="openEditModal(orcamento)"
                  class="p-2.5 rounded-xl bg-primary/3 text-secondary hover:text-brand hover:scale-110 active:scale-95 transition-all"
                >
                  <Edit3 size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Excluir">
                <button
                  @click="confirmDelete(orcamento)"
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
      <div
        v-if="!filteredOrcamentos.length && !loading"
        class="p-20 text-center"
      >
        <div
          class="w-16 h-16 bg-primary/2 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border"
        >
          <FileText size="32" class="text-secondary/20" />
        </div>
        <h3 class="text-lg font-black uppercase tracking-tight text-primary">
          Nenhum orçamento encontrado
        </h3>
        <p
          class="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-50"
        >
          Gere novos orçamentos para converter em vendas e entregas.
        </p>
      </div>
    </div>

    <!-- Pagination / Infinite Load -->
    <div
      v-if="filteredOrcamentos.length > itemsToShow"
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
        Carregar mais orçamentos
      </button>
    </div>

    <!-- Add/Edit Modal -->
    <BaseModal
      v-model="showModal"
      :title="isEditing ? 'Editar Orçamento' : 'Novo Orçamento'"
      size="xl"
    >
      <form @submit.prevent="saveOrcamento" class="pt-2">
        <div class="space-y-6 pb-6">
          <!-- SECTION 1: Identificação e Comercial -->
          <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <!-- Left: Cliente (7 cols) -->
            <div class="xl:col-span-8 space-y-4">
              <div class="flex items-center gap-2 mb-1 px-1">
                <User size="14" class="text-brand" />
                <h4
                  class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
                >
                  Identificação do Cliente
                </h4>
              </div>
              <div
                class="bg-primary/2 p-6 rounded-3xl border border-border space-y-5"
              >
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div class="md:col-span-8 space-y-1.5">
                    <label
                      class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
                      >Vincular Cadastro</label
                    >
                    <BaseSelect
                      v-model="form.idCliente"
                      :options="clienteOptions"
                      placeholder="Pesquisar cliente..."
                      @update:modelValue="onClienteSelect"
                      :icon="Search"
                    />
                  </div>
                  <div class="md:col-span-4 space-y-1.5">
                    <label
                      class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
                      >Documento</label
                    >
                    <BaseInput
                      v-model="form.cpfCnpj"
                      placeholder="CPF/CNPJ"
                      mask="cpfCnpj"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div class="md:col-span-8 space-y-1.5">
                    <label
                      class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
                      >Nome (Exibição no Orçamento)</label
                    >
                    <BaseInput
                      v-model="form.nomeCliente"
                      placeholder="Ex: João da Silva"
                      :icon="User"
                      required
                    />
                  </div>
                  <div class="md:col-span-4 space-y-1.5">
                    <label
                      class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
                      >Contato</label
                    >
                    <BaseInput
                      v-model="form.telefone"
                      placeholder="(00) 00000-0000"
                      mask="phone"
                      :icon="Phone"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Comercial (4 cols) -->
            <div class="xl:col-span-4 space-y-4">
              <div class="flex items-center gap-2 mb-1 px-1">
                <CreditCard size="14" class="text-brand" />
                <h4
                  class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
                >
                  Condições Comerciais
                </h4>
              </div>
              <div
                class="bg-primary/2 p-6 rounded-3xl border border-border space-y-4 h-[calc(100%-1.75rem)]"
              >
                <div class="space-y-1.5">
                  <label
                    class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
                    >Vendedor</label
                  >
                  <BaseSelect
                    v-model="form.idVendedor"
                    :options="vendedorOptions"
                    placeholder="Selecionar..."
                    :icon="UserCheck"
                    required
                  />
                </div>
                <div class="space-y-1.5">
                  <label
                    class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
                    >Forma de PGTO</label
                  >
                  <BaseSelect
                    v-model="form.idFormaPgto"
                    :options="formaPgtoOptions"
                    placeholder="Selecione..."
                    :icon="DollarSign"
                    required
                  />
                </div>
                <div class="space-y-1.5">
                  <label
                    class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
                    >Validade da Cotação</label
                  >
                  <BaseInput
                    v-model="form.validadeOrcamento"
                    type="date"
                    :icon="Calendar"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 2: Itens do Orçamento -->
          <div class="space-y-4">
            <div class="flex items-center justify-between px-2">
              <div class="flex items-center gap-2">
                <Layers size="14" class="text-emerald-500" />
                <h4
                  class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
                >
                  Composição da Venda
                </h4>
              </div>
              <button
                type="button"
                @click="addItem"
                class="h-8 px-4 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Plus size="14" /> Adicionar Traço
              </button>
            </div>

            <div
              class="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar border border-border/50 rounded-3xl p-2 bg-primary/1"
            >
              <div
                v-for="(item, index) in form.itens"
                :key="index"
                class="group/item relative bg-surface rounded-2xl border border-border p-4 hover:border-emerald-500/30 transition-all"
              >
                <button
                  v-if="form.itens.length > 1"
                  type="button"
                  @click="removeItem(index)"
                  class="absolute -right-2 -top-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all shadow-xl z-20 hover:scale-110"
                >
                  <X size="12" />
                </button>
                <div
                  class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                >
                  <div class="md:col-span-5 space-y-1">
                    <label
                      class="text-[8px] font-black uppercase tracking-widest text-secondary opacity-30 ml-2"
                      >Produto / Traço</label
                    >
                    <BaseSelect
                      v-model="item.idProduto"
                      :options="produtoOptions"
                      placeholder="Selecione..."
                      @update:modelValue="
                        (val) => onItemProdutoSelect(val, index)
                      "
                      :icon="Package"
                      required
                    />
                  </div>
                  <div class="md:col-span-2 space-y-1 text-center">
                    <label
                      class="text-[8px] font-black uppercase tracking-widest text-secondary opacity-30"
                      >Volume (m³)</label
                    >
                    <BaseInput
                      v-model.number="item.qtd"
                      type="number"
                      step="0.5"
                      placeholder="0.0"
                      @input="calculateItemTotal(index)"
                      required
                      class="text-center"
                    />
                  </div>
                  <div class="md:col-span-2 space-y-1 text-right">
                    <label
                      class="text-[8px] font-black uppercase tracking-widest text-secondary opacity-30 pr-2"
                      >R$ Unit</label
                    >
                    <BaseInput
                      v-model.number="item.valorUnit"
                      type="number"
                      step="0.01"
                      @input="calculateItemTotal(index)"
                      required
                      class="text-right"
                    />
                  </div>
                  <div
                    class="md:col-span-3 flex flex-col justify-center pl-4 border-l border-border"
                  >
                    <span
                      class="text-[8px] font-black uppercase tracking-[0.2em] text-secondary opacity-30"
                      >Subtotal Item</span
                    >
                    <span
                      class="text-sm font-black text-emerald-500 tabular-nums"
                      >{{ formatCurrency(item.total * 100) }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 3: Logística e Distribuição -->
          <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <!-- Left: Escala e Obs (8 cols) -->
            <div class="xl:col-span-8 space-y-4">
              <div class="flex items-center gap-2 mb-1 px-1">
                <Truck size="14" class="text-amber-500" />
                <h4
                  class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
                >
                  Escala de Frota e Notas
                </h4>
              </div>
              <div class="bg-primary/2 p-6 rounded-3xl border border-border">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-4">
                    <div class="space-y-1.5">
                      <label
                        class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
                        >Motorista Responsável</label
                      >
                      <BaseSelect
                        v-model="form.idMotorista"
                        :options="motoristaOptions"
                        placeholder="Selecione..."
                        @update:modelValue="onMotoristaSelect"
                        :icon="User"
                      />
                    </div>
                    <div class="space-y-1.5">
                      <label
                        class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
                        >Caminhão / Placa</label
                      >
                      <BaseSelect
                        v-model="form.idCaminhao"
                        :options="caminhaoOptions"
                        placeholder="Selecione..."
                        :icon="Truck"
                      />
                      <div
                        v-if="capacityWarning"
                        class="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-1"
                      >
                        <AlertTriangle
                          size="12"
                          class="text-amber-600 mt-0.5"
                        />
                        <span
                          class="text-[8px] font-bold text-amber-700 leading-tight uppercase tracking-wider"
                          >{{ capacityWarning }}</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="space-y-1.5">
                    <label
                      class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
                      >Observações da Entrega</label
                    >
                    <textarea
                      v-model="form.obs"
                      placeholder="Notas sobre a obra, horários ou restrições..."
                      class="w-full h-[calc(100%-1.5rem)] bg-primary/2 border border-border rounded-2xl p-4 text-xs font-bold text-primary placeholder:text-secondary/20 focus:ring-2 focus:ring-brand/20 outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Prazos e Adicionais (4 cols) -->
            <div class="xl:col-span-4 space-y-4">
              <div class="flex items-center gap-2 mb-1 px-1">
                <MapPin size="14" class="text-blue-500" />
                <h4
                  class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
                >
                  Logística de Entrega
                </h4>
              </div>
              <div
                class="bg-primary/2 p-6 rounded-3xl border border-border space-y-4"
              >
                <div class="space-y-1.5">
                  <label
                    class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
                    >Data/Hora de Entrega</label
                  >
                  <BaseInput
                    v-model="form.dataEntrega"
                    type="datetime-local"
                    :icon="Clock"
                  />
                </div>
                <div class="space-y-1.5">
                  <label
                    class="text-[9px] font-bold uppercase tracking-widest text-secondary opacity-40 ml-2"
                    >Distância Estimada (KM)</label
                  >
                  <BaseInput
                    v-model.number="form.distanciaObra"
                    type="number"
                    step="0.1"
                    :icon="MapPin"
                    placeholder="0.0 km"
                  />
                </div>
                <div
                  class="p-4 bg-surface rounded-2xl border border-border flex items-center justify-between"
                >
                  <div class="flex flex-col">
                    <span
                      class="text-[9px] font-black uppercase tracking-widest text-primary"
                      >Serviço de Bomba</span
                    >
                    <span
                      class="text-[8px] font-bold uppercase opacity-30 mt-0.5"
                      >Taxa de Operação</span
                    >
                  </div>
                  <label
                    class="relative inline-flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      v-model="form.bombaNecessaria"
                      class="sr-only peer"
                      @change="calculateTotal"
                    />
                    <div
                      class="w-10 h-5 bg-primary/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"
                    ></div>
                  </label>
                </div>
                <div
                  v-if="form.bombaNecessaria"
                  class="animate-in fade-in zoom-in duration-300"
                >
                  <BaseInput
                    v-model.number="form.valorBomba"
                    type="number"
                    step="1"
                    :icon="DollarSign"
                    @input="calculateTotal"
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- TOTALIZAÇÃO FINAL E AÇÕES -->
          <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-end">
            <div class="xl:col-span-7">
              <div
                class="flex items-center gap-4 text-secondary opacity-40 px-2"
              >
                <div class="h-px flex-1 bg-border"></div>
                <span class="text-[8px] font-black uppercase tracking-[0.4em]"
                  >Resumo Financeiro</span
                >
                <div class="h-px flex-1 bg-border"></div>
              </div>
            </div>
            <div class="xl:col-span-5">
              <div
                class="bg-brand p-6 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group"
              >
                <div
                  class="absolute -right-4 -top-4 opacity-[0.05] group-hover:opacity-10 transition-opacity"
                >
                  <DollarSign size="80" class="text-white" />
                </div>
                <div class="space-y-4 relative z-10">
                  <div class="flex items-center justify-between">
                    <span
                      class="text-[8px] font-black uppercase tracking-[0.3em] text-white/40"
                      >Total do Orçamento</span
                    >
                    <div class="flex items-center gap-6">
                      <div class="flex flex-col items-end">
                        <span
                          class="text-[8px] font-bold text-white/40 uppercase"
                          >Subtotal</span
                        >
                        <span class="text-xs font-black text-white/70">{{
                          formatCurrency(totalItens * 100)
                        }}</span>
                      </div>
                      <div class="flex flex-col items-end">
                        <span
                          class="text-[8px] font-bold text-white/40 uppercase tracking-widest"
                          >Desconto R$</span
                        >
                        <input
                          v-model.number="form.valorDesconto"
                          type="number"
                          class="w-20 bg-white/10 rounded-lg border border-white/10 text-right text-[10px] font-black text-white px-2 py-1 focus:ring-2 focus:ring-white/20 outline-none"
                          @input="calculateTotal"
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    class="flex items-center justify-between pt-2 border-t border-white/10"
                  >
                    <div class="flex flex-col">
                      <span
                        class="text-[8px] font-black uppercase tracking-[0.3em] text-white/40"
                        >Valor Total Líquido</span
                      >
                      <span
                        class="text-[7px] font-bold text-white/20 uppercase mt-0.5 tracking-[0.2em]"
                        >Impostos Inclusos</span
                      >
                    </div>
                    <h3
                      class="text-4xl font-black text-white tracking-tighter tabular-nums"
                    >
                      {{ formatCurrency(form.total * 100) }}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SUBMIT BUTTON FULL WIDTH -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary text-background py-5 rounded-3xl text-xs font-black uppercase tracking-[0.3em] hover:bg-brand hover:scale-[1.01] active:scale-[0.99] transition-all shadow-2xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <template v-if="loading">
              <div
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></div>
              Processando Cotação...
            </template>
            <template v-else>
              <CheckCircle size="18" />
              {{
                isEditing
                  ? "Atualizar Cotação de Venda"
                  : "Salvar e Gerar Orçamento Oficial"
              }}
            </template>
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Confirmation Dialog -->
    <BaseDialog
      v-model="showDeleteDialog"
      title="Remover Orçamento"
      :message="`Tem certeza que deseja cancelar e remover o orçamento #${String(orcamentoToDelete?.id).padStart(4, '0')}?`"
      variant="danger"
      @confirm="handleDelete"
    />

    <!-- Lacre Approval Modal -->
    <BaseModal v-model="showLacreModal" title="Aprovar com Lacre" size="sm">
      <div class="space-y-6 pt-2">
        <div
          class="p-6 bg-brand/5 rounded-3xl border border-brand/10 text-center"
        >
          <div
            class="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Lock size="32" />
          </div>
          <h3 class="text-lg font-black text-primary tracking-tight uppercase">
            Código do Lacre
          </h3>
          <p
            class="text-[10px] font-black uppercase tracking-widest text-secondary/40 mt-1"
          >
            Controle de Segurança e Entrega
          </p>
        </div>

        <div class="space-y-2">
          <label
            class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2"
            >Identificação do Lacre</label
          >
          <BaseInput
            v-model="lacreCode"
            placeholder="Ex: LC-0045"
            :icon="Lock"
            required
            ref="lacreInput"
          />
        </div>

        <div class="flex gap-3">
          <button
            @click="showLacreModal = false"
            class="flex-1 px-6 py-4 border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-primary/5 transition-all outline-none"
          >
            Cancelar
          </button>
          <button
            @click="confirmApproval"
            :disabled="!lacreCode || loadingApproval"
            class="flex-2 bg-brand text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand/20 disabled:opacity-30 outline-none"
          >
            {{ loadingApproval ? "Aprovando..." : "Finalizar e Aprovar" }}
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  FileText,
  CheckCircle,
  User,
  Users,
  Phone,
  Package,
  Layers,
  Box,
  DollarSign,
  MapPin,
  Calendar,
  CreditCard,
  UserCheck,
  HelpCircle,
  X,
  Clock,
  MessageSquare,
  Truck,
  AlertTriangle,
  Lock,
  Printer,
  RefreshCw,
} from "lucide-vue-next";
import { useToast } from "~/composables/useToast";
import { useLogger } from "~/composables/useLogger";
import { useWhatsApp } from "~/composables/useWhatsApp";
import { useAuth } from "~/composables/useAuth";
import { generateOrcamentoPdf } from "~/utils/orcamentoPdf";

definePageMeta({ layout: "default" });

const { add: addToast } = useToast();
const { info, error: logError } = useLogger();
const { sendMessage: sendWS, loading: wsLoading } = useWhatsApp();
const { user } = useAuth();
const route = useRoute();

// Data Fetching
const [
  { data: orcamentos, refresh },
  { data: clientes },
  { data: produtos },
  { data: vendedores },
  { data: formasPgto },
  { data: motoristas },
  { data: caminhoes },
] = await Promise.all([
  useFetch("/api/orcamentos"),
  useFetch("/api/clientes"),
  useFetch("/api/produtos"),
  useFetch("/api/vendedores"),
  useFetch("/api/forma-pgto"),
  useFetch("/api/motoristas"),
  useFetch("/api/caminhoes"),
]);

// Watch for deep changes in orcamentos or query to open modal
watch(
  [() => route.query.id, orcamentos],
  ([id, list]) => {
    if (id && list?.length) {
      const orcId = parseInt(id);
      const orc = list.find((o) => o.id === orcId);
      if (orc && !showModal.value) {
        openEditModal(orc);
      }
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (route.query.q) {
    searchTerm.value = String(route.query.q);
  }
});

const searchTerm = ref("");
const itemsToShow = ref(20);
const loading = ref(false);
const error = ref("");
const showModal = ref(false);
const isEditing = ref(false);
const showDeleteDialog = ref(false);
const orcamentoToDelete = ref(null);
const showLacreModal = ref(false);
const loadingApproval = ref(false);
const lacreCode = ref("");
const selectedOrcamentoForApproval = ref(null);

const statusColor = {
  PENDENTE: "bg-amber-500 shadow-amber-500/50",
  APROVADO: "bg-emerald-500 shadow-emerald-500/50",
  CANCELADO: "bg-rose-500 shadow-rose-500/50",
  VENCIDO: "bg-secondary/40 shadow-secondary/10",
};

const statusTextColor = {
  PENDENTE: "text-amber-600 dark:text-amber-400",
  APROVADO: "text-emerald-600 dark:text-emerald-400",
  CANCELADO: "text-rose-600 dark:text-rose-400",
  VENCIDO: "text-gray-600 dark:text-gray-400",
};

const form = reactive({
  id: null,
  idCliente: null,
  nomeCliente: "",
  cpfCnpj: "",
  itens: [],
  idVendedor: null,
  idFormaPgto: null,
  idMotorista: null,
  idCaminhao: null,
  telefone: "",
  email: "",
  endereco: "",
  enderecoEntrega: "",
  bairro: "",
  cidade: "",
  estado: "MG",
  cep: "",
  validadeOrcamento: "",
  distanciaObra: 0,
  bombaNecessaria: false,
  valorBomba: 0,
  valorDesconto: 0,
  status: "PENDENTE",
  obs: "",
  total: 0,
});

// Options for selects
const clienteOptions = computed(() =>
  (clientes.value || []).map((c) => ({ label: c.nome, value: c.id })),
);
const produtoOptions = computed(() =>
  (produtos.value || []).map((p) => ({ label: p.produto, value: p.id })),
);
const vendedorOptions = computed(() =>
  (vendedores.value || []).map((v) => ({ label: v.nome, value: v.id })),
);
const formaPgtoOptions = computed(() =>
  (formasPgto.value || []).map((f) => ({
    label: f.formaPagamento,
    value: f.id,
  })),
);
const motoristaOptions = computed(() =>
  (motoristas.value || []).map((m) => ({ label: m.nome, value: m.id })),
);
const caminhaoOptions = computed(() =>
  (caminhoes.value || []).map((c) => ({
    label: `${c.placa} - ${c.modelo}`,
    value: c.id,
  })),
);

const capacityWarning = computed(() => {
  if (!form.idCaminhao || !form.itens.length) return null;
  const caminhao = caminhoes.value.find((c) => c.id === form.idCaminhao);
  if (!caminhao) return null;

  const totalQtd = form.itens.reduce((acc, i) => acc + (i.qtd || 0), 0);
  if (totalQtd > caminhao.capacidade) {
    return `Atenção: Volume total (${totalQtd}m³) excede a capacidade do caminhão (${caminhao.capacidade}m³). Serão necessárias múltiplas viagens.`;
  }
  return null;
});

const filteredOrcamentos = computed(() => {
  if (!orcamentos.value) return [];
  const term = searchTerm.value.toLowerCase();
  return orcamentos.value.filter(
    (o) =>
      o.nomeCliente.toLowerCase().includes(term) || String(o.id).includes(term),
  );
});

const displayedOrcamentos = computed(() => {
  return filteredOrcamentos.value.slice(0, itemsToShow.value);
});

const addItem = () => {
  form.itens.push({
    idProduto: null,
    produtoNome: "",
    qtd: 0,
    valorUnit: 0,
    total: 0,
  });
};

const removeItem = (index) => {
  form.itens.splice(index, 1);
  calculateTotal();
};

const totalItens = computed(() => {
  return form.itens.reduce((acc, item) => acc + (item.total || 0), 0);
});

const calculateItemTotal = (index) => {
  const item = form.itens[index];
  item.total = (item.qtd || 0) * (item.valorUnit || 0);
  calculateTotal();
};

const calculateTotal = () => {
  let base = totalItens.value;
  if (form.bombaNecessaria) base += form.valorBomba || 0;
  base -= form.valorDesconto || 0;
  form.total = Math.max(0, base);
};

const onClienteSelect = (id) => {
  const cliente = clientes.value.find((c) => c.id === id);
  if (cliente) {
    form.nomeCliente = cliente.nome;
    form.cpfCnpj = cliente.cpfCnpj;
    form.telefone = cliente.telefone;
    form.email = cliente.email;
    form.endereco = cliente.endereco;
    form.enderecoEntrega = cliente.enderecoEntrega;
    form.cidade = cliente.cidade;
    form.estado = cliente.estado;
    form.cep = cliente.cep;
    form.bairro = cliente.bairro;
  }
};

const onMotoristaSelect = (id) => {
  const motorista = motoristas.value.find((m) => m.id === id);
  if (motorista && motorista.idCaminhao) {
    form.idCaminhao = motorista.idCaminhao;
  }
};

const onItemProdutoSelect = (id, index) => {
  const produto = produtos.value.find((p) => p.id === id);
  if (produto) {
    form.itens[index].produtoNome = produto.produto;
    form.itens[index].valorUnit = produto.valorVenda / 100;
    calculateItemTotal(index);
  }
};

const openAddModal = () => {
  isEditing.value = false;
  Object.assign(form, {
    id: null,
    idCliente: null,
    nomeCliente: "",
    cpfCnpj: "",
    itens: [],
    idVendedor: null,
    idFormaPgto: null,
    idMotorista: null,
    idCaminhao: null,
    telefone: "",
    email: "",
    endereco: "",
    enderecoEntrega: "",
    bairro: "",
    cidade: "",
    estado: "MG",
    cep: "",
    validadeOrcamento: "",
    dataEntrega: "",
    distanciaObra: 0,
    bombaNecessaria: false,
    valorBomba: 0,
    valorDesconto: 0,
    status: "PENDENTE",
    obs: "",
    total: 0,
  });
  addItem(); // Start with one item
  showModal.value = true;
};

const openEditModal = (orc) => {
  isEditing.value = true;

  // Convert itens values back to decimal for form
  const mappedItens = (orc.itens || []).map((item) => ({
    ...item,
    valorUnit: item.valorUnit / 100,
    total: item.total / 100,
  }));

  Object.assign(form, {
    ...orc,
    itens: mappedItens,
    valorBomba: (orc.valorBomba || 0) / 100,
    valorDesconto: (orc.valorDesconto || 0) / 100,
    total: orc.total / 100,
    validadeOrcamento: orc.validadeOrcamento
      ? new Date(orc.validadeOrcamento).toISOString().split("T")[0]
      : "",
    dataEntrega: orc.dataEntrega
      ? new Date(orc.dataEntrega)
          .toLocaleString("sv-SE")
          .slice(0, 16)
          .replace(" ", "T")
      : "",
    bombaNecessaria: !!orc.bombaNecessaria,
  });

  if (!form.itens.length) addItem(); // Fallback if no itens (legacy data)

  showModal.value = true;
};

const saveOrcamento = async () => {
  loading.value = true;
  try {
    const payload = {
      ...form,
      valorBomba: Math.round(form.valorBomba * 100),
      valorDesconto: Math.round(form.valorDesconto * 100),
      total: Math.round(form.total * 100),
      itens: form.itens.map((item) => ({
        ...item,
        valorUnit: Math.round(item.valorUnit * 100),
        total: Math.round(item.total * 100),
      })),
      // Legacy support (picks first item)
      idProduto: form.itens[0]?.idProduto || 1,
      produtoNome: form.itens[0]?.produtoNome || "N/A",
      qtd: form.itens[0]?.qtd || 0,
      valorUnit: Math.round((form.itens[0]?.valorUnit || 0) * 100),
      idEmpresa: user.value?.idEmpresa,
      idUsuario: user.value?.id,
    };

    const url = isEditing.value
      ? `/api/orcamentos/${form.id}`
      : "/api/orcamentos";
    await $fetch(url, {
      method: isEditing.value ? "PUT" : "POST",
      body: payload,
    });

    addToast({
      title: isEditing.value ? "Cotação Atualizada" : "Cotação Gerada",
      description: "Os dados foram salvos no sistema.",
      type: "success",
    });
    info(
      "ORCAMENTOS",
      `${isEditing.value ? "Edição" : "Gerado"} orçamento para ${form.nomeCliente}`,
      { orcamento: payload },
    );
    showModal.value = false;
    refresh();
  } catch (err) {
    addToast({
      title: "Erro",
      description: err.data?.statusMessage || "Erro ao processar",
      type: "error",
    });
    logError(
      "ORCAMENTOS",
      `Erro ao ${isEditing.value ? "editar" : "gerar"} orçamento`,
      { error: err.message, form },
    );
  } finally {
    loading.value = false;
  }
};

const approveOrcamento = (orc) => {
  selectedOrcamentoForApproval.value = orc;
  lacreCode.value = "";
  showLacreModal.value = true;
};

const confirmApproval = async () => {
  if (!selectedOrcamentoForApproval.value) return;

  loadingApproval.value = true;
  try {
    await $fetch(
      `/api/orcamentos/${selectedOrcamentoForApproval.value.id}/aprovar`,
      {
        method: "POST",
        body: { lacre: lacreCode.value },
      },
    );
    addToast({
      title: "Aprovado",
      description: "Orçamento convertido em venda!",
      type: "success",
    });
    info(
      "ORCAMENTOS",
      `Orçamento #${selectedOrcamentoForApproval.value.id} aprovado com lacre ${lacreCode.value}`,
      { orcamento: selectedOrcamentoForApproval.value },
    );
    showLacreModal.value = false;
    refresh();
  } catch (err) {
    addToast({ title: "Erro", description: "Erro ao aprovar.", type: "error" });
    logError(
      "ORCAMENTOS",
      `Erro ao aprovar orçamento #${selectedOrcamentoForApproval.value.id}`,
      { error: err.message },
    );
  } finally {
    loadingApproval.value = false;
  }
};

const downloadOrcamentoPdf = (orc) => {
  try {
    const pdfBase64 = generateOrcamentoPdf(orc, user.value?.empresa);
    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `Orcamento_${String(orc.id).padStart(4, "0")}.pdf`;
    link.click();
  } catch (e) {
    console.error("Erro ao gerar PDF:", e);
    addToast({
      title: "Erro",
      description: "Erro ao gerar arquivo PDF.",
      type: "error",
    });
  }
};

const confirmDelete = (orc) => {
  orcamentoToDelete.value = orc;
  showDeleteDialog.value = true;
};

const handleDelete = async () => {
  try {
    await $fetch(`/api/orcamentos/${orcamentoToDelete.value.id}`, {
      method: "DELETE",
    });
    addToast({
      title: "Removido",
      description: "Orçamento deletado com sucesso.",
      type: "success",
    });
    info("ORCAMENTOS", `Orçamento #${orcamentoToDelete.value.id} removido`, {
      orcamento: orcamentoToDelete.value,
    });
    refresh();
  } catch (err) {
    addToast({ title: "Erro", description: "Erro ao remover.", type: "error" });
    logError(
      "ORCAMENTOS",
      `Erro ao remover orçamento #${orcamentoToDelete.value?.id}`,
      { error: err.message },
    );
  } finally {
    showDeleteDialog.value = false;
  }
};

const sendWhatsAppOrcamento = async (orc) => {
  if (!orc.telefone) {
    addToast({
      title: "Atenção",
      description: "Cliente sem telefone cadastrado.",
      type: "warn",
    });
    return;
  }

  // Encontrar labels auxiliares nas listas carregadas
  const formaLabel =
    formasPgto.value?.find((f) => f.id === orc.idFormaPgto)?.formaPagamento ||
    "A COMBINAR";
  const vendedorLabel =
    vendedores.value?.find((v) => v.id === orc.idVendedor)?.nome ||
    "ATENDIMENTO";

  const itemsText = orc.itens?.length
    ? orc.itens
        .map(
          (i) =>
            `• ${String(i.produtoNome).toUpperCase()}: ${Number(i.qtd).toFixed(2)}m³`,
        )
        .join("\n")
    : `• ${String(orc.produtoNome).toUpperCase()}: ${Number(orc.qtd).toFixed(2)}m³`;

  // Layout Estruturado (Estilo Fiscal)
  const line = "━━━━━━━━━━━━━━━━━━━━━━━━";
  const doubleLine = "════════════════════════";

  const empresaNome = user.value?.empresa?.empresa
    ? `${user.value.empresa.empresa}${user.value.empresa.filial ? ` - ${user.value.empresa.filial}` : ""}`.toUpperCase()
    : "SISTEMA MEU CONCRETO";
  const codOrc = String(orc.id).padStart(4, "0");
  const dataEmissao = new Intl.DateTimeFormat("pt-BR").format(
    new Date(orc.createdAt),
  );

  const dataEntregaPrompt = orc.dataEntrega
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(orc.dataEntrega))
    : "A DEFINIR";

  const enderecoCompleto = [orc.enderecoEntrega, orc.bairro, orc.cidade]
    .filter(Boolean)
    .join(", ");

  const message =
    `*${doubleLine}*\n` +
    `*${empresaNome}*\n` +
    `*${doubleLine}*\n\n` +
    `*PREVISÃO DE ENTREGA E LOGÍSTICA*\n` +
    `*REF. ORÇAMENTO:* #${codOrc}\n\n` +
    `*CLIENTE:* ${String(orc.nomeCliente).toUpperCase()}\n` +
    `*DATA/HORA:* ${dataEntregaPrompt}\n` +
    `*LOCAL:* ${enderecoCompleto.toUpperCase() || "NÃO INFORMADO"}\n\n` +
    `*${line}*\n` +
    `*PRODUTO E COMPOSIÇÃO*\n` +
    `*${line}*\n` +
    `${itemsText}\n` +
    `*${line}*\n\n` +
    `*SERVIÇO DE BOMBA:* ${orc.bombaNecessaria ? "REQUERIDO" : "NÃO UTILIZA"}\n` +
    (orc.lacre ? `*LACRE DE SEGURANÇA:* ${orc.lacre}\n` : "") +
    `*VALOR TOTAL:* ${formatCurrency(orc.total)}\n` +
    `*PAGAMENTO:* ${formaLabel}\n\n` +
    (orc.obs ? `*OBS. ENTREGA:* ${orc.obs}\n\n` : "") +
    `*${line}*\n` +
    `_Por favor, garanta que o acesso para o caminhão esteja livre no horário agendado._`;

  try {
    await sendWS(orc.telefone, { text: message });
  } catch (e) {
    // useWhatsApp handles error toasts
  }
};

const sendWhatsAppDocument = async (orc) => {
  if (!orc.telefone) {
    addToast({
      title: "Atenção",
      description: "Cliente sem telefone cadastrado.",
      type: "warn",
    });
    return;
  }

  try {
    // Gera o PDF real baseado no design do sistema, enviando os dados da empresa logada
    const pdfBase64 = generateOrcamentoPdf(orc, user.value?.empresa);

    await sendWS(orc.telefone, {
      document: pdfBase64,
      fileName: `Orcamento_${String(orc.id).padStart(4, "0")}.pdf`,
      mimetype: "application/pdf",
      caption: `Olá ${orc.nomeCliente}, segue em anexo o PDF do seu orçamento #${String(orc.id).padStart(4, "0")}.`,
    });
  } catch (e) {
    console.error("Erro ao gerar/enviar PDF:", e);
    // useWhatsApp already handles toast for send error
  }
};

const formatCurrency = (value) => {
  if (!value) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
};
</script>

<style scoped>
.animate-enter {
  animation: enter 0.4s cubic-bezier(0.2, 0, 0, 1) forwards;
}

@keyframes enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}
</style>
