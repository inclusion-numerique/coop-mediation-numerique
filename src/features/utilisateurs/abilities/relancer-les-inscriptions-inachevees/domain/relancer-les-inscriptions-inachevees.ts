import {
  deroulerLesRelances,
  type RelancesDeroulees,
} from '@/features/utilisateurs/domain'
import { type Result, success } from '@/libraries/result'
import type { RelancerLesInscriptionsInacheveesPorts } from './ports'

export const relancerLesInscriptionsInachevees =
  ({
    lireLesComptesARelancer,
    envoyerLaRelance,
    envoyerLAvertissement,
    envoyerLAvisDEffacement,
    effacerLInscription,
    retirerDesListes,
    noterLaRelance,
  }: RelancerLesInscriptionsInacheveesPorts) =>
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
          const effacement = await effacerLInscription(
            destinataire.utilisateurId,
          )
          if (!effacement.success) return effacement

          const retrait = await retirerDesListes(destinataire.courriel)
          if (!retrait.success) return retrait

          return envoyerLAvisDEffacement(destinataire)
        },
        noter: noterLaRelance,
      })({ comptes: await lireLesComptesARelancer(), maintenant }),
    )
