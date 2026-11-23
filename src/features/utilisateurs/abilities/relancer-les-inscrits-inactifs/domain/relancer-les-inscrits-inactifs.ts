import {
  deroulerLesRelances,
  type RapportDeRelance,
} from '@/features/utilisateurs/domain'
import { success } from '@/libraries/result'
import type { RelancerLesInscritsInactifsPorts } from './ports'

export const relancerLesInscritsInactifs = async ({
  maintenant,
  ports,
}: {
  readonly maintenant: Date
  readonly ports: RelancerLesInscritsInactifsPorts
}): Promise<readonly RapportDeRelance[]> =>
  deroulerLesRelances(
    await ports.lireLesComptesARelancer(),
    {
      relancer: ports.envoyerLaRelance,
      avertir: ports.envoyerLAvertissement,
      effacer: async (destinataire) => {
        const suppression = await ports.supprimerLeCompte(
          destinataire.utilisateurId,
        )
        if (!suppression.success) return suppression
        await ports.envoyerLAvisDEffacement(destinataire)
        return success(undefined)
      },
      noter: ports.noterLaRelance,
    },
    maintenant,
  )
