<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Vendas
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Histórico de vendas e conversões de orçamentos
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
      </div>
    </div>

    <!-- Quick Stats Summary -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-surface p-6 rounded-3xl border border-border group hover:border-brand/30 transition-all"
      >
        <div class="flex justify-between items-start mb-4">
          <div :class="['p-3 rounded-2xl bg-primary/3', stat.color]">
            <component :is="stat.icon" size="20" />
          </div>
          <span
            :class="[
              'text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border',
              stat.badgeBg,
              stat.badgeText,
            ]"
          >
            {{ stat.trend }}
          </span>
        </div>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1"
        >
          {{ stat.label }}
        </p>
        <p class="text-2xl font-black tracking-tighter text-primary uppercase">
          {{ stat.value }}
        </p>
      </div>
    </div>

    <!-- Table Container -->
    <div
      class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden"
    >
      <BaseTable
        :headers="['ID', 'Data', 'Cliente', 'Origem', 'Total', 'Status', '']"
      >
        <tr
          v-for="venda in displayedVendas"
          :key="venda.id"
          class="group hover:bg-primary/2 transition-colors"
        >
          <td class="px-8 py-5">
            <span
              class="text-xs font-black text-secondary opacity-40 tabular-nums"
              >#{{ String(venda.id).padStart(4, "0") }}</span
            >
          </td>
          <td class="px-8 py-5">
            <span
              class="text-xs font-black uppercase tracking-tight text-secondary opacity-60"
            >
              {{ formatDate(venda.dataVenda) }}
            </span>
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col">
              <span
                class="text-sm font-black uppercase tracking-tight text-primary"
                >{{ venda.orcamento?.nomeCliente || "---" }}</span
              >
              <span
                class="text-[10px] font-black uppercase opacity-30 mt-0.5 tracking-widest"
                >{{ venda.orcamento?.cpfCnpj || "---" }}</span
              >
            </div>
          </td>
          <td class="px-8 py-5">
            <span
              class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40"
            >
              Orc. #{{ String(venda.idOrcamento).padStart(4, "0") }}
            </span>
          </td>
          <td class="px-8 py-5">
            <span
              class="text-sm font-black uppercase tracking-tight text-brand"
            >
              {{ formatCurrency(venda.valorTotal) }}
            </span>
          </td>
          <td class="px-8 py-5">
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full shadow-[0_0_10px]',
                  statusColor[venda.status],
                ]"
              ></div>
              <span
                class="text-[10px] font-black uppercase tracking-widest"
                :class="statusTextColor[venda.status]"
              >
                {{ venda.status }}
              </span>
            </div>
          </td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <BaseTooltip text="Emitir NF-e">
                <button
                  @click="emitNfe(venda)"
                  class="p-2.5 rounded-xl bg-[#00AEEF]/10 text-[#00AEEF] hover:scale-110 active:scale-95 transition-all"
                >
                  <FileText size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Emitir NFS-e">
                <button
                  @click="emitNfse(venda)"
                  class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:scale-110 active:scale-95 transition-all"
                >
                  <FileBadge size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Emitir Pagamento">
                <button
                  @click="openPaymentModal(venda)"
                  class="p-2.5 rounded-xl bg-brand/10 text-brand hover:scale-110 active:scale-95 transition-all"
                >
                  <CreditCard size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="WhatsApp">
                <button
                  @click="sendWhatsAppVenda(venda)"
                  class="p-2.5 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:scale-110 active:scale-95 transition-all"
                >
                  <MessageSquare size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Imprimir">
                <button
                  @click="printVenda(venda)"
                  class="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 hover:scale-110 active:scale-95 transition-all"
                >
                  <Printer size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip text="Visualizar">
                <button
                  @click="openViewModal(venda)"
                  class="p-2.5 rounded-xl text-secondary hover:text-brand hover:bg-primary/3 hover:scale-110 transition-all"
                >
                  <Eye size="16" />
                </button>
              </BaseTooltip>
              <BaseTooltip v-if="isAdmin" text="Excluir">
                <button
                  @click="confirmDelete(venda)"
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
      <div v-if="!filteredVendas.length && !pending" class="p-20 text-center">
        <div
          class="w-16 h-16 bg-primary/2 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border"
        >
          <ShoppingBag size="32" class="text-secondary/20" />
        </div>
        <h3 class="text-lg font-black uppercase tracking-tight text-primary">
          Nenhuma venda encontrada
        </h3>
        <p
          class="text-secondary text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-50"
        >
          Aprove orçamentos para gerar novas vendas.
        </p>
      </div>

      <div
        v-else-if="itemsToShow < filteredVendas.length"
        class="p-8 flex justify-center border-t border-border"
      >
        <button
          @click="itemsToShow += 20"
          class="flex items-center gap-2 px-6 py-3 bg-primary/2 hover:bg-primary/3 text-primary text-xs font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-105"
        >
          <RefreshCw size="14" class="opacity-40" />
          Carregar mais vendas
        </button>
      </div>
    </div>

    <!-- View Detail Modal -->
    <BaseModal v-model="showViewModal" title="Detalhes da Venda" size="xl">
      <div v-if="selectedVenda" class="space-y-8 pt-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-primary/2 p-6 rounded-3xl border border-border">
            <div class="flex items-center gap-2 mb-4">
              <User size="16" class="text-brand" />
              <span
                class="text-[10px] font-black uppercase tracking-widest text-secondary"
                >Cliente</span
              >
            </div>
            <p class="text-base font-black uppercase text-primary">
              {{ selectedVenda.orcamento?.nomeCliente }}
            </p>
            <p
              class="text-xs font-bold text-secondary opacity-60 mt-1 uppercase tracking-tighter"
            >
              {{ selectedVenda.orcamento?.cpfCnpj }}
            </p>
          </div>

          <div class="bg-primary/2 p-6 rounded-3xl border border-border">
            <div class="flex items-center gap-2 mb-4">
              <Calendar size="16" class="text-brand" />
              <span
                class="text-[10px] font-black uppercase tracking-widest text-secondary"
                >Data da Venda</span
              >
            </div>
            <p class="text-base font-black uppercase text-primary">
              {{ formatDate(selectedVenda.dataVenda) }}
            </p>
            <p
              class="text-xs font-bold text-secondary opacity-60 mt-1 uppercase"
            >
              Processado às {{ formatTime(selectedVenda.dataVenda) }}
            </p>
          </div>

          <div class="bg-brand/5 p-6 rounded-3xl border border-brand/10">
            <div class="flex items-center gap-2 mb-4">
              <DollarSign size="16" class="text-brand" />
              <span
                class="text-[10px] font-black uppercase tracking-widest text-brand"
                >Total da Venda</span
              >
            </div>
            <p class="text-2xl font-black uppercase text-brand">
              {{ formatCurrency(selectedVenda.valorTotal) }}
            </p>
            <p class="text-xs font-bold text-brand opacity-60 mt-1 uppercase">
              {{
                selectedVenda.pagamentos?.length
                  ? "Possui cobranças geradas"
                  : "Aguardando financeiro"
              }}
            </p>
          </div>
        </div>

        <!-- Seção de Pagamentos/Finanças -->
        <div v-if="selectedVenda.pagamentos?.length" class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-4 bg-amber-500 rounded-full"></div>
            <h4
              class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
            >
              Histórico Financeiro
            </h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="pagto in selectedVenda.pagamentos"
              :key="pagto.id"
              class="bg-surface p-4 rounded-2xl border border-border flex items-center justify-between group hover:border-brand/30 transition-all shadow-sm"
            >
              <div class="flex items-center gap-4">
                <div
                  :class="[
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    pagto.status === 'PAGO'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-amber-500/10 text-amber-600',
                  ]"
                >
                  <CheckCircle2 v-if="pagto.status === 'PAGO'" size="18" />
                  <Clock v-else size="18" />
                </div>
                <div>
                  <p
                    class="text-[9px] font-black uppercase tracking-widest opacity-40"
                  >
                    {{ pagto.metodo }} • {{ formatDate(pagto.dataVencimento) }}
                  </p>
                  <p class="text-sm font-black text-primary uppercase">
                    {{ formatCurrency(pagto.valor) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter',
                    pagto.status === 'PAGO'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-amber-500/10 text-amber-600',
                  ]"
                >
                  {{ pagto.status }}
                </span>
                <a
                  v-if="pagto.asaasUrl"
                  :href="pagto.asaasUrl"
                  target="_blank"
                  class="p-2 text-secondary hover:text-brand transition-colors"
                >
                  <ExternalLink size="14" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Seção Fiscal (NFe / NFSe) -->
        <div
          v-if="selectedVenda.nfeNumero || selectedVenda.nfseNumero"
          class="space-y-4"
        >
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
            <h4
              class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
            >
              Documentos Fiscais
            </h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-if="selectedVenda.nfeNumero"
              class="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 flex items-center justify-between"
            >
              <div>
                <p
                  class="text-[9px] font-black uppercase tracking-widest text-emerald-600 opacity-60"
                >
                  NF-e (Produto)
                </p>
                <p class="text-sm font-black text-primary uppercase mt-1">
                  Nº {{ selectedVenda.nfeNumero }}
                  <span class="opacity-30">|</span> SR
                  {{ selectedVenda.nfeSerie }}
                </p>
              </div>
              <a
                :href="selectedVenda.nfeLink"
                target="_blank"
                class="p-3 bg-emerald-500 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
              >
                <ExternalLink size="14" />
              </a>
            </div>
            <div
              v-if="selectedVenda.nfseNumero"
              class="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 flex items-center justify-between"
            >
              <div>
                <p
                  class="text-[9px] font-black uppercase tracking-widest text-blue-600 opacity-60"
                >
                  NFS-e (Serviço)
                </p>
                <p class="text-sm font-black text-primary uppercase mt-1">
                  Nº {{ selectedVenda.nfseNumero }}
                </p>
              </div>
              <a
                :href="selectedVenda.nfseLink"
                target="_blank"
                class="p-3 bg-blue-500 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
              >
                <ExternalLink size="14" />
              </a>
            </div>
          </div>
        </div>

        <!-- Itens da Venda (origem orçamento) -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-4 bg-primary rounded-full"></div>
            <h4
              class="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
            >
              Produtos e Serviços
            </h4>
          </div>
          <div
            class="bg-primary/2 rounded-3xl border border-border overflow-hidden"
          >
            <table class="w-full text-left">
              <thead class="bg-primary/3">
                <tr>
                  <th
                    class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary"
                  >
                    Produto
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary text-center"
                  >
                    Quantidade
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary text-right"
                  >
                    Valor Unit.
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondary text-right"
                  >
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr
                  v-for="item in selectedVenda.orcamento?.itens"
                  :key="item.id"
                >
                  <td class="px-6 py-4">
                    <span
                      class="text-xs font-black uppercase text-primary tracking-tight"
                      >{{ item.produtoNome }}</span
                    >
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="text-xs font-black text-secondary tabular-nums"
                      >{{ item.qtd }} m³</span
                    >
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span
                      class="text-xs font-black text-secondary tabular-nums"
                      >{{ formatCurrency(item.valorUnit) }}</span
                    >
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span
                      class="text-xs font-black text-primary tabular-nums"
                      >{{ formatCurrency(item.total) }}</span
                    >
                  </td>
                </tr>
                <!-- Linha Extra: Bomba (se houver) -->
                <tr v-if="selectedVenda.orcamento?.bombaNecessaria">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <span
                        class="text-xs font-black uppercase text-primary tracking-tight"
                        >Serviço de Bombeamento</span
                      >
                      <span
                        class="px-2 py-0.5 bg-brand/10 text-brand text-[8px] font-black rounded-full uppercase"
                        >Adicional</span
                      >
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="text-xs font-black text-secondary tabular-nums"
                      >1 un</span
                    >
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span
                      class="text-xs font-black text-secondary tabular-nums"
                      >{{
                        formatCurrency(selectedVenda.orcamento.valorBomba)
                      }}</span
                    >
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span
                      class="text-xs font-black text-primary tabular-nums"
                      >{{
                        formatCurrency(selectedVenda.orcamento.valorBomba)
                      }}</span
                    >
                  </td>
                </tr>
                <!-- Linha Extra: Desconto (se houver) -->
                <tr v-if="selectedVenda.orcamento?.valorDesconto > 0">
                  <td class="px-6 py-4" colspan="3">
                    <span
                      class="text-xs font-black uppercase text-rose-500 tracking-tight"
                      >Desconto Aplicado</span
                    >
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span class="text-xs font-black text-rose-500 tabular-nums"
                      >-
                      {{
                        formatCurrency(selectedVenda.orcamento.valorDesconto)
                      }}</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Resumo Final -->
        <div class="flex flex-col items-end gap-3 pt-4">
          <div
            v-if="selectedVenda.orcamento?.obs"
            class="w-full bg-primary/2 p-4 rounded-2xl border border-border mb-4"
          >
            <p
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 mb-1"
            >
              Observações do Pedido
            </p>
            <p class="text-xs font-bold text-primary">
              {{ selectedVenda.orcamento.obs }}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button
              @click="printVenda(selectedVenda)"
              class="flex items-center gap-2 px-8 py-4 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/20"
            >
              <Printer size="14" />
              Imprimir Comprovante
            </button>
            <button
              @click="showViewModal = false"
              class="px-8 py-4 bg-primary text-background rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- Delete Confirmation Dialog -->
    <BaseModal v-model="showDeleteDialog" title="Excluir Venda" size="md">
      <div class="text-center space-y-4 pt-4">
        <div
          class="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500"
        >
          <AlertTriangle size="32" />
        </div>
        <h3 class="text-lg font-black uppercase tracking-tight text-primary">
          Confirmar Exclusão
        </h3>
        <p class="text-sm font-medium text-secondary opacity-60">
          Esta ação é irreversível. Deseja realmente excluir a venda
          <span class="text-primary font-black"
            >#{{ String(vendaToDelete?.id).padStart(4, "0") }}</span
          >?
        </p>
        <div class="flex gap-3 pt-6">
          <button
            @click="showDeleteDialog = false"
            class="flex-1 py-4 bg-primary/2 border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-primary/5 transition-all"
          >
            Cancelar
          </button>
          <button
            @click="handleDelete"
            :disabled="loading"
            class="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all flex justify-center items-center gap-2"
          >
            <span
              v-if="loading"
              class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"
            ></span>
            Excluir Permanentemente
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- Payment Emission Modal -->
    <BaseModal v-model="showPaymentModal" title="Emitir Pagamento" size="md">
      <div class="space-y-6 pt-4">
        <div class="bg-primary/2 p-6 rounded-[2rem] border border-border">
          <div class="flex items-center gap-4 mb-6">
            <div
              class="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand"
            >
              <DollarSign size="24" />
            </div>
            <div>
              <h4
                class="text-xs font-black uppercase tracking-widest text-primary"
              >
                Cobrança de Venda
              </h4>
              <p
                class="text-[10px] font-bold text-secondary uppercase opacity-60"
              >
                Venda #{{ String(selectedVenda?.id).padStart(4, "0") }}
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <label
              class="text-[9px] font-black uppercase tracking-widest text-secondary opacity-40 ml-2"
              >Forma de Recebimento</label
            >
            <div class="grid grid-cols-1 gap-3">
              <button
                v-for="type in ['PIX', 'BOLETO', 'CREDIT_CARD']"
                :key="type"
                @click="paymentType = type"
                class="flex items-center justify-between px-6 py-4 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest"
                :class="
                  paymentType === type
                    ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20'
                    : 'bg-white border-border text-secondary hover:border-brand/30'
                "
              >
                <span v-if="type === 'PIX'">PIX Dinâmico</span>
                <span v-else-if="type === 'BOLETO'">Boleto Bancário</span>
                <span v-else>Cartão de Crédito</span>
                <div
                  v-if="paymentType === type"
                  class="w-2 h-2 bg-white rounded-full"
                ></div>
              </button>
            </div>
          </div>

          <div
            class="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-4"
          >
            <div class="p-2 bg-emerald-500/20 text-emerald-500 rounded-xl">
              <MessageSquare size="16" />
            </div>
            <p class="text-[9px] font-bold text-emerald-600 uppercase">
              O link de pagamento será enviado automaticamente para o WhatsApp
              do cliente.
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="showPaymentModal = false"
            class="flex-1 py-4 bg-primary/2 border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary"
          >
            Cancelar
          </button>
          <button
            @click="handlePaymentEmission"
            :disabled="loading"
            class="flex-1 py-4 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-3 shadow-xl shadow-brand/20"
          >
            <Send size="18" v-if="!loading" />
            <span
              v-else
              class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"
            ></span>
            Emitir e Enviar
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useFetch, useToast } from "#imports";
import { useLogger } from "~/composables/useLogger";
import { useWhatsApp } from "~/composables/useWhatsApp";
import { useRoute } from "vue-router";
import { generateVendaPdf } from "~/utils/vendaPdf";
import {
  Search,
  ShoppingBag,
  Eye,
  Trash2,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  DollarSign,
  MapPin,
  MessageSquare,
  FileText,
  FileBadge,
  CreditCard,
  Send,
  RefreshCw,
  Printer,
} from "lucide-vue-next";

