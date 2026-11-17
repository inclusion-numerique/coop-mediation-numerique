import { prismaClient } from '@app/web/prismaClient'
import type { LieuId } from '../../../../domain/lieu-id'
import type { MediateurDuLieu } from '../../domain'
import {
  mediateurDuLieuSelect,
  versMediateurDuLieu,
} from './mediateur-du-lieu.transfer'

export const listerLesMediateursDuLieu = async (
  lieuId: LieuId,
): Promise<readonly MediateurDuLieu[]> => {
  const rattachements = await prismaClient.mediateurEnActivite.findMany({
    where: {
      structureId: lieuId,
      suppression: null,
      fin: null,
      mediateur: {
        user: { deleted: null, inscriptionValidee: { not: null } },
      },
    },
    orderBy: [
      { mediateur: { user: { lastName: 'asc' } } },
      { mediateur: { user: { firstName: 'asc' } } },
    ],
    select: mediateurDuLieuSelect(lieuId),
  })

  return rattachements
    .map(versMediateurDuLieu)
    .filter((mediateur) => mediateur !== null)
}
