import { addMutationLog } from '@/configuration/prisma/addMutationLog'
import type { UserId } from '@/features/inscription/domain'
import { createStopwatch } from '@/libraries/chronometre/stopwatch'
import { type Result, success } from '@/libraries/result'
import type { InscrireALaListeDeDiffusion } from '../domain/ports'
import {
  validerInscription as deciderValidation,
  type ValiderInscriptionError,
} from '../domain/valider-inscription'
import { effetsApresValidation } from '../implementations/prisma/effets-apres-validation.mutation'
import { enregistrerValidation } from '../implementations/prisma/enregistrer-validation.mutation'
import { lireFaitsInscription } from '../implementations/prisma/lire-faits-inscription.query'

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
  inscrireALaListeDeDiffusion: InscrireALaListeDeDiffusion,
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
  await inscrireALaListeDeDiffusion(userId)
  await effetsApresValidation(userId)

  addMutationLog({
    userId,
    nom: 'ValiderInscription',
    duration: stopwatch.stop().duration,
    data: { id: userId },
  })

  return success<void>(undefined)
}
