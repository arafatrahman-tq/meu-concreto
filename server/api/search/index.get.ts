import { db } from "../../database/db";
import {
  clientes,
  orcamentos,
  produtos,
  vendedores,
  vendas,
  caminhoes,
  bombas,
  insumos,
  motoristas,
  fornecedores,
  usuarios,
  empresas,
} from "../../database/schema";
import { and, or, like, isNull, inArray, eq, sql } from "drizzle-orm";
import { getAuthenticatedUser } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const { q } = getQuery(event);

  if (!q || typeof q !== "string" || q.length < 2) {
    return { results: [] };
  }

  const user = event.context.user;
  const session = getAuthenticatedUser(event);

  if (!user || !session) {
    throw createError({ statusCode: 401, message: "Não autorizado" });
  }

  // A busca respeita a UNIDADE ATIVA da sessão
  const activeEmpresaId = session.idEmpresa;
  const empresaIdsAcesso = user.idEmpresasAcesso || [user.idEmpresa];
  const searchTerm = `%${q}%`;

  try {
    const [
      resClientes,
      resOrcamentos,
      resProdutos,
      resVendedores,
      resVendas,
      resCaminhoes,
      resBombas,
      resInsumos,
      resMotoristas,
      resFornecedores,
      resUsuarios,
      resEmpresas,
    ] = await Promise.all([
      db.query.clientes.findMany({
        where: and(
          eq(clientes.idEmpresa, activeEmpresaId),
          isNull(clientes.deletedAt),
          or(
            like(clientes.nome, searchTerm),
            like(clientes.cpfCnpj, searchTerm),
          ),
        ),
        limit: 10,
      }),
      db.query.orcamentos.findMany({
        where: and(
          eq(orcamentos.idEmpresa, activeEmpresaId),
          isNull(orcamentos.deletedAt),
          or(
            like(orcamentos.nomeCliente, searchTerm),
            like(orcamentos.produtoNome, searchTerm),
            like(sql`CAST(${orcamentos.id} AS TEXT)`, searchTerm),
          ),
        ),
        limit: 10,
      }),
      db.query.produtos.findMany({
        where: and(
          isNull(produtos.deletedAt),
          like(produtos.produto, searchTerm),
        ),
        limit: 10,
      }),
      db.query.vendedores.findMany({
        where: and(
          eq(vendedores.idEmpresa, activeEmpresaId),
          isNull(vendedores.deletedAt),
          like(vendedores.nome, searchTerm),
        ),
        limit: 10,
      }),
      db.query.vendas.findMany({
        where: and(
          eq(vendas.idEmpresa, activeEmpresaId),
          isNull(vendas.deletedAt),
          or(
            like(sql`CAST(${vendas.id} AS TEXT)`, searchTerm),
            like(vendas.status, searchTerm),
          ),
        ),
        with: {
          orcamento: true,
        },
        limit: 10,
      }),
      db.query.caminhoes.findMany({
        where: and(
          eq(caminhoes.idEmpresa, activeEmpresaId),
          isNull(caminhoes.deletedAt),
          or(
            like(caminhoes.placa, searchTerm),
            like(caminhoes.modelo, searchTerm),
          ),
        ),
        limit: 5,
      }),
      db.query.bombas.findMany({
        where: and(
          eq(bombas.idEmpresa, activeEmpresaId),
          isNull(bombas.deletedAt),
          or(like(bombas.nome, searchTerm), like(bombas.placa, searchTerm)),
        ),
        limit: 5,
      }),
      db.query.insumos.findMany({
        where: and(
          eq(insumos.idEmpresa, activeEmpresaId),
          isNull(insumos.deletedAt),
          like(insumos.nome, searchTerm),
        ),
        limit: 5,
      }),
      db.query.motoristas.findMany({
        where: and(
          eq(motoristas.idEmpresa, activeEmpresaId),
          isNull(motoristas.deletedAt),
          like(motoristas.nome, searchTerm),
        ),
        limit: 5,
      }),
      db.query.fornecedores.findMany({
        where: and(
          eq(fornecedores.idEmpresa, activeEmpresaId),
          isNull(fornecedores.deletedAt),
          like(fornecedores.nome, searchTerm),
        ),
        limit: 5,
      }),
      db.query.usuarios.findMany({
        where: and(
          eq(usuarios.idEmpresa, activeEmpresaId),
          isNull(usuarios.deletedAt),
          or(
            like(usuarios.nome, searchTerm),
            like(usuarios.usuario, searchTerm),
          ),
        ),
        limit: 5,
      }),
      db.query.empresas.findMany({
        where: and(
          inArray(empresas.id, empresaIdsAcesso),
          isNull(empresas.deletedAt),
          or(
            like(empresas.empresa, searchTerm),
            like(empresas.filial, searchTerm),
          ),
        ),
        limit: 5,
      }),
    ]);

    const formattedResults = [
      ...resClientes.map((c) => ({
        id: c.id,
        title: c.nome,
        subtitle: c.cpfCnpj,
        category: "Clientes",
        icon: "Users",
        path: `/clientes?q=${encodeURIComponent(c.nome)}`,
      })),
      ...resOrcamentos.map((o) => ({
        id: o.id,
        title: `Orçamento #${String(o.id).padStart(4, "0")}`,
        subtitle: o.nomeCliente,
        category: "Orçamentos",
        icon: "FileStack",
        path: `/orcamentos?id=${o.id}`,
      })),
      ...resVendas.map((v) => ({
        id: v.id,
        title: `Venda #${String(v.id).padStart(4, "0")}`,
        subtitle: v.orcamento?.nomeCliente || "Cliente não identificado",
        category: "Vendas",
        icon: "ShoppingBag",
        path: `/vendas?id=${v.id}`,
      })),
      ...resProdutos.map((p) => ({
        id: p.id,
        title: p.produto,
        subtitle: `Valor: ${p.valorVenda ? (p.valorVenda / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "---"}`,
        category: "Produtos",
        icon: "Package",
        path: `/produtos?q=${encodeURIComponent(p.produto)}`,
      })),
      ...resVendedores.map((v) => ({
        id: v.id,
        title: v.nome,
        subtitle: v.telefone,
        category: "Vendedores",
        icon: "UserCheck",
        path: `/vendedores?q=${encodeURIComponent(v.nome)}`,
      })),
      ...resInsumos.map((i) => ({
        id: i.id,
        title: i.nome,
        subtitle: `Estoque: ${i.estoqueAtual} ${i.unidadeMedida}`,
        category: "Insumos",
        icon: "Package",
        path: `/insumos?q=${encodeURIComponent(i.nome)}`,
      })),
      ...resMotoristas.map((m) => ({
        id: m.id,
        title: m.nome,
        subtitle: m.telefone,
        category: "Equipe",
        icon: "UserCheck",
        path: `/motoristas?q=${encodeURIComponent(m.nome)}`,
      })),
      ...resUsuarios.map((u) => ({
        id: u.id,
        title: u.nome,
        subtitle: u.usuario,
        category: "Usuários",
        icon: "UserCog",
        path: `/usuarios?q=${encodeURIComponent(u.nome)}`,
      })),
      ...resEmpresas.map((e) => ({
        id: e.id,
        title: e.empresa,
        subtitle: e.filial || "Matriz",
        category: "Unidades",
        icon: "Building2",
        path: `/empresas?q=${encodeURIComponent(e.empresa)}`,
      })),
      ...resFornecedores.map((f) => ({
        id: f.id,
        title: f.nome,
        subtitle: f.cnpj,
        category: "Financeiro",
        icon: "Building2",
        path: `/financeiro/fornecedores?q=${encodeURIComponent(f.nome)}`,
      })),
      ...resCaminhoes.map((c) => ({
        id: c.id,
        title: c.placa,
        subtitle: c.modelo,
        category: "Frota",
        icon: "Truck",
        path: `/caminhoes?id=${c.id}`,
      })),
      ...resBombas.map((b) => ({
        id: b.id,
        title: b.nome,
        subtitle: b.placa,
        category: "Equipamentos",
        icon: "Activity",
        path: `/bombas?id=${b.id}`,
      })),
    ];

    return { results: formattedResults };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }
});
