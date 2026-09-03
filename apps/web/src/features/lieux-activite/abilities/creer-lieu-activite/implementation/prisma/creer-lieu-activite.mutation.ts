import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { lieuFromDomain } from '../../../../db'
import type { Lieu } from '../../../../domain/lieu'
import type { LieuId } from '../../../../domain/lieu-id'
import type { MediateurId } from '../../../../domain/mediateur-id'
import { type EchecDeCreation, MediateurRequis } from '../../domain/errors'

/**
 * Créer un lieu, c'est aussi s'y rattacher : on ne crée pas une fiche pour
 * personne. Les deux écritures vont ensemble.
 *
 * La saisie est déjà devenue un lieu du domaine avant d'arriver ici : le type du
 * formulaire ne descend pas jusqu'à l'écriture.
 */
export const creerLieuActivite = async ({
  lieu,
  mediateurId,
}: {
  lieu: Lieu
  mediateurId: MediateurId | null
}): Promise<Result<{ readonly id: LieuId }, EchecDeCreation>> => {
  if (mediateurId == null) return failure(MediateurRequis)

  await prismaClient.lieuInclusion.create({
    data: {
      ...lieuFromDomain(lieu),
      mediateursEnActivite: {
        create: {
          id: v4(),
          mediateurId,
          // Le rattachement naît avec le lieu, de la main de la même personne.
          debut: lieu.tracabilite.creation.date,
          creationParId: lieu.tracabilite.creation.par,
        },
      },
    },
  })

  return success({ id: lieu.id })
}
