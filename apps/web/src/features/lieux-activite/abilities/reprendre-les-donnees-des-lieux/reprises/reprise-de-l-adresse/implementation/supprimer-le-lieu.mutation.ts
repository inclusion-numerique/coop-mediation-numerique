import { prismaClient } from '@app/web/prismaClient'
import type { SupprimerLeLieu } from '../domain/reprise-de-l-adresse'

/**
 * Le lieu se retire des trois endroits où il vit.
 *
 * La coop le marque supprimé, l'inscription au registre porte sa propre date —
 * `deleted_at`, que la lecture du registre filtre déjà — et les rattachements
 * des médiateurs se closent comme le fait la réconciliation de l'inscription :
 * un médiateur rattaché à un lieu supprimé le verrait disparaître de ses écrans
 * sans que sa fiche le sache.
 *
 * `modification` est réécrite telle quelle : la suppression n'est pas une
 * modification de la fiche, et aucune date de la reprise ne bouge.
 */
export const supprimerLeLieu: SupprimerLeLieu = async (lieuId) => {
  const ligne = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    select: { modification: true },
  })

  if (ligne == null) return

  const maintenant = new Date()

  await prismaClient.$transaction(async (transaction) => {
    await transaction.mediateurEnActivite.updateMany({
      where: { structureId: lieuId, suppression: null },
      data: { fin: maintenant, suppression: maintenant },
    })

    await transaction.lieuInclusionRegistreMain.updateMany({
      where: { structureCoopId: lieuId, deletedAt: null },
      data: { deletedAt: maintenant, visiblePourCartographieNationale: false },
    })

    await transaction.lieuInclusion.update({
      where: { id: lieuId },
      data: {
        suppression: maintenant,
        visiblePourCartographieNationale: false,
        modification: ligne.modification,
      },
    })
  })
}
