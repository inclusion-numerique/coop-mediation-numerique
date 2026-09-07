import { LieuId } from '@app/web/features/lieux-activite/domain/lieu-id'
import { prismaClient } from '@app/web/prismaClient'
import type { LireLesLieuxASiret } from '../../domain'

/**
 * Les lieux vivants dont la colonne `siret` porte quelque chose.
 *
 * Prisma ne sait pas exprimer « la colonne est non nulle » dans le type de
 * retour ; plutôt que d'affirmer par un cast ce que le `where` garantit, on
 * laisse tomber la ligne qui contredirait le filtre. Elle ne peut pas exister,
 * et si elle existait, la vérifier n'aurait aucun sens.
 */
export const lireLesLieuxASiret: LireLesLieuxASiret = async () => {
  const lieux = await prismaClient.lieuInclusion.findMany({
    where: { suppression: null, siret: { not: null }, NOT: { siret: '' } },
    select: {
      id: true,
      siret: true,
      nom: true,
      adresse: true,
      synchronisationSiret: true,
    },
    orderBy: { siret: 'asc' },
  })

  return lieux.flatMap(({ id, siret, nom, adresse, synchronisationSiret }) =>
    siret == null
      ? []
      : [
          {
            id: LieuId(id),
            siret,
            nom,
            adresse,
            synchronisation: synchronisationSiret,
          },
        ],
  )
}
