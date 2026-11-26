import { prismaClient } from '@/configuration/prisma'
import { depuisDefinition } from '@/features/clients-api/implementations/prisma/client-api.transfer'
import type { EnregistrerLaModification } from '../../domain/ports'

export const enregistrerLaModification: EnregistrerLaModification = async ({
  id,
  definition,
  maintenant,
}) => {
  await prismaClient.apiClient.update({
    where: { id },
    data: { ...depuisDefinition(definition), updated: maintenant },
  })
}
