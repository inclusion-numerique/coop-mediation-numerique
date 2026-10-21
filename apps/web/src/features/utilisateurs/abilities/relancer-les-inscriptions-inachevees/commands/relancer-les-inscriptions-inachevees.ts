import { noterLaRelance } from '@app/web/features/utilisateurs/db/noter-la-relance.mutation'
import {
  deroulerLesRelances,
  type RapportDeRelance,
} from '@app/web/features/utilisateurs/domain'
import type { RelancerLesInscriptionsInacheveesPorts } from '../domain'
import { inscriptionsInachevees } from '../implementation'

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
      },
      noter: noterLaRelance('Inscription'),
    },
    maintenant,
  )
