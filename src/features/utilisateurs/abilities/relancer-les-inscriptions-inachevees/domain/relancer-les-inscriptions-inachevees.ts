import {
  deroulerLesRelances,
  type RapportDeRelance,
} from '@/features/utilisateurs/domain'
import { success } from '@/libraries/result'
import type { RelancerLesInscriptionsInacheveesPorts } from './ports'

export const relancerLesInscriptionsInachevees = async ({
  maintenant,
  ports,
}: {
  readonly maintenant: Date
  readonly ports: RelancerLesInscriptionsInacheveesPorts
}): Promise<readonly RapportDeRelance[]> =>
  deroulerLesRelances(
    await ports.lireLesComptesARelancer(),
    {
      relancer: ports.envoyerLaRelance,
      avertir: ports.envoyerLAvertissement,
      effacer: async (destinataire) => {
        await ports.effacerLInscription(destinataire.utilisateurId)
        await ports.retirerDesListes(destinataire.courriel)
        await ports.envoyerLAvisDEffacement(destinataire)
        return success(undefined)
      },
      noter: ports.noterLaRelance,
    },
    maintenant,
  )
