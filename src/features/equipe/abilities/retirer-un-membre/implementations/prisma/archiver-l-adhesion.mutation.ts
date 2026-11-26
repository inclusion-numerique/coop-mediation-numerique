import { addMutationLog } from '@/configuration/prisma'
import { enregistrerLArchivage } from '../../../../implementations/prisma/adhesion.query'
import type { ArchiverLAdhesion } from '../../domain/retirer-un-membre'

export const archiverLAdhesion: ArchiverLAdhesion = async ({
  adhesion,
  auteurId,
}) => {
  await enregistrerLArchivage(adhesion)

  addMutationLog({
    userId: auteurId,
    nom: 'SupprimerMediateurCoordonne',
    data: {
      mediateurId: adhesion.mediateurId,
      coordinateurId: adhesion.coordinateurId,
    },
  })
}
