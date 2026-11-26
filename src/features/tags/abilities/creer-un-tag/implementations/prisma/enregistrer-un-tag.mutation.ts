import { prismaClient } from '@/configuration/prisma'
import { TagId } from '../../../../domain'
import { porteeFromDomain } from '../../../../implementations/prisma/tag.transfer'
import type { EnregistrerUnTag } from '../../domain/ports'

export const enregistrerUnTag: EnregistrerUnTag = async ({
  nom,
  description,
  portee,
}) => {
  const { id } = await prismaClient.tag.create({
    data: { nom, description, ...porteeFromDomain(portee) },
    select: { id: true },
  })

  return TagId(id)
}
