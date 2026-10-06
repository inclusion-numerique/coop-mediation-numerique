/**
 * Create a mutation for the audit log, without blocking the main thread
 */
import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import * as Sentry from '@sentry/nextjs'

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
    Sentry.captureException(error, {
      data: {
        addMutationData: data,
      },
    }),
  )
}
