<template>
  <div class="flex flex-col gap-6 animate-enter">
    <!-- Header Section -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h2 class="text-4xl font-black text-primary tracking-tighter uppercase">
          Gestão Financeira
        </h2>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1"
        >
          Visão geral de fluxo de caixa, inadimplência e saúde financeira
        </p>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <NuxtLink
          to="/financeiro/contas-pagar"
          class="flex items-center gap-2 px-6 py-3.5 bg-rose-500/10 text-rose-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-500/20 transition-all"
        >
          <Receipt size="18" />
          <span>Contas a Pagar</span>
        </NuxtLink>
        <NuxtLink
          to="/pagamentos"
          class="flex items-center gap-2 px-6 py-3.5 bg-green-500/10 text-green-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-500/20 transition-all"
        >
          <DollarSign size="18" />
          <span>Contas a Receber</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Main KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Fluxo de Caixa Realizado -->
      <div
        class="bg-surface p-8 rounded-3xl border border-border group overflow-hidden relative"
      >
        <div
          class="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700"
        >
          <TrendingUp size="160" />
        </div>
        <div class="flex items-center gap-4 mb-6">
          <div class="p-4 rounded-xl bg-brand/10 text-brand">
            <BarChart size="24" />
          </div>
          <div>
            <p
              class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-40"
            >
              Saldo em Caixa
            </p>
            <h3
              class="text-xs font-black uppercase tracking-widest text-primary"
            >
              Fluxo de Caixa Realizado
            </h3>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <p
            class="text-5xl font-black tracking-tighter"
            :class="summary?.fluxoCaixa >= 0 ? 'text-brand' : 'text-rose-500'"
          >
            {{ formatCurrency(summary?.fluxoCaixa || 0) }}
          </p>
          <div
            class="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-primary/3 w-fit"
          >
            <span class="opacity-40">Referente a valores liquidados</span>
          </div>
        </div>
      </div>

      <!-- Inadimplência -->
      <div
        class="bg-surface p-8 rounded-3xl border border-border group overflow-hidden relative"
      >
        <div
          class="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 text-rose-500"
        >
          <AlertTriangle size="160" />
        </div>
        <div class="flex items-center gap-4 mb-6">
          <div class="p-4 rounded-xl bg-rose-500/10 text-rose-500">
            <Percent size="24" />
          </div>
          <div>
            <p
              class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-40"
            >
              Índice de Atraso
            </p>
            <h3
              class="text-xs font-black uppercase tracking-widest text-primary"
            >
              Inadimplência
            </h3>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <p class="text-5xl font-black tracking-tighter text-rose-500">
            {{ summary?.indiceInadimplencia?.toFixed(1) || 0 }}%
          </p>
          <div
            class="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-rose-500/5 text-rose-500 w-fit"
          >
            <span>{{ formatCurrency(summary?.receber?.atrasado || 0) }} em
              atraso</span>
          </div>
        </div>
      </div>

      <!-- Projeção Mensal -->
      <div
        class="bg-surface p-8 rounded-3xl border border-border group overflow-hidden relative"
      >
        <div
          class="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 text-amber-500"
        >
          <Calendar size="160" />
        </div>
        <div class="flex items-center gap-4 mb-6">
          <div class="p-4 rounded-xl bg-amber-500/10 text-amber-500">
            <BarChart size="24" />
          </div>
          <div>
            <p
              class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-40"
            >
              Resultado Esperado
            </p>
            <h3
              class="text-xs font-black uppercase tracking-widest text-primary"
            >
              Projeção de Resultado
            </h3>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <p class="text-5xl font-black tracking-tighter text-primary">
            {{
              formatCurrency(
                (summary?.totalReceber || 0) - (summary?.totalPagar || 0),
              )
            }}
          </p>
          <div
            class="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-amber-500/5 text-amber-600 w-fit"
          >
            <span class="opacity-40">Saldo Projetado (Receber - Pagar)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Breakdown -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Receber -->
      <div class="bg-surface rounded-3xl border border-border p-8">
        <div class="flex justify-between items-center mb-8">
          <h3
            class="text-lg font-black text-primary uppercase tracking-tighter flex items-center gap-3"
          >
            <div class="w-2 h-8 bg-green-500 rounded-full" />
            Contas a Receber
          </h3>
          <span class="text-xl font-black text-primary">{{
            formatCurrency(summary?.totalReceber || 0)
          }}</span>
        </div>

        <div class="space-y-6">
          <div class="flex justify-between items-center group">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center"
              >
                <CheckCircle2 size="18" />
              </div>
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40"
                >
                  Recebido
                </p>
                <p class="text-sm font-black uppercase text-primary">
                  Liquidados
                </p>
              </div>
            </div>
            <p class="text-lg font-black text-green-600">
              {{ formatCurrency(summary?.receber?.pago || 0) }}
            </p>
          </div>

          <div class="flex justify-between items-center group">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center"
              >
                <Clock size="18" />
              </div>
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40"
                >
                  A Vencer
                </p>
                <p class="text-sm font-black uppercase text-primary">
                  Carteira Pendente
                </p>
              </div>
            </div>
            <p class="text-lg font-black text-amber-600">
              {{ formatCurrency(summary?.receber?.pendente || 0) }}
            </p>
          </div>

          <div class="flex justify-between items-center group">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center"
              >
                <AlertTriangle size="18" />
              </div>
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40"
                >
                  Atrasado
                </p>
                <p class="text-sm font-black uppercase text-primary">
                  Inadimplência Real
                </p>
              </div>
            </div>
            <p class="text-lg font-black text-rose-600">
              {{ formatCurrency(summary?.receber?.atrasado || 0) }}
            </p>
          </div>
        </div>

        <NuxtLink
          to="/pagamentos"
          class="flex items-center justify-center gap-2 w-full mt-10 py-4 border-2 border-primary/5 hover:border-brand/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:text-brand transition-all"
        >
          Ver todos os recebíveis
          <ArrowRight size="14" />
        </NuxtLink>
      </div>

      <!-- Pagar -->
      <div class="bg-surface rounded-3xl border border-border p-8">
        <div class="flex justify-between items-center mb-8">
          <h3
            class="text-lg font-black text-primary uppercase tracking-tighter flex items-center gap-3"
          >
            <div class="w-2 h-8 bg-rose-500 rounded-full" />
            Contas a Pagar
          </h3>
          <span class="text-xl font-black text-primary">{{
            formatCurrency(summary?.totalPagar || 0)
          }}</span>
        </div>

        <div class="space-y-6">
          <div class="flex justify-between items-center group">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-primary/3 text-secondary flex items-center justify-center"
              >
                <CreditCard size="18" />
              </div>
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40"
                >
                  Pago
                </p>
                <p class="text-sm font-black uppercase text-primary">
                  Despesas Liquidadas
                </p>
              </div>
            </div>
            <p class="text-lg font-black text-secondary">
              {{ formatCurrency(summary?.pagar?.pago || 0) }}
            </p>
          </div>

          <div class="flex justify-between items-center group">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center"
              >
                <Clock size="18" />
              </div>
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40"
                >
                  A Pagar
                </p>
                <p class="text-sm font-black uppercase text-primary">
                  Compromissos
                </p>
              </div>
            </div>
            <p class="text-lg font-black text-amber-600">
              {{ formatCurrency(summary?.pagar?.pendente || 0) }}
            </p>
          </div>

          <div class="flex justify-between items-center group">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center"
              >
                <AlertCircle size="18" />
              </div>
              <div>
                <p
                  class="text-[10px] font-black uppercase tracking-widest text-secondary opacity-40"
                >
                  Vencido
                </p>
                <p class="text-sm font-black uppercase text-primary">
                  Aguardando Pagamento
                </p>
              </div>
            </div>
            <p class="text-lg font-black text-rose-600">
              {{ formatCurrency(summary?.pagar?.atrasado || 0) }}
            </p>
          </div>
        </div>

        <NuxtLink
          to="/financeiro/contas-pagar"
          class="flex items-center justify-center gap-2 w-full mt-10 py-4 border-2 border-primary/5 hover:border-brand/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary hover:text-brand transition-all"
        >
          Ver todas as despesas
          <ArrowRight size="14" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  DollarSign,
  Receipt,
  TrendingUp,
  TrendingDown,
  Activity,
  Percent,
  Calendar,
  BarChart,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  CreditCard,
  ArrowRight,
} from 'lucide-vue-next'

const { data: summary, refresh } = await useFetch('/api/financeiro/summary')

const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val / 100)
}
</script>
