import { describe, it, expect } from "bun:test";
import {
  clienteSharedSchema,
  validarCpf,
  validarCnpj,
} from "../../../shared/schemas";

describe("clienteSharedSchema", () => {
  describe("Validação de campos obrigatórios", () => {
    it("deve validar cliente com dados válidos (CPF)", () => {
      const cliente = {
        nome: "João Silva",
        cpfCnpj: "529.982.247-25",
        telefone: "(11) 99999-9999",
        email: "joao@example.com",
        endereco: "Rua Teste",
        numero: "123",
        bairro: "Centro",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01001-000",
        complemento: "Apto 1",
      };

      const result = clienteSharedSchema.safeParse(cliente);
      expect(result.success).toBe(true);
    });

    it("deve validar cliente com dados válidos (CNPJ)", () => {
      const cliente = {
        nome: "Empresa Teste LTDA",
        cpfCnpj: "11.222.333/0001-81",
        telefone: "(11) 3333-4444",
        email: "contato@empresa.com",
        endereco: "Av. Principal",
        numero: "1000",
        bairro: "Industrial",
        cidade: "São Paulo",
        estado: "SP",
        cep: "04538-132",
      };

      const result = clienteSharedSchema.safeParse(cliente);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar nome com menos de 3 caracteres", () => {
      const cliente = {
        nome: "Jo",
        cpfCnpj: "529.982.247-25",
      };

      const result = clienteSharedSchema.safeParse(cliente);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("nome");
      }
    });

    it("deve rejeitar CPF inválido", () => {
      const cliente = {
        nome: "João Silva",
        cpfCnpj: "111.111.111-11",
      };

      const result = clienteSharedSchema.safeParse(cliente);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("CPF ou CNPJ inválido");
      }
    });

    it("deve rejeitar CNPJ inválido", () => {
      const cliente = {
        nome: "Empresa Teste",
        cpfCnpj: "11.111.111/1111-11",
      };

      const result = clienteSharedSchema.safeParse(cliente);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar email inválido", () => {
      const cliente = {
        nome: "João Silva",
        cpfCnpj: "529.982.247-25",
        email: "email-invalido",
      };

      const result = clienteSharedSchema.safeParse(cliente);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("email");
      }
    });

    it("deve aceitar campos opcionais vazios", () => {
      const cliente = {
        nome: "João Silva",
        cpfCnpj: "529.982.247-25",
      };

      const result = clienteSharedSchema.safeParse(cliente);
      expect(result.success).toBe(true);
    });
  });

  describe("Validação de CPF/CNPJ helpers", () => {
    it("validarCpf deve retornar true para CPF válido", () => {
      expect(validarCpf("52998224725")).toBe(true);
      expect(validarCpf("529.982.247-25")).toBe(true);
    });

    it("validarCpf deve retornar false para CPF inválido", () => {
      expect(validarCpf("11111111111")).toBe(false);
      expect(validarCpf("12345678900")).toBe(false);
      expect(validarCpf("")).toBe(false);
    });

    it("validarCnpj deve retornar true para CNPJ válido", () => {
      expect(validarCnpj("11222333000181")).toBe(true);
      expect(validarCnpj("11.222.333/0001-81")).toBe(true);
    });

    it("validarCnpj deve retornar false para CNPJ inválido", () => {
      expect(validarCnpj("11111111111111")).toBe(false);
      expect(validarCnpj("12345678000100")).toBe(false);
      expect(validarCnpj("")).toBe(false);
    });
  });

  describe("Validação de schema parcial (update)", () => {
    it("deve permitir atualização parcial", () => {
      const update = {
        nome: "João Silva Atualizado",
      };

      const result = clienteSharedSchema.partial().safeParse(update);
      expect(result.success).toBe(true);
    });

    it("deve permitir atualização de apenas telefone", () => {
      const update = {
        telefone: "(11) 88888-8888",
      };

      const result = clienteSharedSchema.partial().safeParse(update);
      expect(result.success).toBe(true);
    });
  });
});