const { add: addToast } = useToast();
const route = useRoute();
const { user } = useAuth();
const { info, error: logError } = useLogger();
const { sendMessage: sendWS } = useWhatsApp();
const searchTerm = ref("");
const itemsToShow = ref(20);
const loading = ref(false);
const showViewModal = ref(false);
const showDeleteDialog = ref(false);
const showPaymentModal = ref(false);
const selectedVenda = ref(null);
const vendaToDelete = ref(null);
const paymentType = ref("PIX");

const isAdmin = computed(() => user.value?.admin === 1);

const { data: vendas, pending, refresh } = await useFetch("/api/vendas");

onMounted(() => {
  if (route.query.id) {
    const id = parseInt(route.query.id);
    const venda = vendas.value?.find((v) => v.id === id);
    if (venda) {
      openViewModal(venda);
    }
  }
});

// Stats Calculation
const stats = computed(() => {
  const list = vendas.value || [];
  const totalVendido = list.reduce((acc, v) => acc + (v.valorTotal || 0), 0);
  const pagas = list.filter((v) => v.status === "PAGA");
  const totalRecebido = pagas.reduce((acc, v) => acc + (v.valorTotal || 0), 0);
  const emAberto = list.length - pagas.length;

  const ticketMedio = list.length > 0 ? totalVendido / list.length : 0;
  const taxaConversao =
    list.length > 0 ? Math.round((pagas.length / list.length) * 100) : 0;

  return [
    {
      label: "Total em Vendas",
      value: formatCurrency(totalVendido),
      icon: ShoppingBag,
      color: "text-brand",
      trend: `${list.length} pedidos`,
      badgeBg: "bg-brand/10",
      badgeText: "text-brand",
    },
    {
      label: "Total Recebido",
      value: formatCurrency(totalRecebido),
      icon: DollarSign,
      color: "text-emerald-500",
      trend: `${taxaConversao}% liquidez`,
      badgeBg: "bg-emerald-500/10",
      badgeText: "text-emerald-500",
    },
    {
      label: "Ticket Médio",
      value: formatCurrency(ticketMedio),
      icon: Clock,
      color: "text-blue-500",
      trend: "Base unitária",
      badgeBg: "bg-blue-500/10",
      badgeText: "text-blue-500",
    },
    {
      label: "Pedidos em Aberto",
      value: String(emAberto),
      icon: AlertTriangle,
      color: "text-amber-500",
      trend: "Aguardando pgto",
      badgeBg: "bg-amber-500/10",
      badgeText: "text-amber-500",
    },
  ];
});

