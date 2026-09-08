import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import type { MediateurId } from '../../../../domain/mediateur-id'
import {
  ordonnancement,
  type TriDesLieux,
} from '../../../../domain/tri-des-lieux'
import { projectionDuLieuEnListe } from '../../../../implementation/prisma/lieu-en-liste'
import { avecIdentifiantCarto } from '../../../../implementation/prisma/registre'

/**
 * Les lieux où le médiateur exerce aujourd'hui.
 *
 * La projection est celle des listes de lieux : « mes lieux » et « l'annuaire du
 * département » montrent le même objet, vu depuis deux entrées.
 */
export const listerMesLieuxActivite = async ({
  mediateurId,
  tri,
}: {
  mediateurId: MediateurId
  tri: TriDesLieux
}) => {
  const { champ, sens } = ordonnancement(tri)
  const orderBy: Prisma.MediateurEnActiviteOrderByWithRelationInput = {
    lieuInclusion: { [champ]: sens },
  }

  const rattachements = await prismaClient.mediateurEnActivite.findMany({
    where: { mediateurId, suppression: null, fin: null },
    select: {
      id: true,
      debut: true,
      lieuInclusion: { select: projectionDuLieuEnListe },
    },
    orderBy,
  })

  // L'aplatissement porte sur le lieu, pas sur le rattachement qui le porte :
  // c'est le lieu qui a une identité cartographique.
  return rattachements.map((rattachement) => ({
    ...rattachement,
    lieuInclusion: avecIdentifiantCarto(rattachement.lieuInclusion),
  }))
}

export type MonLieuActivite = Awaited<
  ReturnType<typeof listerMesLieuxActivite>
>[number]
