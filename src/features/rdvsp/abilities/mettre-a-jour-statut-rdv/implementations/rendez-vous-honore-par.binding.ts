import { signaler } from '@/configuration/telemetry/error-reporter/server/signaler'
import { RdvId } from '../../../domain/identifiants/rdv-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import { StatutPresenceModifiable } from '../../../domain/rdv/statut-presence'
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