const filteredVendas = computed(() => {
  if (!vendas.value) return [];
  return vendas.value.filter((v) => {
    const query = searchTerm.value.toLowerCase();
    const clientName = v.orcamento?.nomeCliente?.toLowerCase() || "";
    const id = String(v.id);
    const idOrc = String(v.idOrcamento);
    return (
      clientName.includes(query) || id.includes(query) || idOrc.includes(query)
    );
  });
});

const displayedVendas = computed(() =>
  filteredVendas.value.slice(0, itemsToShow.value),
);

const statusColor = {
  ABERTA: "bg-blue-500 shadow-blue-500/20",
  PAGA: "bg-emerald-500 shadow-emerald-500/20",
  CANCELADA: "bg-rose-500 shadow-rose-500/20",
  NF_EMITIDA: "bg-[#00AEEF] shadow-[#00AEEF]/20",
};

const statusTextColor = {
  ABERTA: "text-blue-600 dark:text-blue-400",
  PAGA: "text-emerald-600 dark:text-emerald-400",
  CANCELADA: "text-rose-600 dark:text-rose-400",
  NF_EMITIDA: "text-[#00AEEF]",
};

const openViewModal = (venda) => {
  selectedVenda.value = venda;
  showViewModal.value = true;
};

const confirmDelete = (venda) => {
  vendaToDelete.value = venda;
  showDeleteDialog.value = true;
};

