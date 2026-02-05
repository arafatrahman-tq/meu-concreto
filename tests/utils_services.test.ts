
import { describe, it, expect, mock, beforeEach } from "bun:test";
import { asaasService } from "../server/utils/asaas";
import { sicoobService } from "../server/utils/sicoob";

// Mock do Drizzle DB
mock.module("../server/database/db", () => ({
  db: {
    query: {
      configuracoesAsaas: {
        findFirst: mock(async () => ({
          apiKey: "asaas_key",
          environment: "sandbox",
        })),
      },
      configuracoesSicoob: {
        findFirst: mock(async () => ({
          clientId: "sicoob_id",
          certificate: "cert",
          privateKey: "key",
          environment: "sandbox",
        })),
      },
    },
  },
}));

describe("Utility Services (API Clients)", () => {
  const idEmpresa = 1;

  describe("asaasService", () => {
    it("should find an existing customer", async () => {
      // Mock da requisição global fetch do Bun
      const originalFetch = global.fetch;
      global.fetch = mock(async (url: string) => {
        if (url.includes("/customers?cpfCnpj=")) {
          return new Response(JSON.stringify({ data: [{ id: "cust_1" }] }));
        }
        return new Response(JSON.stringify({}));
      }) as any;

      const customerId = await asaasService.findOrCreateCustomer(idEmpresa, {
        name: "Teste",
        cpfCnpj: "12345678901",
      });

      expect(customerId).toBe("cust_1");
      global.fetch = originalFetch;
    });

    it("should create a new customer if not found", async () => {
      const originalFetch = global.fetch;
      global.fetch = mock(async (url: string) => {
        if (url.includes("/customers?cpfCnpj=")) {
          return new Response(JSON.stringify({ data: [] }));
        }
        if (url.endsWith("/customers") ) {
          return new Response(JSON.stringify({ id: "cust_new" }));
        }
        return new Response(JSON.stringify({}));
      }) as any;

      const customerId = await asaasService.findOrCreateCustomer(idEmpresa, {
        name: "Teste",
        cpfCnpj: "12345678901",
      });

      expect(customerId).toBe("cust_new");
      global.fetch = originalFetch;
    });

    it("should handle creation errors in asaas", async () => {
      const originalFetch = global.fetch;
      global.fetch = mock(async (url: string) => {
        if (url.includes("/customers?cpfCnpj=")) {
          return new Response(JSON.stringify({ data: [] }));
        }
        return new Response(JSON.stringify({ errors: [{ description: "Invalid CPF" }] }));
      }) as any;

      expect(asaasService.findOrCreateCustomer(idEmpresa, {
        name: "Teste",
        cpfCnpj: "000",
      })).rejects.toThrow("Erro ao criar cliente no Asaas");
      
      global.fetch = originalFetch;
    });
  });

  describe("sicoobService", () => {
    it("should get an auth token", async () => {
      const originalFetch = global.fetch;
      global.fetch = mock(async () => {
        return new Response(JSON.stringify({ access_token: "mock_token" }));
      }) as any;

      const token = await sicoobService.getToken(idEmpresa);
      expect(token).toBe("mock_token");

      global.fetch = originalFetch;
    });

    it("should handle auth failure in sicoob", async () => {
      const originalFetch = global.fetch;
      global.fetch = mock(async () => {
        return new Response("Unauthorized", { status: 401 });
      }) as any;

      expect(sicoobService.getToken(idEmpresa)).rejects.toThrow("Erro de autenticação Sicoob");

      global.fetch = originalFetch;
    });
  });
});
