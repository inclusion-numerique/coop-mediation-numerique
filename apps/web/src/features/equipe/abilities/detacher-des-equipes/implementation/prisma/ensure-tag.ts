import type { Prisma } from '@app/web/generated/prisma/client'
import { tagsDetenusToDomain } from '../../../../db/tag.transfer'
import {
  type MediateurId,
  NomTag,
  TagId,
  tagDAccueil,
} from '../../../../domain'

type Transaction = Prisma.TransactionClient

export type TagTemplate = {
  readonly id: string
  readonly nom: string
  readonly description: string | null
  readonly departement: string | null
}

export const ensureTag = async (
  transaction: Transaction,
  mediateurId: MediateurId,
  modele: TagTemplate,
): Promise<TagId> => {
  const detenus = await transaction.tag.findMany({
    where: { mediateurId, suppression: null },
    select: { id: true, nom: true },
  })

  const existant = tagDAccueil(tagsDetenusToDomain(detenus), NomTag(modele.nom))

  if (existant !== null) return existant

  const cree = await transaction.tag.create({
    data: {
      nom: modele.nom,
      description: modele.description,
      departement: modele.departement,
      mediateurId,
    },
    select: { id: true },
  })

  return TagId(cree.id)
}
