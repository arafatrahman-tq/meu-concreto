import { describe, it, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'

const projectRoot = join(import.meta.dir, '..')

const checkFileCompliance = (filePath: string) => {
  const fullPath = join(projectRoot, filePath)
  try {
    const content = readFileSync(fullPath, 'utf8')
    return {
      exists: true,
      hasDeletedAtFilter: content.includes('deletedAt'),
      hasIdEmpresaFilter: content.includes('idEmpresa'),
      hasMultiCompanySupport: content.includes('idEmpresasAcesso'),
      usesRequireAuth:
        content.includes('requireAuth') || content.includes('requireAdmin'),
      isGlobalTable: filePath.includes('produtos'), // Produtos are shared in schema
      content,
    }
  } catch (error: any) {
    return { exists: false }
  }
}

describe('Operational, Logistics & Inventory multi-tenancy Static Analysis', () => {
  const categories = {
    Logistics: ['bombas', 'caminhoes', 'entregas', 'motoristas'],
    Inventory: ['insumos', 'tracos', 'produtos'],
    HR: ['usuarios'],
  }

  for (const [category, modules] of Object.entries(categories)) {
    for (const module of modules) {
      const file = `server/api/${module}/index.get.ts`

      it(`[${category}] should be compliant: ${file}`, () => {
        const compliance = checkFileCompliance(file)

        if (!compliance.exists) return

        expect(compliance.usesRequireAuth).toBe(true)

        if (!compliance.isGlobalTable) {
          expect(compliance.hasIdEmpresaFilter).toBe(true)
        }

        expect(compliance.hasDeletedAtFilter).toBe(true)

        if (!compliance.hasMultiCompanySupport && !compliance.isGlobalTable) {
          console.warn(`[WARN] ${file} is missing idEmpresasAcesso support.`)
        }
      })
    }
  }
})

describe('Operational POST/PUT compliance', () => {
  const modules = [
    'bombas',
    'caminhoes',
    'motoristas',
    'insumos',
    'tracos',
    'produtos',
  ]

  for (const module of modules) {
    const postFile = `server/api/${module}/index.post.ts`
    it(`should have multi-tenancy on POST: ${postFile}`, () => {
      const compliance = checkFileCompliance(postFile)
      if (!compliance.exists) return

      expect(compliance.usesRequireAuth).toBe(true)

      if (!compliance.isGlobalTable) {
        expect(compliance.hasIdEmpresaFilter).toBe(true)
      }
    })
  }
})
