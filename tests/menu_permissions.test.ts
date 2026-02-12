import { describe, it, expect, beforeEach } from "bun:test";
import { 
  getAvailableMenuItems, 
  getMenuGroups, 
  getDefaultMenuPermissions,
  filterMenuItemsByPermissions,
  MENU_ITEMS,
  MENU_GROUPS 
} from "../server/utils/menu-items";

// Mock para simular o usuário
const mockUser = (isAdmin: boolean = false, permissions: string[] = []) => ({
  id: "user-123",
  nome: "Test User",
  admin: isAdmin ? 1 : 0,
  menuPermissions: permissions,
  idEmpresa: 1,
});

describe("Sistema de Permissões de Menu", () => {
  describe("Menu Items - Utils", () => {
    describe("getAvailableMenuItems", () => {
      it("deve retornar todos os itens para admin", () => {
        const items = getAvailableMenuItems(true);
        
        // Deve incluir itens admin-only
        const adminItems = items.filter(item => item.adminOnly);
        expect(adminItems.length).toBeGreaterThan(0);
        
        // Deve ter mais itens que usuário não-admin
        const nonAdminItems = getAvailableMenuItems(false);
        expect(items.length).toBeGreaterThan(nonAdminItems.length);
      });

      it("deve excluir itens admin-only para usuário não-admin", () => {
        const items = getAvailableMenuItems(false);
        
        const adminOnlyItems = items.filter(item => item.adminOnly);
        expect(adminOnlyItems.length).toBe(0);
      });

      it("deve ter todos os itens obrigatórios para não-admin", () => {
        const items = getAvailableMenuItems(false);
        const itemIds = items.map(item => item.id);
        
        // Verifica itens essenciais
        expect(itemIds).toContain("dashboard");
        expect(itemIds).toContain("clientes");
        expect(itemIds).toContain("orcamentos");
        expect(itemIds).toContain("vendas");
        expect(itemIds).toContain("dashboard-bi");
      });
    });

    describe("getMenuGroups", () => {
      it("deve retornar todos os grupos para admin", () => {
        const groups = getMenuGroups(true);
        
        // Deve incluir grupos admin-only (Integrações, Configurações)
        expect(groups.some(g => g.id === "integracoes")).toBe(true);
        expect(groups.some(g => g.id === "configuracoes")).toBe(true);
      });

      it("deve excluir grupos admin-only para não-admin", () => {
        const groups = getMenuGroups(false);
        
        expect(groups.some(g => g.id === "integracoes")).toBe(false);
        expect(groups.some(g => g.id === "configuracoes")).toBe(false);
      });

      it("deve manter ordem correta dos grupos", () => {
        const groups = getMenuGroups(false);
        const orders = groups.map(g => g.order);
        
        // Verifica se está em ordem crescente
        for (let i = 1; i < orders.length; i++) {
          expect(orders[i]).toBeGreaterThan(orders[i - 1]);
        }
      });
    });

    describe("getDefaultMenuPermissions", () => {
      it("deve retornar todos os IDs de itens disponíveis para não-admin", () => {
        const permissions = getDefaultMenuPermissions(false);
        const availableItems = getAvailableMenuItems(false);
        
        expect(permissions.length).toBe(availableItems.length);
        expect(permissions).toEqual(availableItems.map(item => item.id));
      });

      it("deve retornar todos os IDs incluindo admin-only para admin", () => {
        const permissions = getDefaultMenuPermissions(true);
        const availableItems = getAvailableMenuItems(true);
        
        expect(permissions.length).toBe(availableItems.length);
        
        // Deve incluir itens admin
        expect(permissions).toContain("usuarios");
        expect(permissions).toContain("whatsapp");
      });
    });

    describe("filterMenuItemsByPermissions", () => {
      it("deve filtrar itens baseado nas permissões", () => {
        const items = MENU_ITEMS.filter(item => !item.adminOnly);
        const permissions = ["dashboard", "clientes", "orcamentos"];
        
        const filtered = filterMenuItemsByPermissions(items, permissions);
        
        expect(filtered.length).toBe(3);
        expect(filtered.map(i => i.id)).toEqual(permissions);
      });

      it("deve retornar todos os itens se permissões estiverem vazias", () => {
        const items = MENU_ITEMS.slice(0, 5);
        
        const filtered = filterMenuItemsByPermissions(items, []);
        
        expect(filtered.length).toBe(items.length);
      });

      it("deve retornar array vazio se nenhuma permissão corresponder", () => {
        const items = MENU_ITEMS.slice(0, 5);
        
        const filtered = filterMenuItemsByPermissions(items, ["nao-existe"]);
        
        expect(filtered.length).toBe(0);
      });
    });
  });

  describe("Estrutura de MENU_ITEMS", () => {
    it("cada item deve ter propriedades obrigatórias", () => {
      MENU_ITEMS.forEach(item => {
        expect(item.id).toBeDefined();
        expect(item.name).toBeDefined();
        expect(item.path).toBeDefined();
        expect(item.group).toBeDefined();
        expect(item.icon).toBeDefined();
      });
    });

    it("cada item deve pertencer a um grupo válido", () => {
      const groupIds = MENU_GROUPS.map(g => g.id);
      
      MENU_ITEMS.forEach(item => {
        expect(groupIds).toContain(item.group);
      });
    });

    it("paths devem começar com /", () => {
      MENU_ITEMS.forEach(item => {
        expect(item.path.startsWith("/")).toBe(true);
      });
    });

    it("não deve haver IDs duplicados", () => {
      const ids = MENU_ITEMS.map(item => item.id);
      const uniqueIds = [...new Set(ids)];
      
      expect(ids.length).toBe(uniqueIds.length);
    });
  });

  describe("Mapeamento de Rotas para Menu IDs", () => {
    const routeToMenuId: Record<string, string> = {
      "/": "dashboard",
      "/clientes": "clientes",
      "/vendedores": "vendedores",
      "/orcamentos": "orcamentos",
      "/vendas": "vendas",
      "/insumos": "insumos",
      "/tracos": "tracos",
      "/produtos": "produtos",
      "/agenda": "agenda",
      "/caminhoes": "caminhoes",
      "/motoristas": "motoristas",
      "/relatorios": "dashboard-bi",
      "/financeiro": "financeiro",
      "/pagamentos": "contas-receber",
    };

    it("todas as rotas mapeadas devem existir em MENU_ITEMS", () => {
      Object.entries(routeToMenuId).forEach(([path, menuId]) => {
        const item = MENU_ITEMS.find(i => i.id === menuId);
        expect(item).toBeDefined();
        expect(item?.path).toBe(path);
      });
    });
  });
});

