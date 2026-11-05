import type { AuteurId, MediateurId } from '@app/web/features/mediateurs/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { createStopwatch } from '@app/web/utils/stopwatch'
import {
  AucuneRuptureEnAttente,
  type ConfirmerLExerciceApresRuptureError,
  MediateurIntrouvable,
} from '../../domain/errors'
import {
  type ReponseApresRupture,
  visibiliteApres,
} from '../../domain/reponse-apres-rupture'
import { ruptureEnAttente } from '../../domain/rupture-en-attente'
import { lireMediateurEtContrats } from './mediateur-et-contrats'

export const confirmerLExerciceApresRupture = async ({
  mediateurId,
  reponse,
  auteurId,
  maintenant = new Date(),
}: {
  readonly mediateurId: MediateurId
  readonly reponse: ReponseApresRupture
  readonly auteurId: AuteurId
  readonly maintenant?: Date
}): Promise<Result<void, ConfirmerLExerciceApresRuptureError>> => {
  const stopwatch = createStopwatch()

  const mediateur = await lireMediateurEtContrats(mediateurId)

  if (mediateur == null) return failure(MediateurIntrouvable(mediateurId))

  const rupture = ruptureEnAttente({
    contrats: mediateur.contrats,
    visibiliteChoisieLe: mediateur.visibiliteChoisieLe,
    maintenant,
  })

  if (rupture == null) return failure(AucuneRuptureEnAttente(mediateurId))

  const visible = visibiliteApres(reponse, mediateur.isVisible)

  const { count } = await prismaClient.$transaction(async (transaction) => {
    const ecriture = await transaction.mediateur.updateMany({
      where: {
        id: mediateur.id,
        visibiliteChoisieLe: mediateur.visibiliteChoisieLe,
      },
      data: { isVisible: visible, visibiliteChoisieLe: maintenant },
    })

    if (ecriture.count > 0) {
      await transaction.user.updateMany({
        where: { mediateur: { id: mediateur.id } },
        data: { updated: maintenant },
      })
    }

    return ecriture
  })

  if (count === 0) return failure(AucuneRuptureEnAttente(mediateurId))

  addMutationLog({
    userId: auteurId,
    nom: 'SetMediateurVisibility',
    duration: stopwatch.stop().duration,
    data: {
      mediateurId,
      reponse,
      dateRupture: rupture.dateRupture.toISOString(),
      isVisible: visible,
    },
  })

  return success(undefined)
}
