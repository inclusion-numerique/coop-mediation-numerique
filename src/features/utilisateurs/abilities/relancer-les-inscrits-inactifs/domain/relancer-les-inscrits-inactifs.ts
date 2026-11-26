import {
  deroulerLesRelances,
  EffacementRefuse,
  type RelancesDeroulees,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { RelancerLesInscritsInactifsPorts } from './ports'

export const relancerLesInscritsInactifs =
  ({
    lireLesComptesARelancer,
    envoyerLaRelance,
    envoyerLAvertissement,
    envoyerLAvisDEffacement,
    supprimerLeCompte,
    noterLaRelance,
  }: RelancerLesInscritsInactifsPorts) =>
  async ({
    maintenant,
  }: {
    readonly maintenant: Date
  }): Promise<Result<RelancesDeroulees, never>> =>
    success(
      await deroulerLesRelances({
        relancer: envoyerLaRelance,
        avertir: envoyerLAvertissement,
        effacer: async (destinataire) => {
          const suppression = await supprimerLeCompte({
            utilisateurId: destinataire.utilisateurId,
            maintenant,
          })
          if (!suppression.success)
            return failure(EffacementRefuse(suppression.error._tag))

          return envoyerLAvisDEffacement(destinataire)
        },
        noter: noterLaRelance,
      })({ comptes: await lireLesComptesARelancer(), maintenant }),
    )
