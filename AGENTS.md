# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Project Overview

La Coop de la médiation numérique is a digital mediation platform for professionals, built for ANCT (Agence Nationale de la Cohésion des Territoires). It uses the French government's design system (DSFR) and is structured as a monorepo using pnpm workspaces.

## Common Commands

### Development

```bash
pnpm docker:start          # Start PostgreSQL and MailDev containers
pnpm db:init                # Generate Prisma client and run migrations
pnpm start:web              # Start web app at http://localhost:3001
pnpm dev                    # Start web app + Storybook (http://localhost:6006)
pnpm fixtures:load          # Load test data
```

### Linting & Type Checking

```bash
pnpm -F web lint:fix && pnpm -F web tsc   # Lint fix + type check (preferred)
pnpm -F web lint:biome                    # Check formatting and linting
pnpm -F web tsc                           # TypeScript check only
```

### Testing

```bash
pnpm test                                             # Unit tests of every package, then web
pnpm -F web test                                      # Unit tests
pnpm -F web test path/to/file.spec.ts                 # Single unit test file (no `--`: Vitest ignores what follows it)
pnpm -F web test:integration                          # Integration tests: hit DATABASE_URL, run them on a throwaway database
pnpm -F web test:integration path/to/file.integration.ts     # Single integration test
pnpm test:e2e                                         # E2E tests with Cypress
```

Le serveur web doit tourner avec `IS_E2E=true` (`IS_E2E=true pnpm start:web`) : c'est ce qui
bascule l'API Dataspace en mock. Sans ça, les parcours conseiller numérique échouent — l'API
réelle ne reconnaît pas les utilisateurs de fixtures, et l'inscription les traite comme des
médiateurs ordinaires. La CI pose la variable dans le `.env` avant de construire.

### Database

```bash
pnpm prisma:generate-migration migration_name   # Create new migration
pnpm docker:reset                               # Reset database and reinitialize
```

### CLI Jobs

```bash
pnpm cli job:execute <job-name>     # Execute a background job
```

## Architecture

Architecture decisions and their rationale are recorded in `docs/adr/`; the normative rules, with stable IDs, are in `.claude/conventions/feature-architecture.md`.

### Monorepo Structure

- **apps/web**: Next.js full-stack application (App Router, React Server Components)
- **apps/cli**: CLI tools for deployment, jobs, and maintenance
- **infrastructure**: Infrastructure as code (HCL / OpenTofu for Scaleway)
- **packages/ui**: Shared UI components based on DSFR
- **packages/emails**: Email templates (MJML)
- **packages/config**: Environment configuration and Scaleway secrets helpers
- **packages/fixtures**: Test data fixtures
- **packages/storybook**: Storybook configuration
- **packages/e2e**: Cypress E2E tests

### Web App Structure (apps/web/src)

