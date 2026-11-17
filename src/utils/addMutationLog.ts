/**
 * Create a mutation for the audit log, without blocking the main thread
 */

import { errorReporter } from '@app/web/configuration/telemetry/error-reporter/server'
import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'

export const addMutationLogAsync = (
  data: Prisma.MutationUncheckedCreateInput,
) =>
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
