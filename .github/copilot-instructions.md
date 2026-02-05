# Copilot Instructions for Meu Concreto

Project overview: A management system for concrete plants built with Nuxt 4, Drizzle ORM, and Bun SQLite.

## Project Structure

- `app/`: Frontend (Vue 3, Nuxt 4 style).
  - `components/ui/`: Reusable base components ([app/components/ui/BaseInput.vue](../app/components/ui/BaseInput.vue)).
  - `pages/`: Application routes.
- `server/`: Backend logic.
  - `api/`: REST endpoints using `defineEventHandler`.
  - `database/`: Schema ([server/database/schema.ts](../server/database/schema.ts)) and DB init ([server/database/db.ts](../server/database/db.ts)).
  - `utils/`: Shared logic like Zod validators ([server/utils/validador.ts](../server/utils/validador.ts)).

## Tech Stack

- **Nuxt 4**: Uses `app/` and `server/` directories.
- **Drizzle ORM + Bun SQLite**: For database operations.
- **Tailwind CSS 4**: For styling (utility-first).
- **Zod**: For data validation.
- **Lucide Vue Next**: Standard icon set.

## Coding Patterns

### Database Access

Always use the `db` instance from `@/server/database/db`. Use Drizzle's relational queries or SQL-like syntax.

```typescript
import { db } from "../../database/db";
import { clientes } from "../../database/schema";
// Relational query
const result = await db.query.clientes.findFirst({
  where: eq(clientes.id, id),
});
```

### API Endpoints

Endpoints should follow this pattern:

1. Extract body/params.
2. Validate using Zod schemas from `server/utils/validador.ts`.
3. Perform DB operation.
4. Return response or throw `createError`.
   Example: [server/api/clientes/index.post.ts](../server/api/clientes/index.post.ts)

### Multi-tenancy

Most entities are tied to an `empresa` via `idEmpresa`. Ensure this field is handled in CRUD operations.

### Frontend Conventions

- Use `<script setup>` in Vue components.
- Prefer Tailwind utility classes for styling.
- Use `useFetch` or `useAsyncData` for data fetching.
- Components are auto-imported by Nuxt.
- **Dynamic Fields**: Fields with automatic functions (like CEP lookup) must have a `BaseTooltip` next to the label with a `HelpCircle` icon explaining the behavior.

## AI Agent Guidelines

- **Always use agents in `.agent`**: For complex tasks, architectural guidance, or specific domain logic, always refer to the definitions and instructions located in the `.agent/` directory.

## Common Tasks

- **Migration**: Run `bunx drizzle-kit generate` and `bunx drizzle-kit push` (or follow Drizzle docs).
- **Development**: `bun run dev`
- **Build**: `bun run build`
