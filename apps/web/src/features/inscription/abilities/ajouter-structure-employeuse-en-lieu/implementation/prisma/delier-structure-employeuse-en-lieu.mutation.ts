import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import type { DelierStructureEmployeuseEnLieu } from '../../domain/ports'
import { lieuDepuisEmployeuse } from './lieu-depuis-employeuse'

/**
 * Détache l'employeuse comme lieu d'activité : clôt le `mediateurEnActivite`
 * actif de cet utilisateur sur le lieu corrélé à l'employeuse.
 * `suppressionParId` est l'utilisateur lui-même (il agit sur sa propre
 * inscription).
 *
 * Le lieu n'est pas supprimé. Il peut être partagé avec d'autres médiateurs, et
 * porter des activités déjà enregistrées : le détruire ferait disparaître leur
 * rattachement. Un lieu créé par erreur reste donc orphelin — c'est assumé.
 */
export const delierStructureEmployeuseEnLieu: DelierStructureEmployeuseEnLieu =
  async ({ userId, structureEmployeuseId }) => {
    const { lieuCorrele } = await lieuDepuisEmployeuse(structureEmployeuseId)

    addMutationLog({
      userId,
      nom: 'SupprimerMediateurEnActivite',
      duration: 0,
      data: { userId, structureId: structureEmployeuseId },
    })

    const now = new Date()

    await prismaClient.mediateurEnActivite.updateMany({
      where: {
        mediateur: { userId },
        lieuInclusion: lieuCorrele,
        suppression: null,
        fin: null,
      },
      data: { fin: now, suppression: now, suppressionParId: userId },
    })
  }
