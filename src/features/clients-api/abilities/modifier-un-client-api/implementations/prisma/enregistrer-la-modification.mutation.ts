import { prismaClient } from '@/configuration/prisma'
import {
  clientApiSelect,
  depuisDefinition,
  versClientApi,
} from '@/features/clients-api/implementations/prisma/client-api.transfer'
import type { EnregistrerLaModification } from '../../domain/ports'

export const enregistrerLaModification: EnregistrerLaModification = async ({
  id,
  definition,
}) =>
  versClientApi(
    await prismaClient.apiClient.update({
      where: { id },
      data: { ...depuisDefinition(definition), updated: new Date() },
      select: clientApiSelect,
    }),
  )