const handleDelete = async () => {
  loading.value = true;
  try {
    await $fetch(`/api/vendas/${vendaToDelete.value.id}`, { method: "DELETE" });
    addToast({
      title: "Excluído",
      description: "Venda removida com sucesso.",
      type: "success",
    });
    info("VENDAS", `Venda #${vendaToDelete.value.id} removida`, {
      venda: vendaToDelete.value,
    });
    refresh();
    showDeleteDialog.value = false;
  } catch (err) {
    addToast({
      title: "Erro",
      description: "Erro ao remover venda.",
      type: "error",
    });
    logError("VENDAS", `Erro ao remover venda #${vendaToDelete.value?.id}`, {
      error: err.message,
    });
  } finally {
    loading.value = false;
  }
};

const emitNfe = async (venda) => {
  loading.value = true;
  try {
    await $fetch(`/api/vendas/${venda.id}/nfe`, { method: "POST" });
    addToast({
      title: "NF-e Enviada",
      description: "Solicitação de NF-e processada com sucesso.",
      type: "success",
    });
    refresh();
  } catch (err) {
    addToast({
      title: "Erro Fiscal",
      description: err.data?.message || "Falha ao emitir NF-e",
      type: "error",
    });
  } finally {
    loading.value = false;
  }
};

const emitNfse = async (venda) => {
  loading.value = true;
  try {
    await $fetch(`/api/vendas/${venda.id}/nfse`, { method: "POST" });
    addToast({
      title: "NFS-e Enviada",
      description: "Solicitação de NFS-e processada com sucesso.",
      type: "success",
    });
    refresh();
  } catch (err) {
    addToast({
      title: "Erro Fiscal",
      description: err.data?.message || "Falha ao emitir NFS-e",
      type: "error",
    });
  } finally {
    loading.value = false;
  }
};

