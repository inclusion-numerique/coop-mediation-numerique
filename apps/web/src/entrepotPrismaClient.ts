import { PrismaClient } from '@app/web/generated/entrepot'

// Second Prisma client pointing at the entrepôt (Dataspace) database. It is generated
// from its own schema (prisma/entrepot/schema.prisma) and exposes a READ-ONLY, typed
// view of the schemas hosted there (`main` for now: lieu_inclusion, adresse). It is
// never managed by `prisma migrate` — those tables belong to the Dataspace team.
// The coop schema keeps using `prismaClient`.
//
// Locally ENTREPOT_DATABASE_URL is left as a placeholder and falls back to DATABASE_URL
// — the dev container already hosts every schema, and the typed queries are schema
// qualified (main.*) so the coop search_path is irrelevant. Deployed environments inject
// the entrepôt connection string (ideally a Postgres role with GRANT SELECT only).
const configuredEntrepotUrl = process.env.ENTREPOT_DATABASE_URL
const entrepotDatabaseUrl = configuredEntrepotUrl?.startsWith('postgres')
  ? configuredEntrepotUrl
  : process.env.DATABASE_URL

const createEntrepotPrismaClient = () =>
  new PrismaClient({ datasourceUrl: entrepotDatabaseUrl })

const globalForEntrepot = global as unknown as {
  entrepotPrismaClient:
    | ReturnType<typeof createEntrepotPrismaClient>
    | undefined
}

export const entrepotPrismaClient =
  globalForEntrepot.entrepotPrismaClient ?? createEntrepotPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForEntrepot.entrepotPrismaClient = entrepotPrismaClient
}
