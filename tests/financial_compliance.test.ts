
import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

const projectRoot = join(import.meta.dir, '..');

const checkFileCompliance = (filePath: string) => {
  const fullPath = join(projectRoot, filePath);
  const content = readFileSync(fullPath, 'utf8');
  
  return {
    hasDeletedAtFilter: content.includes('deletedAt'),
    hasIdEmpresaFilter: content.includes('idEmpresa'),
    hasMultiCompanySupport: content.includes('idEmpresasAcesso'),
    usesRequireAuth: content.includes('requireAuth'),
    content
  };
};

describe('Financial Multi-tenancy Static Analysis', () => {
  const files = [
    'server/api/contas-pagar/index.get.ts',
    'server/api/pagamentos/index.get.ts',
    'server/api/vendas/index.get.ts',
    'server/api/fornecedores/index.get.ts'
  ];

  for (const file of files) {
    it(`should be compliant: ${file}`, () => {
      const compliance = checkFileCompliance(file);
      
      expect(compliance.usesRequireAuth).toBe(true);
      expect(compliance.hasIdEmpresaFilter).toBe(true);
      expect(compliance.hasDeletedAtFilter).toBe(true);
      
      // Reporting inconsistencies
      if (!compliance.hasMultiCompanySupport) {
        console.warn(`[WARN] ${file} is missing idEmpresasAcesso support.`);
      }
    });
  }
});
