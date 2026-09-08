import { avecIdentifiantCarto } from '@app/web/features/lieux-activite'
import { prismaClient } from '@app/web/prismaClient'
import type { LireLieuxActiviteExistants } from '../../domain'

/**
 * Lit les activités en cours de l'utilisateur, réduites aux signaux d'identité.
 *
 * L'identité cartographique du lieu vient du registre de l'Entrepôt, par l'API
 * publique de `lieux-activite` : la coop en portait une copie qui avait dérivé,
 * et c'est sur cette identité que la réconciliation décide de clôturer une
 * activité ou d'en créer une.
 */
export const lireLieuxActiviteExistants: LireLieuxActiviteExistants = async (
  userId,
) => {
  const activites = await prismaClient.mediateurEnActivite.findMany({
    where: { mediateur: { userId }, suppression: null, fin: null },
    select: { id: true, lieuInclusion: { select: { id: true } } },
  })

  const lieux = await avecIdentifiantCarto(
    activites.map(({ lieuInclusion }) => lieuInclusion),
  )

  return activites.map(({ id, lieuInclusion }, rang) => ({
    id,
    lieuInclusion: lieux[rang] ?? {
      ...lieuInclusion,
      structureCartographieNationaleId: null,
    },
  }))
}
