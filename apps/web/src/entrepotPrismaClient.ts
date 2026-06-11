import { PrismaClient } from '@prisma/client'

// Second Prisma client pointing at the entrepôt (Dataspace) database. Used for raw, read-only
// queries on the schemas hosted there (admin/main/reference/audit/…); the coop schema keeps
// using `prismaClient`. Locally ENTREPOT_DATABASE_URL is left as a placeholder and falls back to
// DATABASE_URL — the dev container already hosts every schema. Deployed environments inject the
// entrepôt prod connection string. Always schema-qualify tables in queries (e.g. `admin.commune`).
// Only a real postgres URL is honoured, so the `<secret>` placeholder from .env.dist falls back.
const configuredEntrepotUrl = process.env.ENTREPOT_DATABASE_URL
const entrepotDatabaseUrl = configuredEntrepotUrl?.startsWith('postgres')
  ? configuredEntrepotUrl
  : process.env.DATABASE_URL

const createEntrepotPrismaClient = () =>
  new PrismaClient({ datasourceUrl: entrepotDatabaseUrl })

const globalForEntrepot = global as unknown as {
  entrepotPrismaClient: PrismaClient | undefined
}

export const entrepotPrismaClient =
  globalForEntrepot.entrepotPrismaClient ?? createEntrepotPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForEntrepot.entrepotPrismaClient = entrepotPrismaClient
}
