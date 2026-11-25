<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Project Overview

La Coop de la médiation numérique is a digital mediation platform for professionals, built for ANCT (Agence Nationale de la Cohésion des Territoires). It uses the French government's design system (DSFR) and is a single pnpm package: a Next.js application at the root of the repository.

## Common Commands

### Development

```bash
pnpm docker:start          # Start PostgreSQL and MailDev containers
pnpm db:init                # Generate Prisma client and run migrations
pnpm dev                    # Start web app at http://localhost:3000
pnpm storybook              # Start Storybook at http://localhost:6006
pnpm fixtures:load          # Load test data
```

### Linting & Type Checking

```bash
pnpm lint:fix && pnpm tsc   # Lint fix + type check (preferred)
pnpm lint                   # Check formatting and linting, then the OpenAPI spec, the structure and the imports
pnpm lint:structure         # Structure of src and e2e (folders, file names, categories), checked by alint against .alint.yml
pnpm lint:imports           # What each zone may import (cycles, app, features, libraries…), checked by dependency-cruiser against .dependency-cruiser.cjs (rules) and .dependency-cruiser/*.json (admitted imports, by target)
pnpm lint:imports:tables    # Rebuild .dependency-cruiser/*.json from the imports still refused, dropping stale lines; fails on any refusal no table covers
pnpm tsc                    # TypeScript check only (src, e2e, Storybook)
```

### Testing

```bash
pnpm test                                        # Unit tests
pnpm test path/to/file.spec.ts                   # Single unit test file (no `--`: Vitest ignores what follows it)
pnpm test:integration                            # Integration tests: hit DATABASE_URL, run them on a throwaway database
pnpm test:integration path/to/file.integration.ts  # Single integration test
pnpm test:cucumber                               # BDD scenarios: same database caveat as integration tests
pnpm test:e2e                                    # E2E tests with Cypress, interactive
pnpm cy run                                      # E2E tests with Cypress, headless
```

E2E tests need the web server running with `IS_E2E=true` (`IS_E2E=true pnpm dev`): it switches the Dataspace API to a mock. Without it, the conseiller numérique journeys fail, because the real API does not know the fixture users and sign-up treats them as ordinary médiateurs. The sign-in test also needs the simulated ProConnect server (`e2e/proconnect-simule/serveur.ts`) and the matching `NEXT_PUBLIC_PROCONNECT_*` variables; `.github/workflows/ci.yml` shows the full setup.

### Documentation

```bash
pnpm docs:build             # Collect ADRs, executable specs, import graphs and tables, reports, then build the Starlight site in docs/site/dist
pnpm docs:dev               # Same collection, then the Starlight dev server
pnpm docs:collect           # Only regenerate the site content (git-ignored) from the repository
```

The site is published on GitHub Pages by the release workflow on every push to `main`; import graphs need Graphviz (`dot`).

### Database

```bash
pnpm prisma:generate-migration migration_name   # Create new migration
pnpm docker:reset                               # Reset database and reinitialize
```

### Jobs

```bash
pnpm jobs:run <job-name> '<payload>'  # Execute a background job, through the same entry point as production
```

## Architecture

Architecture decisions and their rationale are recorded in `docs/decisions/`; the normative rules, with stable IDs, are in `.claude/conventions/feature-architecture.md`.

### Repository Structure

- **src**: the Next.js full-stack application (App Router, React Server Components), imported through the `@/` alias
- **prisma**: Prisma schemas and migrations
- **e2e**: Cypress tooling (support files, tasks, fixtures, simulated ProConnect, timings); `cypress.config.ts` sits at the root. Journeys across several pages live in `e2e/*.e2e.ts`, tests of a single page or route next to it in `src/app` as `page.test.ts` or `route.test.ts`, component tests next to their component as `*.cy.tsx`
- **.storybook**: Storybook configuration; stories live next to their components in `src`
- **infrastructure**: Infrastructure as code (HCL / OpenTofu for Scaleway)
- **docker**: images of the application and of PostgreSQL
- **docs**: ADRs in `docs/decisions` and the Starlight configuration (`astro.config.mjs`, `content.config.mjs`, `documentation.css`); `docs/site` is entirely generated by `scripts/collecter-la-documentation.mjs` and git-ignored

### Application Structure (src)

