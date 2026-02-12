/**
 * Utilitário para exportação de relatórios em PDF
 * 
 * Usa jsPDF + jspdf-autotable para gerar relatórios profissionais
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Interfaces locais para evitar problemas de importação
interface KpisDashboard {
  totalVendas: number;
  valorTotalVendas: number;
  ticketMedio: number;
  quantidadeMedia: number;
  crescimentoVendas: number;
  crescimentoValor: number;
  totalOrcamentos: number;
  taxaConversao: number;
  saldoPeriodo: number;
  contasReceber: number;
  contasPagar: number;
  novosClientes: number;
  clientesAtivos: number;
  produtoMaisVendido?: {
    nome: string;
    quantidade: number;
  } | null;
  dataInicio: string;
  dataFim: string;
}

interface VendaPorPeriodo {
  periodo: string;
  totalVendas: number;
  valorTotal: number;
  ticketMedio: number;
  quantidadeMedia: number;
}

interface VendaPorVendedor {
  idVendedor: number;
  nomeVendedor: string;
  totalVendas: number;
  valorTotal: number;
  comissao?: number;
  percentualCrescimento?: number;
}

interface VendaPorCliente {
  idCliente: number;
  nomeCliente: string;
  totalCompras: number;
  valorTotal: number;
  ultimaCompra?: string | null;
}

interface StatusOrcamento {
  status: string;
  quantidade: number;
  valorTotal: number;
  percentual: number;
}

interface RelatorioData {
  titulo: string;
  periodo: string;
  kpis: {
    label: string;
    valor: string;
  }[];
  tabelas?: {
    titulo: string;
    headers: string[];
    data: (string | number)[][];
  }[];
}

interface DashboardData {
  kpis: KpisDashboard | null;
  vendasPorPeriodo: VendaPorPeriodo[] | null;
  topVendedores: VendaPorVendedor[] | null;
  topClientes: VendaPorCliente[] | null;
  statusOrcamentos: StatusOrcamento[] | null;
  periodo: string;
}

/**
 * Formata valor monetário para exibição em PDF
 */
