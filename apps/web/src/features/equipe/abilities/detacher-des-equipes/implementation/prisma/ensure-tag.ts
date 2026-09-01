import type { Prisma } from '@prisma/client'
import { tagsDetenusToDomain } from '../../../../db/tag.transfer'
import {
  type MediateurId,
  NomTag,
  TagId,
  tagDAccueil,
} from '../../../../domain'

type Transaction = Prisma.TransactionClient

/** Ce qu'un tag emporte avec lui quand il essaime. */
export type TagTemplate = {
  readonly id: string
  readonly nom: string
  readonly description: string | null
  readonly departement: string | null
}

/**
 * Le tag chez le médiateur qui accueillera les comptes rendus repris, créé s'il
 * n'en détient pas encore d'équivalent.
 *
 * Le domaine dit LEQUEL réutiliser — c'est `tagDAccueil`, et c'est là que vit la
 * règle d'identité par le nom. Ici on lit ce qu'il détient et on écrit ce qui
 * manque, rien d'autre.
 */
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