- **app/**: Next.js App Router pages
  - `(public)/`: Unauthenticated pages
  - `coop/`: Main authenticated area
  - `administration/`: Admin pages
  - `api/`: API routes including REST API v1
  - `_actions/`: server actions, one file per ability, composing its ports
- **features/**: Feature modules (activites, inscription, mediateurs, etc.)
- **jobs/**: Background job implementations
- **auth/**: Authentication with NextAuth.js
- **components/**: Shared React components

### Key Technologies

- **Backend**: Next.js server actions, Prisma ORM, PostgreSQL
- **Frontend**: React 19, Next.js 16 (App Router), DSFR (French gov design system) through react-dsfr
- **Forms**: TanStack Form through `useAppForm` (`libs/form`), validated with Zod; react-hook-form only survives in legacy forms
- **Testing**: Vitest everywhere (unit and integration, no isolation, no mocks), Cucumber (BDD), Cypress (E2E)
- **Linting**: Biome (not ESLint for formatting/linting)

### Server Actions

Each ability exposes its contract in `features/<feature>/abilities/<ability>/action/` (`.validation.ts`, `.errors.ts`, `.key.ts`). The server action lives in `apps/web/src/app/_actions/<feature>/<ability>.action.ts` and is built with `actionBuilder()` from `@app/web/configuration/nextjs`, already wired to the error reporter (`withAuth`, `withMaintenance`, `withInput`, `fromResult` come from `@app/web/libraries/nextjs`). Client components call it through `inject(KEY)`; the route binds it with `<ClientBinder bind={KEY} to={action}>`.

### Telemetry

- Only `apps/web/src/configuration/telemetry` imports `@sentry/nextjs`. Each module there has `index.prod.ts`, `index.dev.ts` and `index.ephemeral.ts`; `pnpm -F web generate:implementations` copies the one named by `ENV` (default `dev`) to the git-ignored `index.ts`. Postinstall generates `dev`, CI sets `ENV=ephemeral`, the build regenerates `prod`.
- Composition roots (`app/`, jobs, `auth`) and `implementation/` modules take `errorReporter` or `signaler` from the configuration; domain, commands, UI logic and libraries receive what they need by injection. External calls are wrapped with `instrument` in `configuration/<service>` (e.g. `configuration/ban`).
- Tests never mock modules nor spy on calls: inject hand-written dependencies and assert on results.

### Client/Server Components

- Page files (`page.tsx`) should be server components
- Interactive components use `'use client'` directive
- Client components receive server actions by injection (`inject(KEY)`), bound by the route with `ClientBinder`

## Domain Modeling (new features in `features/[feature]/domain/`)

### Value Objects

- Every business primitive uses `defineModel` from `libraries/model` with `.brand()`
- One file per value object, validation lives in the value object (min, max, regex, enum)
- Enums also use `defineModel(z.enum(...).brand('Name'))` — no raw string literals
- Smart constructors are the ONLY way to create instances — never use `as` to cast

### Entity Types

- All fields `readonly`
- No `string | null` — use branded value objects
- If a boolean partitions fields → discriminated union (e.g. `anonyme: true/false`)
- If two fields encode one state → discriminated union (e.g. `ContactTelephone`)
- If null = an enum value → use the enum default, not null (e.g. `Genre('NonCommunique')`)
- `| null` only for genuine absence with no hidden semantics

### Domain Functions

- Take validated types (value objects), not raw input
- Return validated types
- Pure (no side effects, no infra imports)

### Transfer Layer (`db/`)

- Smart constructors for Prisma → domain (validates DB data)
- Natural assignment for domain → Prisma (branded types are structurally assignable)
- No `as`, no `!` — use `?? defaultValue` and let smart constructors validate
- Map `null ↔ NonCommunique` for enums

### Tests

- Use smart constructors in fixtures — never `as Type`
- Round-trip test on transfer layer (domain → fromDomain → toDomain = identity)

### Code Style (applies everywhere)

- Zero `let` — all `const`
- Zero `else` — early returns, ternaries, or pattern matching
- Zero `for`/`for...of` — use `filter`, `map`, `reduce`, `find`
- Zero mutation — spread or functional methods
- Declarative data tables over if/else cascades
- Extract for naming (the "what"), not for size

## Coding Conventions

### File Naming

- Tests: `*.spec.ts` (unit), `*.integration.ts` (integration)
- React components: PascalCase (`MyComponent.tsx`)
- CSS modules: `*.module.css` or `*.module.scss`

### Prisma Schema

- Located at `apps/web/prisma/schema.prisma`
- Use `@@map("snake_case")` for table names
- Use `@map("snake_case")` for foreign keys

### CSS Classes

Use DSFR utility classes: `fr-container`, `fr-grid-row`, `fr-col-12`, `fr-mt-8v`, etc.

## ADR

Les agents rédigent les ADR de `docs/adr/` en suivant le modèle [`docs/adr/000-modele.md`](docs/adr/000-modele.md), qui porte toutes les règles de rédaction. Les trois premières :

- L'ADR pose les décisions et leurs raisons, de façon générique, et renvoie vers les `*.ability.md` (specs exécutables, qui font foi) pour le détail : aucun nom de fonction, de fichier ou de ligne de code, aucun chemin.
- Pas de journal ni de mise à jour datée : l'historique git porte le détail, le tableau d'historique ne garde que les rédactions et révisions de l'ADR.
- Un ADR ne référence que des ADR de numéro inférieur, jamais un ADR postérieur : il pose une situation à un instant donné.

## Branch Conventions

Prefix branches with: `feat/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/`
Branch names can be of any length: a preview's namespace (see `apps/cli/src/branchNamespace.ts`) is the first 7 characters of the branch slug followed by 6 letters derived from the whole branch name, 14 characters at most, the room left for the preview subdomain.

## Important Notes

- Merging to `main` triggers automatic production deployment
- Database connection string uses port 5433 locally (not 5432)
- Local sign-in goes through the ProConnect integration environment (`PROCONNECT_LOCAL_CLIENT_SECRET`); the email magic link only exists on previews
