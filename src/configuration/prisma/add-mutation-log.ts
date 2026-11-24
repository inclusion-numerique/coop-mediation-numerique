/**
 * Create a mutation for the audit log, without blocking the main thread
 */

import { prismaClient } from '@/configuration/prisma/prisma-client'
import { errorReporter } from '@/configuration/telemetry/error-reporter/server'
import type { Prisma } from '@/generated/prisma/client'

const addMutationLogAsync = (data: Prisma.MutationUncheckedCreateInput) =>
  prismaClient.mutation.create({
    data: {
      ...data,
    },
  })

export const addMutationLog = (data: Prisma.MutationUncheckedCreateInput) => {
  addMutationLogAsync(data).catch((error) =>
    errorReporter.captureException({
      error: error instanceof Error ? error : new Error(String(error)),
      attributes: { addMutationData: JSON.stringify(data) },
    }),
  )
}
