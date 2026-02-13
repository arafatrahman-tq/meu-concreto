import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  if (user.admin !== 1) {
    throw createError({ statusCode: 403, message: 'Não autorizado' })
  }

  const { prompt, apiKey } = await readBody(event)

  if (!apiKey) {
    throw createError({ statusCode: 400, message: 'Google Gemini API Key is required' })
  }

  // 1. Coletar contexto do sistema para o Agente
  const [schemaContent, rulesContent] = await Promise.all([
    import('fs/promises').then(fs => fs.readFile('server/database/schema.ts', 'utf-8')),
    import('fs/promises').then(fs => fs.readFile('server/utils/fiscal/rules.ts', 'utf-8')),
  ])

  const systemPrompt = `
You are the "Fiscal Specialist AI Orchestrator" for the 'Meu Concreto' platform.
Your objective is to help the user update fiscal rules and database mappings with a "Zero-Error Production" mindset.

SYSTEM CONTEXT:
--- DATABASE SCHEMA ---
${schemaContent.substring(0, 5000)}

--- FISCAL RULES CORE ---
${rulesContent}

--- SEFAZ BRAZIL RULES ---
Knowledge about CFOP, NCM, CSOSN, CBenef and EC 132/23 (Tax Reform).
Specifically follow the "Tabela de Alíquotas" transition path: CBS (0.9%) and IBS (0.1%).

USER REQUEST:
"${prompt}"

AGENCY PROTOCOL:
1. **Load Developer Specialist Skill**: Ensure Nuxt 4 and Drizzle ORM best practices.
2. **Load Security Auditor Skill**: Check for SQL Injection risks and multi-tenancy leaks (ensure idEmpresa isolation).
3. **Load Test Engineer Skill**: Mentally simulate execution. Any suggestion MUST be accompanied by a validation plan.

INSTRUCTIONS:
1. Respond in Portuguese (BR).
2. If the user asks for changes, provide a clear explanation with fiscal justification.
3. Keep the output code absolutely coherent with the existing "FiscalRulesEngine" class architecture.
4. **Mandatory Validation Step**: Before providing the "suggestion" object, perform an "Internal Checklist":
   - Security: Is idEmpresa handled?
   - Integrity: Are cross-references in Schema valid?
   - Compliance: Does it meet SEFAZ 2026 requirements?
5. If code changes are needed, provide a JSON object named "suggestion" with:
   {
     "file": "server/utils/fiscal/rules.ts",
     "type": "REPLACE_RULE",
     "newCode": "... full updated code ...",
     "overrides": {
        "UF-UF": { "aliqCBS": 0.012, "cfop": "5102" } 
     },
     "validationPath": "Describe exactly how the user should verify this (e.g., 'Check logs for CBS/IBS calculation')",
     "testCommand": "python .agent/scripts/checklist.py . (or specific vitest command)"
   }
   NOTE: 'overrides' is used for immediate dynamic hot-patching in production builds.

OUTPUT FORMAT:
Return a JSON with:
{
  "content": "Sua explicação detalhada em Markdown incluindo o 'Relatório de Validação Automática'",
  "suggestion": { ... object if applicable ... }
}
`

  try {
    const model = 'gemini-3-flash-preview'
    const response: any = await $fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      body: {
        contents: [{
          parts: [{ text: systemPrompt }],
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          thinkingConfig: {
            thinkingLevel: 'low',
          },
        },
      },
    })

    const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text
    if (!resultText) {
      throw new Error('Gemini retornou uma resposta vazia')
    }

    return JSON.parse(resultText)
  }
  catch (error: any) {
    console.error('AI Agent Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro no processamento do Agente AI: ' + (error.message || 'Falha na API Gemini'),
    })
  }
})
