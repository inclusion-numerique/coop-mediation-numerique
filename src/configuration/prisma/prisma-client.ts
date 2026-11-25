import { PrismaPg } from '@prisma/adapter-pg'
import { environnementServeur } from '@/configuration/environnement/serveur'
import { createEnumArrayTypeParser } from '@/configuration/prisma/enum-array-type-parser'
import { timestampExtension } from '@/configuration/prisma/timestamp-extension'
import { PrismaClient } from '@/generated/prisma/client'

const debugLog = environnementServeur().PRISMA_ENABLE_LOGGING

const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg(
      { connectionString: environnementServeur().DATABASE_URL },
      { userDefinedTypeParser: createEnumArrayTypeParser() },
    ),
    ...(debugLog
      ? {
          log: [
            {
              emit: 'stdout',
              level: 'query',
            },
            {
              emit: 'stdout',
              level: 'error',
            },
            {
              emit: 'stdout',
              level: 'info',
            },
            {
              emit: 'stdout',
              level: 'warn',
            },
          ],
        }
      : {}),
  }).$extends(timestampExtension)

// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
const globalForPrisma = global as unknown as {
  prismaClient: ReturnType<typeof createPrismaClient> | undefined
}

export const extendedPrismaClient =
  globalForPrisma.prismaClient ?? createPrismaClient()

// `timestampExtension` n'ajoute qu'un hook `query` (aucune méthode/type supplémentaire sur le
// client) : la surface de type reste identique à `PrismaClient`. On conserve donc ce type pour
// l'export afin de ne pas propager le type du client étendu à toutes les signatures
// consommatrices (`tx: Prisma.TransactionClient`, etc.) ; le hook s'exécute bien au runtime.
export const prismaClient = extendedPrismaClient as unknown as PrismaClient

if (environnementServeur().NODE_ENV !== 'production') {
  globalForPrisma.prismaClient = extendedPrismaClient
}
