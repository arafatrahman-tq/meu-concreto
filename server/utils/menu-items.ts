/**
 * Definição centralizada de todos os itens de menu disponíveis no sistema.
 * 
 * Cada item tem:
 * - id: Identificador único usado para permissões
 * - name: Nome exibido no menu
 * - path: Rota do Vue Router
 * - group: Grupo ao qual pertence
 * - icon: Nome do ícone Lucide
 * - adminOnly: Se true, só aparece para admins independente das permissões
 * - requiresAdmin: Se true, só pode ser habilitado por admins
 */

export interface MenuItem {
  id: string;
  name: string;
  path: string;
  group: string;
  icon: string;
  adminOnly?: boolean;
  requiresAdmin?: boolean;
  description?: string;
}

export const MENU_GROUPS = [
  { id: "inteligencia", title: "Inteligência de Gestão", order: 1 },
  { id: "comercial", title: "Comercial & CRM", order: 2 },
  { id: "producao", title: "Produção & Engenharia", order: 3 },
  { id: "logistica", title: "Logística & Frota", order: 4 },
  { id: "relatorios", title: "Relatórios & BI", order: 5 },
  { id: "financeiro", title: "Financeiro & Fiscal", order: 6 },
  { id: "integracoes", title: "Integrações", order: 7, adminOnly: true },
  { id: "configuracoes", title: "Configurações", order: 8, adminOnly: true },
] as const;