const printVenda = async (venda) => {
  loading.value = true;
  try {
    const data = await $fetch(`/api/vendas/${venda.id}/comprovante`);
    generateVendaPdf(data);
    addToast({
      title: "PDF Gerado",
      description: "O comprovante da venda foi gerado com sucesso.",
      type: "success",
    });
    info("VENDAS", `PDF de comprovante gerado para venda #${venda.id}`);
  } catch (err) {
    addToast({
      title: "Erro ao gerar PDF",
      description: "Não foi possível carregar os dados técnicos da venda.",
      type: "error",
    });
    logError("VENDAS", `Erro ao gerar PDF da venda #${venda.id}`, {
      error: err.message,
    });
  } finally {
    loading.value = false;
  }
};

const openPaymentModal = (venda) => {
  selectedVenda.value = venda;
  showPaymentModal.value = true;
};

const handlePaymentEmission = async () => {
  if (!selectedVenda.value) return;
  loading.value = true;
  try {
    await $fetch(`/api/vendas/${selectedVenda.value.id}/pagamento`, {
      method: "POST",
      body: { tipo: paymentType.value },
    });
    addToast({
      title: "Pagamento Emitido",
      description: "Cobrança gerada e enviada via WhatsApp.",
      type: "success",
    });
    showPaymentModal.value = false;
    refresh();
  } catch (err) {
    addToast({
      title: "Erro",
      description: err.data?.message || "Falha ao emitir pagamento",
      type: "error",
    });
  } finally {
    loading.value = false;
  }
};

