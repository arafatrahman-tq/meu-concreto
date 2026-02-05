# Configuração Global e Feature Flags - Manual do Usuário

Este sistema permite gerenciar variáveis de ambiente, regras de negócio e o estado das funcionalidades do sistema em tempo real, sem a necessidade de novos deploys.

## 🚀 Como Acessar

1. Faça login como **Administrador**.
2. No menu lateral, expanda a seção **Configurações**.
3. Clique em **Configuração Global**.

---

## 🛠️ Gerenciando Configurações

### Categorias Disponíveis
- **FEATURE_FLAG**: Chaves booleanas (true/false) para ativar ou desativar funcionalidades (ex: `MODO_MANUTENCAO`).
- **NEGOCIO**: Regras específicas como taxas, validade padrão de orçamentos, etc.
- **UI**: Personalizações de layout (ex: `NOME_DO_SISTEMA`).
- **GERAL**: Variáveis diversas de sistema.

### Escopo (Scope)
- **Global**: A configuração afetará **todas** as empresas cadastradas no portal.
- **Esta Empresa**: A configuração afetará apenas a unidade em que o administrador está logado.

---

## 🧪 Exemplos de Uso

### 1. Ativar Modo Manutenção
Para travar o acesso de usuários comuns enquanto você realiza ajustes:
- **Chave**: `MAINTENANCE_MODE`
- **Categoria**: `FEATURE_FLAG`
- **Valor**: `true`
- **Escopo**: `Global`

### 2. Definir Validade de Orçamento
- **Chave**: `ORCAMENTO_VALIDADE_DIAS`
- **Categoria**: `NEGOCIO`
- **Valor**: `7`
- **Escopo**: `Esta Empresa`

---

## 👨‍💻 Para Desenvolvedores (Uso do Composable)

Para utilizar uma configuração no frontend, utilize o composable `useSettings`:

```javascript
<script setup>
const { isFeatureEnabled, getSetting } = useSettings()

// Verificar uma Feature Flag
const maintenance = computed(() => isFeatureEnabled('MAINTENANCE_MODE'))

// Pegar um valor específico (Ex: Dias de validade)
const validade = getSetting('ORCAMENTO_VALIDADE_DIAS', 5) // 5 é o default
</script>
```

### Segurança das Chaves
- **Globais**: Apenas o administrador master pode editar/criar.
- **Locais**: Vinculadas ao `idEmpresa`, priorizam a regra local sobre a global se houver duplicidade de nomes (implementação futura pronta no backend).

---

> **Atenção**: Valores inseridos no campo **Valor** devem ser strings simples ou JSON válido. Tenha cuidado ao alterar chaves globais.
