import { describe, it, expect } from "bun:test";
import {
  clienteSchema,
  empresaSchema,
  produtoSchema,
} from "../server/utils/validador";

describe("Zod Validators Unit Tests", () => {
  describe("clienteSchema", () => {
    it("should validate a valid CPF client", () => {
      const validClient = {
        nome: "João Silva",
        cpfCnpj: "123.456.789-09",
        email: "joao@example.com",
        idEmpresa: 1,
        cep: "12345-678",
        estado: "SP",
      };

      const result = clienteSchema.safeParse(validClient);
      if (!result.success) {
        console.log("Validation errors:", result.error.format());
      }
      expect(result.success).toBe(true);
    });

    it("should fail on invalid CPF", () => {
      const invalidClient = {
        nome: "João Silva",
        cpfCnpj: "111.111.111-11", // CPF inválido (todos dígitos iguais)
        idEmpresa: 1,
      };

      const result = clienteSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("CPF ou CNPJ inválido");
      }
    });

    it("should validate a valid CNPJ client", () => {
      const validClient = {
        nome: "Minha Empresa LTDA",
        cpfCnpj: "12.345.678/0001-95", // CNPJ válido
        idEmpresa: 1,
      };

      const result = clienteSchema.safeParse(validClient);
      expect(result.success).toBe(true);
    });

    it("should fail on too short name", () => {
      const invalidClient = {
        nome: "Jo",
        cpfCnpj: "031.543.890-32",
        idEmpresa: 1,
      };

      const result = clienteSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });
  });

  describe("empresaSchema", () => {
    it("should validate a valid empresa with fiscal fields", () => {
      const validEmpresa = {
        empresa: "Concreto Forte",
        cnpj: "12.345.678/0001-95",
        email: "contato@concreto.com",
        crt: 1,
        codigoServicoMunicipal: "07.02",
      };

      const result = empresaSchema.safeParse(validEmpresa);
      expect(result.success).toBe(true);
    });

    it("should fail on invalid CRT", () => {
      const invalidEmpresa = {
        empresa: "Concreto Forte",
        cnpj: "12.345.678/0001-95",
        crt: 5, // CRT goes from 1 to 3
      };

      const result = empresaSchema.safeParse(invalidEmpresa);
      expect(result.success).toBe(false);
    });

    it("should fail on invalid email", () => {
      const invalidEmpresa = {
        empresa: "Concreto Forte",
        cnpj: "12.345.678/0001-95",
        email: "email-invalido",
      };

      const result = empresaSchema.safeParse(invalidEmpresa);
      expect(result.success).toBe(false);
    });
  });

  describe("produtoSchema", () => {
    it("should fail on negative values", () => {
      const invalidProduto = {
        produto: "Brita 1",
        valorVenda: -100,
      };

      const result = produtoSchema.safeParse(invalidProduto);
      expect(result.success).toBe(false);
    });
  });
});