const sendWhatsAppVenda = async (venda) => {
  const telefone = venda.orcamento?.telefone;
  if (!telefone) {
    addToast({
      title: "Atenção",
      description: "Cliente sem telefone cadastrado.",
      type: "warn",
    });
    return;
  }

  // Layout Estruturado (Estilo Fiscal)
  const line = "━━━━━━━━━━━━━━━━━━━━━━━━";
  const doubleLine = "════════════════════════";

  const empresaNome = user.value?.empresa?.empresa
    ? String(user.value.empresa.empresa).toUpperCase()
    : "SISTEMA MEU CONCRETO";
  const codVenda = String(venda.id).padStart(4, "0");
  const dataVenda = new Intl.DateTimeFormat("pt-BR").format(
    new Date(venda.createdAt),
  );

  const message =
    `*${doubleLine}*\n` +
    `*${empresaNome}*\n` +
    `*${doubleLine}*\n\n` +
    `*PEDIDO DE VENDA CONFIRMADO: #${codVenda}*\n` +
    `*DATA:* ${dataVenda}\n\n` +
    `*CLIENTE:* ${String(venda.orcamento?.nomeCliente || "CLIENTE").toUpperCase()}\n\n` +
    `*${line}*\n` +
    `*DETALHES DO PEDIDO*\n` +
    `*${line}*\n` +
    `• PRODUTO: ${String(venda.orcamento?.produtoNome || "CONCRETO").toUpperCase()}\n` +
    `• QTD TOTAL: ${Number(venda.orcamento?.qtd || 0).toFixed(2)}m³\n` +
    `*${line}*\n\n` +
    `*VALOR TOTAL:* ${formatCurrency(venda.valorTotal)}\n` +
    `*STATUS:* ✅ ${venda.status}\n\n` +
    `*${line}*\n` +
    `_Obrigado pela preferência! Em breve entraremos em contato para agendamento da entrega._`;

  try {
    await sendWS(telefone, { text: message });
  } catch (e) {
    // useWhatsApp handles toast
  }
};

const formatCurrency = (value) => {
  if (!value) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
};

const formatDate = (date) => {
  if (!date) return "---";
  return new Date(date).toLocaleDateString("pt-BR");
};

const formatTime = (date) => {
  if (!date) return "---";
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
