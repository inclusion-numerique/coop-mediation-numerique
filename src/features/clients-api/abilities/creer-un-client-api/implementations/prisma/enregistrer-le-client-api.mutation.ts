import { prismaClient } from '@/configuration/prisma'
import {
  clientApiSelect,
  depuisDefinition,
  versClientApi,
} from '@/features/clients-api/implementations/prisma/client-api.transfer'
import type { EnregistrerLeClientApi } from '../../domain/ports'

export const enregistrerLeClientApi: EnregistrerLeClientApi = async ({
  definition,
  secretHash,
}) =>
  versClientApi(
    await prismaClient.apiClient.create({
      data: { ...depuisDefinition(definition), secretHash },
      select: clientApiSelect,
    }),
  )
