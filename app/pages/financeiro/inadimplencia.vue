<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2
          class="text-4xl font-black text-rose-500 tracking-tighter uppercase"
        >
          Inadimplência
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Relatório detalhado de valores em atraso e cobrança
        </p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-surface p-6 rounded-3xl border border-border">
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1"
        >
          Total em Atraso
        </p>
        <p class="text-3xl font-black text-rose-500 uppercase tracking-tighter">
          {{ formatCurrency(summary?.receber?.atrasado || 0) }}
        </p>
      </div>
      <div class="bg-surface p-6 rounded-3xl border border-border">
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1"
        >
          Índice Geral
        </p>
        <p class="text-3xl font-black text-primary uppercase tracking-tighter">
          {{ summary?.indiceInadimplencia?.toFixed(1) || 0 }}%
        </p>
      </div>
      <div class="bg-surface p-6 rounded-3xl border border-border">
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1"
        >
          Títulos Vencidos
        </p>
        <p class="text-3xl font-black text-primary uppercase tracking-tighter">
          {{ overduePayments.length }}
        </p>
      </div>
    </div>

    <!-- Overdue Table -->
    <div
      class="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden"
    >
      <div class="px-8 py-6 border-b border-border bg-primary/2">
        <h3 class="text-xs font-black uppercase tracking-widest text-primary">
          Títulos em Atraso (Contas a Receber)
        </h3>
      </div>

      <BaseTable
        :headers="['Vencimento', 'Dias', 'Cliente', 'Venda', 'Valor', '']"
      >
        <tr
          v-for="pgto in overduePayments"
          :key="pgto.id"
          class="group hover:bg-rose-500/5 transition-colors"
        >
          <td class="px-8 py-5">
            <span class="text-xs font-black uppercase text-rose-500">
              {{ formatDate(pgto.dataVencimento) }}
            </span>
          </td>
          <td class="px-8 py-5">
            <span
              class="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-600 text-[10px] font-black uppercase"
            >
              {{ getDaysOverdue(pgto.dataVencimento) }} dias
            </span>
          </td>
          <td class="px-8 py-5">
            <div class="flex flex-col">
              <span class="text-sm font-black uppercase text-primary">{{
                pgto.venda?.orcamento?.nomeCliente || "---"
              }}</span>
              <span class="text-[10px] font-bold text-secondary opacity-40">{{
                pgto.venda?.orcamento?.telefone || "SEM TELEFONE"
              }}</span>
            </div>
          </td>
          <td class="px-8 py-5">
            <span class="text-xs font-black text-secondary tabular-nums">#{{ String(pgto.idVenda).padStart(4, "0") }}</span>
          </td>
          <td class="px-8 py-5 text-sm font-black text-rose-500">
            {{ formatCurrency(pgto.valor) }}
          </td>
          <td class="px-8 py-5 text-right">
            <BaseTooltip content="Cobrar via WhatsApp">
              <button
                class="p-2.5 rounded-xl bg-green-500/10 text-green-600 hover:scale-110 active:scale-95 transition-all"
                @click="openWhatsApp(pgto)"
              >
                <MessageSquare size="16" />
              </button>
            </BaseTooltip>
          </td>
        </tr>
      </BaseTable>

      <div
        v-if="overduePayments.length === 0"
        class="p-20 text-center"
      >
        <CheckCircle2
          size="48"
          class="text-green-500 mx-auto mb-4 opacity-20"
        />
        <p
          class="text-sm font-black uppercase tracking-widest text-secondary opacity-40"
        >
          Nenhum título em atraso!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MessageSquare, CheckCircle2 } from 'lucide-vue-next'

const { data: summary } = await useFetch('/api/financeiro/summary')
// We fetch PENDING payments and filter for OVERDUE locally for better accuracy
const { data: overdueData } = await useFetch('/api/pagamentos', {
  params: { status: 'PENDENTE' },
})

const overduePayments = computed(() => {
  // If the API doesn't filter, we filter here
  if (!overdueData.value) return []
  const hoje = useState('inadimplencia_hoje', () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }).value
  return overdueData.value.filter(
    p => p.status === 'PENDENTE' && new Date(p.dataVencimento) < hoje,
  )
})

const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val / 100)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const getDaysOverdue = (date) => {
  const agora = useState('inadimplencia_agora', () => new Date()).value
  const diff = agora - new Date(date)
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const openWhatsApp = (pgto) => {
  const tel = pgto.venda?.orcamento?.telefone?.replace(/\D/g, '')
  if (!tel) return
  const msg = `Olá ${pgto.venda.orcamento.nomeCliente}, notamos um título pendente referente à venda #${pgto.idVenda} no valor de ${formatCurrency(pgto.valor)} com vencimento em ${formatDate(pgto.dataVencimento)}. Podemos ajudar?`
  window.open(
    `https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`,
    '_blank',
  )
}
</script>
