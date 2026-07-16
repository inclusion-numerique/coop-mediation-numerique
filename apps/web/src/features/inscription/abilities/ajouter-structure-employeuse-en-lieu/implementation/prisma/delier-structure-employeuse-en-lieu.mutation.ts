import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import type { DelierStructureEmployeuseEnLieu } from '../../domain/ports'

/**
 * Détache la structure employeuse comme lieu d'activité (parité legacy) : clôt
 * le `mediateurEnActivite` actif rattaché à cette structure. `suppressionParId`
 * est l'utilisateur courant lui-même (il agit sur sa propre inscription).
 */
export const delierStructureEmployeuseEnLieu: DelierStructureEmployeuseEnLieu =
  async ({ userId, structureEmployeuseId }) => {
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
        structureId: structureEmployeuseId,
        suppression: null,
        fin: null,
      },
      data: { fin: now, suppression: now, suppressionParId: userId },
    })
  }
