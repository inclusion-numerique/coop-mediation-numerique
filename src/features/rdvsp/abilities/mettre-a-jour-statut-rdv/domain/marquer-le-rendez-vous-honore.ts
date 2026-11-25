import { RdvId } from '../../../domain/identifiants/rdv-id'
import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import { StatutPresenceModifiable } from '../../../domain/rdv/statut-presence'
import type { MettreAJourStatutRdv } from './mettre-a-jour-statut-rdv'

export const marquerLeRendezVousHonore =
  ({
    mettreAJour,
    signaler,
  }: {
    readonly mettreAJour: MettreAJourStatutRdv
    readonly signaler: (erreur: unknown) => void
  }) =>
  (utilisateurId: UtilisateurCoopId) =>
  async (rdvId: number): Promise<void> => {
    const echec = await mettreAJour({
      utilisateurId,
      rdvId: RdvId(rdvId),
      statut: StatutPresenceModifiable('seen'),
    }).then(
      (resultat) =>
        resultat.success
          ? null
          : new Error(
              `Statut du rendez-vous ${rdvId} non mis à jour (${resultat.error._tag})`,
            ),
      (erreur: unknown) => erreur,
    )

    if (echec !== null) signaler(echec)
  }
