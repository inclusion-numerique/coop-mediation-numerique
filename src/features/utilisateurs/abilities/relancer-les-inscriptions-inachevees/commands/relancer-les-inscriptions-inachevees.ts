import {
  deroulerLesRelances,
  type RapportDeRelance,
} from '@/features/utilisateurs/domain'
import { noterLaRelance } from '@/features/utilisateurs/implementations/prisma/noter-la-relance.mutation'
import { success } from '@/libraries/result'
import type { RelancerLesInscriptionsInacheveesPorts } from '../domain'
import { inscriptionsInachevees } from '../implementations/prisma/inscriptions-inachevees.query'

export const relancerLesInscriptionsInachevees = async ({
  maintenant,
  ports,
}: {
  readonly maintenant: Date
  readonly ports: RelancerLesInscriptionsInacheveesPorts
}): Promise<readonly RapportDeRelance[]> =>
  deroulerLesRelances(
    await inscriptionsInachevees(),
    {
      relancer: ports.envoyerLaRelance,
      avertir: ports.envoyerLAvertissement,
      effacer: async (destinataire) => {
        await ports.effacerLInscription(destinataire.utilisateurId)
        await ports.retirerDesListes(destinataire.courriel)
        await ports.envoyerLAvisDEffacement(destinataire)
        return success(undefined)
      },
      noter: noterLaRelance('Inscription'),
    },
    maintenant,
  )
