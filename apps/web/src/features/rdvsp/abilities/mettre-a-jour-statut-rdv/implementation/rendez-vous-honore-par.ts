import { signaler } from '@app/web/configuration/telemetry/error-reporter/server/signaler'
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
      signaler(erreur)
      return null
    })
    if (resultat !== null && !resultat.success) {
      signaler(
        new Error(
          `Statut du rendez-vous ${rdvId} non mis à jour (${resultat.error._tag})`,
        ),
      )
    }
  }
