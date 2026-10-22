import {
  CoordinateurId,
  MediateurId,
  rattachements,
  UtilisateurIntrouvable,
} from '@app/web/features/utilisateurs/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import { createStopwatch } from '@app/web/utils/stopwatch'
import { type Activation, activationDe, type NonCoordinateur } from '../domain'
import {
  activer,
  compteQuiActive,
  inscrireLeMediateur,
} from '../implementation'

export const activerLaMediationNumerique = async (
  utilisateurId: string,
): Promise<Result<Activation, UtilisateurIntrouvable | NonCoordinateur>> => {
  const chrono = createStopwatch()

  const compte = await compteQuiActive(utilisateurId)
  if (compte === null) return failure(UtilisateurIntrouvable(utilisateurId))

  const activation = activationDe(
    rattachements(
      compte.mediateur === null ? null : MediateurId(compte.mediateur.id),
      compte.coordinateur === null
        ? null
        : CoordinateurId(compte.coordinateur.id),
    ),
  )
  if (!activation.success || activation.data === 'DejaActivee')
    return activation

  const mediateurId = await activer({
    utilisateurId: compte.id,
    coordinateurId: compte.coordinateur?.id ?? '',
    duree: () => chrono.stop().duration,
  })
  await inscrireLeMediateur(compte, mediateurId)

  return success(activation.data)
}
