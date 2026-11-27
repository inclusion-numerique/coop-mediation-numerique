import {
  deroulerLesRelances,
  type RelancesDeroulees,
  retirerLeContactDesListes,
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
    retirerLeContactDeLaListe,
    lireLaPresenceDuContact,
    supprimerLeContact,
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

          const retrait = await retirerLeContactDesListes({
            retirerLeContactDeLaListe,
            lireLaPresenceDuContact,
            supprimerLeContact,
          })({ courriel: destinataire.courriel })
          if (!retrait.success) return retrait

          return envoyerLAvisDEffacement(destinataire)
        },
        noter: noterLaRelance,
      })({ comptes: await lireLesComptesARelancer(), maintenant }),
    )
