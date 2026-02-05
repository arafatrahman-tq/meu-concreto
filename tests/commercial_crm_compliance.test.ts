import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

const projectRoot = join(import.meta.dir, "..");

const checkFileCompliance = (filePath: string) => {
  const fullPath = join(projectRoot, filePath);
  const content = readFileSync(fullPath, "utf8");

  return {
    hasDeletedAtFilter: content.includes("deletedAt"),
    hasIdEmpresaFilter: content.includes("idEmpresa"),
    hasMultiCompanySupport: content.includes("idEmpresasAcesso"),
    usesRequireAuth: content.includes("requireAuth"),
    content,
  };
};

describe("Commercial & CRM multi-tenancy Static Analysis", () => {
  const files = [
    "server/api/orcamentos/index.get.ts",
    "server/api/clientes/index.get.ts",
    "server/api/vendedores/index.get.ts",
    "server/api/vendas/index.get.ts",
    "server/api/orcamentos/index.post.ts",
  ];

  for (const file of files) {
    it(`should be compliant: ${file}`, () => {
      const compliance = checkFileCompliance(file);

      expect(compliance.usesRequireAuth).toBe(true);
      expect(compliance.hasIdEmpresaFilter).toBe(true);

      // GET endpoints should have soft-delete and multi-company support
      if (file.endsWith(".get.ts")) {
        expect(compliance.hasDeletedAtFilter).toBe(true);
        if (!compliance.hasMultiCompanySupport) {
          console.warn(
            `[WARN] ${file} is missing idEmpresasAcesso support (Multi-company view).`,
          );
        }
      }
    });
  }
});
