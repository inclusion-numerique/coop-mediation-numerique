import { addMutationLog } from '@/configuration/prisma/add-mutation-log'
import type { UtilisateurId } from '@/features/inscription/domain'
import { createStopwatch } from '@/libraries/chronometre/stopwatch'
import type {
  EffetsApresValidation,
  InscrireALaListeDeDiffusion,
} from '../domain/ports'
import { valider } from '../domain/valider'
import { enregistrerValidation } from './prisma/enregistrer-validation.mutation'
import { lireFaitsInscription } from './prisma/lire-faits-inscription.query'

export const validerAvec =
  (
    inscrireALaListeDeDiffusion: InscrireALaListeDeDiffusion,
    effetsApresValidation: EffetsApresValidation,
  ) =>
  async (userId: UtilisateurId, maintenant: Date) => {
    const chronometre = createStopwatch()

    const resultat = await valider({
      lireFaitsInscription,
      enregistrerValidation,
      inscrireALaListeDeDiffusion,
      effetsApresValidation,
    })(userId, maintenant)

    if (resultat.success)
      addMutationLog({
        userId,
        nom: 'ValiderInscription',
        duration: chronometre.stop().duration,
        data: { id: userId },
      })

    return resultat
  }
