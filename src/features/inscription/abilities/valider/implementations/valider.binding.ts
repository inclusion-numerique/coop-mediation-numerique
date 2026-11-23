import { addMutationLog } from '@/configuration/prisma/addMutationLog'
import type { UserId } from '@/features/inscription/domain'
import { createStopwatch } from '@/libraries/chronometre/stopwatch'
import type { InscrireALaListeDeDiffusion } from '../domain/ports'
import { valider } from '../domain/valider'
import { effetsApresValidation } from './prisma/effets-apres-validation.mutation'
import { enregistrerValidation } from './prisma/enregistrer-validation.mutation'
import { lireFaitsInscription } from './prisma/lire-faits-inscription.query'

export const validerAvec =
  (inscrireALaListeDeDiffusion: InscrireALaListeDeDiffusion) =>
  async (userId: UserId, maintenant: Date) => {
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
