import {
  deroulerLesRelances,
  EffacementRefuse,
  type RelancesDeroulees,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { RelancerLesInscritsInactifsPorts } from './ports'
import { relanceDuNouvelInscrit } from './relance-du-nouvel-inscrit'

export const relancerLesInscritsInactifs =
  ({
    lireLesComptesARelancer,
    envoyerBienDemarrer,
    envoyerLaRelanceDuCompte,
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
        relancer: (destinataire, palier) => {
          const relance = relanceDuNouvelInscrit(palier)
          return relance._tag === 'BienDemarrer'
            ? envoyerBienDemarrer(destinataire, relance)
            : envoyerLaRelanceDuCompte(destinataire, relance)
        },
        avertir: envoyerLAvertissement,
        effacer: async (destinataire) => {
          const suppression = await supprimerLeCompte({
            utilisateurId: destinataire.utilisateurId,
            maintenant,
          })
          if (!suppression.success)
            return failure(EffacementRefuse(suppression.error.motif))

          return envoyerLAvisDEffacement(destinataire)
        },
        noter: noterLaRelance,
      })({ comptes: await lireLesComptesARelancer(), maintenant }),
    )