export function formatarMoedaPDF(valor: number): string {
  return 'R$ ' + (valor / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Formata período para exibição
 */
function formatarPeriodo(periodo: string): string {
  const periodoMap: Record<string, string> = {
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
    '90d': 'Últimos 90 dias',
    '6m': 'Últimos 6 meses',
    '1a': 'Último ano'
  };
  return periodoMap[periodo] || periodo;
}

/**
 * Exporta relatório de BI para PDF
 */
export function exportarRelatorioPDF(data: RelatorioData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configurações de fonte e cores
  doc.setFont('helvetica');
  
  // Header
  doc.setFillColor(255, 122, 61); // Brand color
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(data.titulo, 14, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${data.periodo}`, 14, 32);
  
  // Data do relatório
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 38);

  // KPIs Section
  let yPosition = 55;
  
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Indicadores Principais', 14, yPosition);
  yPosition += 10;

  // Grid de KPIs (2 colunas)
  const kpisPorLinha = 2;
  const kpiWidth = 90;
  const kpiHeight = 25;
  
  data.kpis.forEach((kpi, index) => {
    const col = index % kpisPorLinha;
    const row = Math.floor(index / kpisPorLinha);
    const x = 14 + col * (kpiWidth + 6);
    const y = yPosition + row * (kpiHeight + 8);

    // Card background
    doc.setFillColor(248, 249, 250);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(x, y, kpiWidth, kpiHeight, 3, 3, 'FD');

    // Label
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.label.toUpperCase(), x + 5, y + 8);

    // Valor
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.valor, x + 5, y + 19);
  });

  yPosition += Math.ceil(data.kpis.length / kpisPorLinha) * (kpiHeight + 8) + 10;

  // Tabelas
  if (data.tabelas) {
    data.tabelas.forEach((tabela) => {
      // Verificar se precisa de nova página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Título da tabela
      doc.setTextColor(26, 26, 26);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(tabela.titulo, 14, yPosition);
      yPosition += 8;

      // Configurar colunas para autoTable
      const columns = tabela.headers.map(header => ({
        header,
        dataKey: header
      }));

      // Configurar dados
      const rows = tabela.data.map(row => {
        const obj: Record<string, string | number> = {};
        tabela.headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });

      // Renderizar tabela
      (doc as any).autoTable({
        columns,
        body: rows,
        startY: yPosition,
        margin: { left: 14, right: 14 },
        styles: {
          fontSize: 9,
          font: 'helvetica',
          cellPadding: 4,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [255, 122, 61],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: [26, 26, 26]
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        didDrawPage: function(data: any) {
          yPosition = data.cursor.y;
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    });
  }

  // Footer em todas as páginas
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(255, 122, 61);
    doc.rect(0, 287, 210, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Meu Concreto - Sistema de Gestão', 14, 293);
    doc.text(`Página ${i} de ${pageCount}`, 180, 293);
  }

  // Salvar
  const filename = `relatorio-bi-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Exporta dashboard de BI para PDF
 */
export function exportarDashboardPDF(data: DashboardData): void {
  const periodoLabel = formatarPeriodo(data.periodo);
  
  const kpis = data.kpis ? [
    { label: 'Total em Vendas', valor: formatarMoedaPDF(data.kpis.valorTotalVendas) },
    { label: 'Ticket Médio', valor: formatarMoedaPDF(data.kpis.ticketMedio) },
    { label: 'Taxa de Conversão', valor: `${data.kpis.taxaConversao}%` },
    { label: 'Novos Clientes', valor: String(data.kpis.novosClientes) },
    { label: 'Total de Vendas', valor: String(data.kpis.totalVendas) },
    { label: 'Clientes Ativos', valor: String(data.kpis.clientesAtivos) },
  ] : [];

  const tabelas: RelatorioData['tabelas'] = [];

  // Tabela de Top Vendedores
  if (data.topVendedores && data.topVendedores.length > 0) {
    tabelas.push({
      titulo: 'Top Vendedores',
      headers: ['Vendedor', 'Vendas', 'Valor Total', 'Comissão', '% do Total'],
      data: data.topVendedores.map(v => [
        v.nomeVendedor,
        v.totalVendas,
        formatarMoedaPDF(v.valorTotal),
        formatarMoedaPDF(v.comissao || 0),
        `${v.percentualCrescimento || 0}%`
      ])
    });
  }

  // Tabela de Top Clientes
  if (data.topClientes && data.topClientes.length > 0) {
    tabelas.push({
      titulo: 'Top Clientes',
      headers: ['Cliente', 'Compras', 'Valor Total', 'Última Compra'],
      data: data.topClientes.slice(0, 10).map(c => [
        c.nomeCliente,
        c.totalCompras,
        formatarMoedaPDF(c.valorTotal),
        c.ultimaCompra ? new Date(c.ultimaCompra).toLocaleDateString('pt-BR') : '-'
      ])
    });
  }

  // Tabela de Status dos Orçamentos
  if (data.statusOrcamentos && data.statusOrcamentos.length > 0) {
    tabelas.push({
      titulo: 'Status dos Orçamentos',
      headers: ['Status', 'Quantidade', 'Valor Total', 'Percentual'],
      data: data.statusOrcamentos.map(s => [
        s.status,
        s.quantidade,
        formatarMoedaPDF(s.valorTotal),
        `${s.percentual}%`
      ])
    });
  }

  // Tabela de Vendas por Período
  if (data.vendasPorPeriodo && data.vendasPorPeriodo.length > 0) {
    tabelas.push({
      titulo: 'Vendas por Período',
      headers: ['Período', 'Total Vendas', 'Valor Total', 'Ticket Médio'],
      data: data.vendasPorPeriodo.map(v => [
        v.periodo,
        v.totalVendas,
        formatarMoedaPDF(v.valorTotal),
        formatarMoedaPDF(v.ticketMedio)
      ])
    });
  }

  exportarRelatorioPDF({
    titulo: 'Relatório de Vendas',
    periodo: periodoLabel,
    kpis,
    tabelas
  });
}

/**
 * Exporta dados simples para PDF
 */
export function exportarTabelaPDF(
  titulo: string,
  headers: string[],
  data: (string | number)[][]
): void {
  exportarRelatorioPDF({
    titulo,
    periodo: new Date().toLocaleDateString('pt-BR'),
    kpis: [],
    tabelas: [{
      titulo: 'Dados',
      headers,
      data
    }]
  });
}
