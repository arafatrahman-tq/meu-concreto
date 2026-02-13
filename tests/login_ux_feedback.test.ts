import { describe, it, expect } from 'bun:test'
import { usuarioSchema } from '../server/utils/validador'

describe('Frontend: Login UX & Validation Rules', () => {
  it('should enforce at least 6 characters for password in schema', () => {
    const invalidPayload = {
      nome: 'Teste',
      usuario: 'teste',
      email: 'teste@teste.com',
      senha: '123', // Too short
      idEmpresa: 1,
    }

    const result = usuarioSchema.safeParse(invalidPayload)
    expect(result.success).toBe(false)
    if (!result.success) {
      const senhaError = result.error.issues.find(i =>
        i.path.includes('senha'),
      )
      expect(senhaError?.message).toBe(
        'A senha deve ter pelo menos 6 caracteres',
      )
    }
  })

  it('should contain properly coded Toast logic in login.vue', async () => {
    const filePath = 'app/pages/login.vue'
    const content = await Bun.file(filePath).text()

    // Check if we handle password length on client-side before submission
    // We check for the condition in a way that handles formatting
    expect(content.includes('password.length < 6')).toBe(true)

    // Check if we show error toasts (loosely to avoid quote/formatting issues)
    expect(content.includes('6 caracteres por segurança')).toBe(true)

    // Check if we show the 'verifying' info toast
    expect(content.includes('Verificando credenciais no servidor...')).toBe(
      true,
    )
  })
})

describe('Frontend: UI Toast System Consistency', () => {
  it('should have a BaseToast component handling type mapping', async () => {
    const filePath = 'app/components/ui/BaseToast.vue'
    const exists = await Bun.file(filePath).exists()
    expect(exists).toBe(true)

    const content = await Bun.file(filePath).text()
    // Verify it handles success/error classes with theme variables
    expect(content.includes('toast.type === \'success\'')).toBe(true)
    expect(content.includes('toast.type === \'error\'')).toBe(true)
    expect(content.includes('bg-danger')).toBe(true) // Error color (theme variable)
    expect(content.includes('bg-success')).toBe(true) // Success color (theme variable)
  })
})
