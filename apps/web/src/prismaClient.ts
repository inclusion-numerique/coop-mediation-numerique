import { timestampExtension } from '@app/web/prisma/timestampExtension'
import { PrismaClient } from '@prisma/client'

const debugLog = process.env.PRISMA_ENABLE_LOGGING === '1'

const createPrismaClient = () =>
  new PrismaClient({
    log: debugLog
      ? [
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
        ]
      : undefined,
  }).$extends(timestampExtension)

// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
const globalForPrisma = global as unknown as {
  prismaClient: PrismaClient | undefined
}

// `timestampExtension` n'ajoute qu'un hook `query` (aucune méthode/type supplémentaire sur le
// client) : la surface de type reste identique à `PrismaClient`. On conserve donc ce type pour
// l'export afin de ne pas propager le type du client étendu à toutes les signatures
// consommatrices (`tx: Prisma.TransactionClient`, etc.) ; le hook s'exécute bien au runtime.
export const prismaClient =
  globalForPrisma.prismaClient ??
  (createPrismaClient() as unknown as PrismaClient)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaClient = prismaClient
}
