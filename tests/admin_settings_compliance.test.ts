import { describe, it, expect } from "bun:test";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const projectRoot = join(import.meta.dir, "..");

const checkFileCompliance = (filePath: string) => {
  const fullPath = join(projectRoot, filePath);
  try {
    const content = readFileSync(fullPath, "utf8");
    return {
      exists: true,
      hasIdEmpresaFilter: content.includes("idEmpresa"),
      usesRequireAuth:
        content.includes("requireAuth") ||
        content.includes("requireAdmin") ||
        content.includes("event.context.user"),
      isGlobalTable:
        filePath.includes("forma-pgto") ||
        filePath.includes("empresas/index.get.ts"),
      content,
    };
  } catch (e) {
    return { exists: false };
  }
};

describe("Admin & Settings multi-tenancy Static Analysis", () => {
  const files = [
    "server/api/configuracoes/asaas.get.ts",
    "server/api/configuracoes/bling.get.ts",
    "server/api/configuracoes/whatsapp.get.ts",
    "server/api/configuracoes/sistema.get.ts",
    "server/api/forma-pgto/index.get.ts",
    "server/api/logs/index.get.ts",
    "server/api/empresas/index.get.ts",
  ];

  for (const file of files) {
    it(`should be compliant: ${file}`, () => {
      const compliance = checkFileCompliance(file);
      if (!compliance.exists) return;

      expect(compliance.usesRequireAuth).toBe(true);

      if (!compliance.isGlobalTable) {
        expect(compliance.hasIdEmpresaFilter).toBe(true);
      }
    });
  }
});
