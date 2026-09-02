import type { CreerLieuActiviteData } from '@app/web/features/structures/CreerLieuActiviteValidation'
import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { lieuFromDomain } from '../../../../db'
import type { LieuId } from '../../../../domain/lieu-id'
import type { MediateurId } from '../../../../domain/mediateur-id'
import type { UserId } from '../../../../domain/user-id'
import { nouveauLieu } from '../../action/depuis-la-saisie'
import { type EchecDeCreation, MediateurRequis } from '../../domain/errors'

/**
 * Créer un lieu, c'est aussi s'y rattacher : on ne crée pas une fiche pour
 * personne. Les deux écritures vont ensemble.
 */
export const creerLieuActivite = async ({
  saisie,
  mediateurId,
  par,
  maintenant = new Date(),
}: {
  saisie: CreerLieuActiviteData
  mediateurId: MediateurId | null
  par: UserId
  maintenant?: Date
}): Promise<Result<{ readonly id: LieuId }, EchecDeCreation>> => {
  if (mediateurId == null) return failure(MediateurRequis)

  const lieu = nouveauLieu(saisie, par, maintenant)

  await prismaClient.lieuInclusion.create({
    data: {
      ...lieuFromDomain(lieu),
      mediateursEnActivite: {
        create: {
          id: v4(),
          mediateurId,
          debut: maintenant,
          creationParId: par,
        },
      },
    },
  })

  return success({ id: lieu.id })
}