- **app/**: Next.js entry points only (`page`, `layout`, `route`, `error`, `not-found`, metadata files). A route keeps what Next requires, authentication, data preparation through abilities, and composition: it renders one feature page or layout, with its injections (`ClientBinder`), children and slots coming from other abilities or features. No markup and no UI component in `app`, except `<html>` and `<body>` in the root layout and global error
  - `(public)/`: Unauthenticated pages
  - `coop/`: Main authenticated area
  - `administration/`: Admin pages
  - `api/`: API routes including REST API v1
  - `_actions/`: server actions, one file per ability, composing its ports
- **features/**: Feature modules (activites, authentification, navigation, vitrine, etc.); everything a feature needs (e-mail templates, components, fixtures) lives in it. Each feature and ability follows the structure of `.claude/conventions/feature-architecture.md` (§1, §4, ST, UI-7): kebab-case names, French for business concepts and English for technical ones, barrels only in `domain/index.ts` and `implementations/<technique>/index.ts`, one folder per technique in `implementations/` and nothing at its root, `ui/` organised by role (`pages`, `layouts`, `slots`, `components`, `forms`, `presenters`, `labels`, `hooks`). A feature never wires its abilities: entry points (actions, routes, pages, layouts, jobs, CLI commands, Cucumber steps, tests) wire implementations to ports themselves, whether they come from the same feature or from others, and accept the duplicated wiring
- **libraries/**: shared code without any business concept, one purpose per library (UI components, forms, data tables, JSON:API, dates, e-mail layout, paths…); a library is imported through its entries: its root `index.ts` (plain TypeScript, loadable anywhere) and the `index.ts` of each first-level subject (`@/libraries/<library>/<subject>`), never through an inner file
- **configuration/**: project configuration, Prisma clients, clients of external services, secrets and telemetry; `configuration/environnement` validates the environment with zod (`client`, `serveur`, `outillage`), and Biome forbids reading `process.env` outside it, tool configuration files and a few CLI bridges listed in `biome.json`
- **cli/**: CLI entry point; commands stay thin; `cli/fixtures` assembles the test data set loaded by `pnpm fixtures:load`, wiring the references each feature's fixtures cite
- **jobs/**: Serverless Jobs entry point and thin executors
- **styles/**: global DSFR stylesheet
- `proxy.ts`, `instrumentation.ts`, `instrumentation-client.ts`: Next.js conventions, next to `app/`

### Key Technologies

- **Backend**: Next.js server actions, Prisma ORM, PostgreSQL
- **Frontend**: React 19, Next.js 16 (App Router), DSFR (French gov design system) through react-dsfr
- **Forms**: TanStack Form through `useAppForm` (`src/libraries/formulaire`), validated with Zod; react-hook-form only survives in legacy forms
- **Testing**: Vitest everywhere (unit and integration, no isolation, no mocks), Cucumber (BDD), Cypress (E2E)
- **Linting**: Biome (not ESLint for formatting/linting)

### Server Actions

Each ability exposes its contract in `features/<feature>/abilities/<ability>/action/` (`.validation.ts`, `.errors.ts`, `.key.ts`). An injection key only carries a server action and only lives in `action/`: the providing ability's, or the consumer's when it needs the action outside that ability (the feature root or another feature), declared with a structural input type that does not import the ability. The server action lives in `src/app/_actions/<feature>/<ability>.action.ts` and is built with `actionBuilder()` from `@/configuration/nextjs`, already wired to the error reporter (`withInput` and `fromResult` come from `@/libraries/nextjs`, `withAuth` from `@/features/authentification/middlewares/with-auth`, `withMaintenance` from `@/features/maintenance-mode/middlewares/with-maintenance`). Client components call it through `inject(KEY)`; the route binds it with `<ClientBinder bind={KEY} to={action}>`.

### Telemetry

- Only `src/configuration/telemetry` imports `@sentry/nextjs`. Modules with environment-specific implementations (`error-reporter/client`, `error-reporter/server`) have `index.prod.ts`, `index.dev.ts` and `index.ephemeral.ts`; `pnpm generate:implementations` copies the one named by `ENV` (default `dev`) to the git-ignored `index.ts`. Postinstall generates `dev`, CI sets `ENV=ephemeral`, the build regenerates `prod`.
- Composition roots (`app/`, jobs, `auth`) and `implementations/` modules take `errorReporter` or `signaler` from the configuration; domain, commands, UI logic and libraries receive what they need by injection. External calls are wrapped with `instrument` in `configuration/<service>` (e.g. `configuration/ban`).
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

### Transfer Layer (`implementations/prisma/`)

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

- Located at `prisma/schema.prisma`
- Use `@@map("snake_case")` for table names
- Use `@map("snake_case")` for foreign keys

### CSS Classes

Use DSFR utility classes: `fr-container`, `fr-grid-row`, `fr-col-12`, `fr-mt-8v`, etc.

## ADR

ADRs in `docs/decisions/` are written in French, in the [MADR](https://adr.github.io/madr/) format of the template [`docs/decisions/adr-template.md`](docs/decisions/adr-template.md); every writing rule is in [`docs/decisions/README.md`](docs/decisions/README.md). The first three:

- An ADR states decisions and their reasons, generically, and points to the `*.ability.md` files (executable specs, the source of truth) for details: no function, file or line names, no paths.
- No log and no dated updates: git history holds the details; the history list only lists the drafts and revisions of the ADR.
- An ADR only references ADRs with a lower number, never a later one: it describes the situation at a given time.

## Branch Conventions

Prefix branches with: `build/`, `chore/`, `ci/`, `docs/`, `feat/`, `fix/`, `perf/`, `refactor/`, `revert/`, `style/` or `test/`; only these branches trigger the CI.
Branch names can be of any length: a preview's namespace (see `src/cli/branch-namespace.ts`) is the first 7 characters of the branch slug followed by 6 letters derived from the whole branch name, 14 characters at most, the room left for the preview subdomain.

## Important Notes

- Merging to `main` triggers the release: it deploys `dev`, then production once `dev` succeeded; a change to `infrastructure/` waits for a manual approval of its plan
- Database connection string uses port 5433 locally (not 5432)
- Local sign-in goes through the ProConnect integration environment (`PROCONNECT_LOCAL_CLIENT_SECRET`); the email magic link only exists on previews
