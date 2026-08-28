import type { UserId } from '@app/web/features/inscription/domain'
import { type Result, success } from '@app/web/libraries/result'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { createStopwatch } from '@app/web/utils/stopwatch'
import {
  validerInscription as deciderValidation,
  type ValiderInscriptionError,
} from '../domain/valider-inscription'
import {
  effetsApresValidation,
  enregistrerValidation,
  lireFaitsInscription,
} from '../implementation'

/**
 * Cas d'usage « valider l'inscription » : lit les faits d'inscription bruts,
 * délègue la décision au domaine (pur), projette la validation en une écriture
 * (posant les CGU si le flow Dataspace ne les avait pas encore), puis joue les
 * effets consécutifs (Brevo, invitations d'équipe). Toute l'orchestration à
 * effets vit ici ; le domaine reste pur et testé par valeur, ce use case est
 * couvert en intégration (BDD) sur la vraie infra.
 */
export const validerInscription = async (
  userId: UserId,
  maintenant: Date,
): Promise<Result<void, ValiderInscriptionError>> => {
  const stopwatch = createStopwatch()

  const decision = deciderValidation(
    await lireFaitsInscription(userId),
    maintenant,
  )

  if (!decision.success) return decision

  await enregistrerValidation({
    userId,
    aEnregistrer: decision.data.aEnregistrer,
  })
  await effetsApresValidation(userId)

  addMutationLog({
    userId,
    nom: 'ValiderInscription',
    duration: stopwatch.stop().duration,
    data: { id: userId },
  })

  return success<void>(undefined)
}
