import { db } from "../../database/db";
import {
  clientes,
  orcamentos,
  produtos,
  vendedores,
} from "../../database/schema";
import { and, or, like, isNull, inArray } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const { q } = getQuery(event);

  if (!q || typeof q !== "string" || q.length < 2) {
    return { results: [] };
  }

  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, message: "Não autorizado" });
  }

  const empresaIds = user.idEmpresasAcesso || [user.idEmpresa];
  const searchTerm = `%${q}%`;

  try {
    const [resClientes, resOrcamentos, resProdutos, resVendedores] =
      await Promise.all([
        db.query.clientes.findMany({
          where: and(
            inArray(clientes.idEmpresa, empresaIds),
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
            inArray(orcamentos.idEmpresa, empresaIds),
            isNull(orcamentos.deletedAt),
            or(
              like(orcamentos.nomeCliente, searchTerm),
              like(orcamentos.produtoNome, searchTerm),
            ),
          ),
          limit: 10,
        }),
        db.query.produtos.findMany({
          where: and(
            isNull(produtos.deletedAt),
            like(produtos.produto, searchTerm)
          ),
          limit: 10,
        }),
        db.query.vendedores.findMany({
          where: and(
            inArray(vendedores.idEmpresa, empresaIds),
            isNull(vendedores.deletedAt),
            like(vendedores.nome, searchTerm),
          ),
          limit: 10,
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
        path: `/orcamentos?q=${o.id}`,
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
    ];

    return { results: formattedResults };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }
});
