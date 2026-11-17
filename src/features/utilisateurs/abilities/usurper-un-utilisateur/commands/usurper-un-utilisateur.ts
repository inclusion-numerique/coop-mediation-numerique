import { UtilisateurIntrouvable } from '@app/web/features/utilisateurs/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import { createStopwatch } from '@app/web/utils/stopwatch'
import {
  autoriserUsurpation,
  type CibleUsurpation,
  type PorteeUsurpation,
  type UsurpationHorsFixtures,
} from '../domain'
import { cibleUsurpation, ouvrirLUsurpation } from '../implementation'

export const usurperUnUtilisateur = async ({
  utilisateurId,
  usurpateurId,
  jetonDeSession,
  portee,
}: {
  readonly utilisateurId: string
  readonly usurpateurId: string
  readonly jetonDeSession: string
  readonly portee: PorteeUsurpation
}): Promise<
  Result<CibleUsurpation, UtilisateurIntrouvable | UsurpationHorsFixtures>
> => {
  const chrono = createStopwatch()

  const cible = await cibleUsurpation(utilisateurId)
  if (cible === null) return failure(UtilisateurIntrouvable(utilisateurId))

  const autorisation = autoriserUsurpation(cible, portee)
  if (!autorisation.success) return autorisation

  await ouvrirLUsurpation({
    jetonDeSession,
    cibleId: cible.id,
    usurpateurId,
    duree: () => chrono.stop().duration,
  })

  return success(cible)
}