export const MENU_ITEMS: MenuItem[] = [
  // Inteligência de Gestão
  {
    id: "dashboard",
    name: "Dashboard Principal",
    path: "/",
    group: "inteligencia",
    icon: "LayoutDashboard",
    description: "Visão geral do sistema e KPIs principais",
  },
  {
    id: "analise",
    name: "Análise & Insights",
    path: "/gestao",
    group: "inteligencia",
    icon: "Activity",
    adminOnly: true,
    description: "Análises avançadas e insights de negócio",
  },
  {
    id: "fiscal-ai",
    name: "Fiscal AI Pulse",
    path: "/configuracoes/fiscal-ai",
    group: "inteligencia",
    icon: "Sparkles",
    adminOnly: true,
    description: "Assistente fiscal com IA",
  },

  // Comercial & CRM
  {
    id: "clientes",
    name: "Carteira de Clientes",
    path: "/clientes",
    group: "comercial",
    icon: "Users",
    description: "Cadastro e gestão de clientes",
  },
  {
    id: "vendedores",
    name: "Equipe de Vendedores",
    path: "/vendedores",
    group: "comercial",
    icon: "UserCheck",
    description: "Gestão da equipe comercial",
  },
  {
    id: "orcamentos",
    name: "Orçamentos",
    path: "/orcamentos",
    group: "comercial",
    icon: "FileStack",
    description: "Criação e gestão de orçamentos",
  },
  {
    id: "vendas",
    name: "Vendas Realizadas",
    path: "/vendas",
    group: "comercial",
    icon: "ShoppingBag",
    description: "Histórico de vendas e pedidos",
  },

  // Produção & Engenharia
  {
    id: "insumos",
    name: "Gestão de Insumos",
    path: "/insumos",
    group: "producao",
    icon: "Package",
    description: "Controle de estoque de insumos",
  },
  {
    id: "tracos",
    name: "Dosagem (Mix Design)",
    path: "/tracos",
    group: "producao",
    icon: "FlaskConical",
    description: "Fórmulas e dosagens de concreto",
  },
  {
    id: "produtos",
    name: "Tabela de Produtos",
    path: "/produtos",
    group: "producao",
    icon: "Layers",
    description: "Catálogo de produtos e serviços",
  },

  // Logística & Frota
  {
    id: "agenda",
    name: "Agenda de Entregas",
    path: "/agenda",
    group: "logistica",
    icon: "Calendar",
    description: "Agendamento e controle de entregas",
  },
  {
    id: "agenda-bombas",
    name: "Agenda de Bombas",
    path: "/bombas/agenda",
    group: "logistica",
    icon: "Activity",
    description: "Agendamento de bombas de concreto",
  },
  {
    id: "caminhoes",
    name: "Controle de Frota",
    path: "/caminhoes",
    group: "logistica",
    icon: "Truck",
    description: "Gestão de caminhões e veículos",
  },
  {
    id: "bombas",
    name: "Bombas de Concreto",
    path: "/bombas",
    group: "logistica",
    icon: "Activity",
    description: "Cadastro de bombas de concreto",
  },
  {
    id: "motoristas",
    name: "Cadastro Motoristas",
    path: "/motoristas",
    group: "logistica",
    icon: "UserCheck",
    description: "Gestão de motoristas",
  },

  // Relatórios & BI
  {
    id: "dashboard-bi",
    name: "Dashboard BI",
    path: "/relatorios",
    group: "relatorios",
    icon: "BarChart3",
    description: "Business Intelligence e relatórios",
  },

  // Financeiro & Fiscal
  {
    id: "financeiro",
    name: "Painel Financeiro",
    path: "/financeiro",
    group: "financeiro",
    icon: "BarChart",
    description: "Visão geral financeira",
  },
  {
    id: "contas-receber",
    name: "Contas a Receber",
    path: "/pagamentos",
    group: "financeiro",
    icon: "TrendingUp",
    description: "Gestão de recebimentos",
  },
  {
    id: "contas-pagar",
    name: "Contas a Pagar",
    path: "/financeiro/contas-pagar",
    group: "financeiro",
    icon: "TrendingDown",
    description: "Gestão de pagamentos",
  },
  {
    id: "inadimplencia",
    name: "Inadimplência",
    path: "/financeiro/inadimplencia",
    group: "financeiro",
    icon: "AlertTriangle",
    description: "Controle de inadimplência",
  },
  {
    id: "fornecedores",
    name: "Fornecedores",
    path: "/financeiro/fornecedores",
    group: "financeiro",
    icon: "Building2",
    description: "Cadastro de fornecedores",
  },
  {
    id: "formas-pagamento",
    name: "Formas de Pagamento",
    path: "/formas-pagamento",
    group: "financeiro",
    icon: "DollarSign",
    description: "Configuração de pagamentos",
  },
  {
    id: "centro-fiscal",
    name: "Centro Fiscal",
    path: "/configuracoes/fiscal",
    group: "financeiro",
    icon: "FileText",
    adminOnly: true,
    description: "Gestão fiscal e notas",
  },

  // Integrações (Admin Only)
  {
    id: "whatsapp",
    name: "Módulo WhatsApp",
    path: "/configuracoes/whatsapp",
    group: "integracoes",
    icon: "MessageSquare",
    adminOnly: true,
    description: "Integração com WhatsApp",
  },
  {
    id: "bling",
    name: "Módulo Bling",
    path: "/configuracoes/bling",
    group: "integracoes",
    icon: "Package",
    adminOnly: true,
    description: "Integração com ERP Bling",
  },
  {
    id: "asaas",
    name: "Gateway Asaas",
    path: "/configuracoes/asaas",
    group: "integracoes",
    icon: "CreditCard",
    adminOnly: true,
    description: "Configuração do Asaas",
  },
  {
    id: "sicoob",
    name: "Gateway Sicoob",
    path: "/configuracoes/sicoob",
    group: "integracoes",
    icon: "Landmark",
    adminOnly: true,
    description: "Configuração do Sicoob",
  },
  {
    id: "pix-manual",
    name: "Pix Manual",
    path: "/configuracoes/pix-manual",
    group: "integracoes",
    icon: "QrCode",
    adminOnly: true,
    description: "Configuração de Pix manual",
  },

  // Configurações (Admin Only)
  {
    id: "empresa",
    name: "Dados da Empresa",
    path: "/configuracoes/empresa",
    group: "configuracoes",
    icon: "Building2",
    adminOnly: true,
    description: "Dados cadastrais da empresa",
  },
  {
    id: "usuarios",
    name: "Usuários do Sistema",
    path: "/usuarios",
    group: "configuracoes",
    icon: "UserCog",
    adminOnly: true,
    description: "Gestão de usuários",
  },
  {
    id: "filiais",
    name: "Gestão de Filiais",
    path: "/empresas",
    group: "configuracoes",
    icon: "Building2",
    adminOnly: true,
    description: "Cadastro de filiais",
  },
  {
    id: "sistema",
    name: "Parâmetros Globais",
    path: "/configuracoes/sistema",
    group: "configuracoes",
    icon: "Settings",
    adminOnly: true,
    description: "Configurações do sistema",
  },
  {
    id: "logs",
    name: "Logs do Sistema",
    path: "/logs",
    group: "configuracoes",
    icon: "History",
    adminOnly: true,
    description: "Auditoria e logs",
  },
];

/**
 * Retorna todos os itens de menu disponíveis para um tipo de usuário
 */
export function getAvailableMenuItems(isAdmin: boolean): MenuItem[] {
  if (isAdmin) {
    return MENU_ITEMS;
  }
  // Usuários não-admin só veem itens que não são adminOnly
  return MENU_ITEMS.filter((item) => !item.adminOnly);
}

/**
 * Retorna os grupos de menu disponíveis
 */
export function getMenuGroups(isAdmin: boolean) {
  if (isAdmin) {
    return MENU_GROUPS;
  }
  return MENU_GROUPS.filter((g) => !g.adminOnly);
}

/**
 * Retorna os itens padrão para novos usuários (todos os não-admin)
 */
export function getDefaultMenuPermissions(isAdmin: boolean): string[] {
  return getAvailableMenuItems(isAdmin).map((item) => item.id);
}

/**
 * Filtra menu items baseado nas permissões do usuário
 */
export function filterMenuItemsByPermissions(
  items: MenuItem[],
  permissions: string[]
): MenuItem[] {
  // Se não há permissões definidas, retorna todos os items disponíveis
  if (!permissions || permissions.length === 0) {
    return items;
  }
  return items.filter((item) => permissions.includes(item.id));
}