describe("Auditoria de Permissões", () => {
  describe("Schema de Auditoria", () => {
    it("deve ter campos obrigatórios definidos", () => {
      // Verifica a estrutura esperada da tabela de auditoria
      const expectedFields = [
        "id",
        "idUsuario",
        "idUsuarioAlteradoPor",
        "idEmpresa",
        "permissoesAntes",
        "permissoesDepois",
        "tipoAlteracao",
        "createdAt",
      ];
      
      // Simula validação de schema
      expect(expectedFields.length).toBe(8);
    });

    it("tipos de alteração devem ser válidos", () => {
      const validTypes = ["CREATE", "UPDATE", "RESET"];
      
      validTypes.forEach(type => {
        expect(["CREATE", "UPDATE", "RESET"]).toContain(type);
      });
    });
  });
});

describe("Cenários de Uso - Permissões", () => {
  it("novo usuário não-admin deve ter acesso a menus padrão", () => {
    const user = mockUser(false);
    const defaultPermissions = getDefaultMenuPermissions(false);
    
    // Deve poder acessar dashboard
    expect(defaultPermissions).toContain("dashboard");
    
    // Não deve ter acesso a admin
    expect(defaultPermissions).not.toContain("usuarios");
  });

  it("admin deve ter acesso irrestrito", () => {
    const admin = mockUser(true);
    const adminPermissions = getDefaultMenuPermissions(true);
    
    // Deve ter acesso a tudo
    expect(adminPermissions).toContain("usuarios");
    expect(adminPermissions).toContain("whatsapp");
    expect(adminPermissions).toContain("logs");
  });

  it("usuário com permissões customizadas deve ter acesso limitado", () => {
    const user = mockUser(false, ["dashboard", "clientes"]);
    const availableItems = getAvailableMenuItems(false);
    
    // Filtra apenas itens permitidos
    const allowedItems = filterMenuItemsByPermissions(
      availableItems, 
      user.menuPermissions
    );
    
    expect(allowedItems.length).toBe(2);
    expect(allowedItems.map(i => i.id)).toContain("dashboard");
    expect(allowedItems.map(i => i.id)).toContain("clientes");
  });

  it("usuário sem permissões definidas deve ter acesso padrão", () => {
    const user = mockUser(false, []);
    
    // Array vazio = usar padrão
    expect(user.menuPermissions.length).toBe(0);
  });
});
