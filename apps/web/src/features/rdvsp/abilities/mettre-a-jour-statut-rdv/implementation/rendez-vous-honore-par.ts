import * as Sentry from '@sentry/nextjs'
import { RdvId } from '../../../domain/rdv-id'
import { StatutPresenceModifiable } from '../../../domain/statut-presence'
import { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import { mettreAJourStatutRdvBinding } from './mettre-a-jour-statut-rdv.binding'

export const rendezVousHonorePar =
  (utilisateurId: string) =>
  async (rdvId: number): Promise<void> => {
    const resultat = await mettreAJourStatutRdvBinding({
      utilisateurId: UtilisateurCoopId(utilisateurId),
      rdvId: RdvId(rdvId),
      statut: StatutPresenceModifiable('seen'),
    }).catch((erreur: unknown) => {
      Sentry.captureException?.(erreur)
      return null
    })
    if (resultat !== null && !resultat.success) {
      Sentry.captureException?.(
        new Error(
          `Statut du rendez-vous ${rdvId} non mis à jour (${resultat.error._tag})`,
        ),
      )
    }
  }
