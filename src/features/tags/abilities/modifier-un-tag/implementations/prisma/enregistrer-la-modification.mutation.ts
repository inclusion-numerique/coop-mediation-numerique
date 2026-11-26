import { prismaClient } from '@/configuration/prisma'
import type { EnregistrerLaModification } from '../../domain/modifier-un-tag'

export const enregistrerLaModification: EnregistrerLaModification = async ({
  tagId,
  nom,
  description,
}) => {
  await prismaClient.tag.update({
    where: { id: tagId },
    data: { nom, description, modification: new Date() },
  })
}
