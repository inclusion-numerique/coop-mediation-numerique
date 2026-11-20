import {
  CoordinateurId,
  MediateurId,
  rattachements,
  UtilisateurIntrouvable,
} from '@/features/utilisateurs/domain'
import { createStopwatch } from '@/libraries/chronometre/stopwatch'
import { failure, type Result, success } from '@/libraries/result'
import { type Activation, activationDe, type NonCoordinateur } from '../domain'
import {
  activer,
  compteQuiActive,
  inscrireALaListeDeDiffusion,
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

  await activer({
    utilisateurId: compte.id,
    coordinateurId: compte.coordinateur?.id ?? '',
    duree: () => chrono.stop().duration,
  })
  await inscrireALaListeDeDiffusion(compte.id)

  return success(activation.data)
}
