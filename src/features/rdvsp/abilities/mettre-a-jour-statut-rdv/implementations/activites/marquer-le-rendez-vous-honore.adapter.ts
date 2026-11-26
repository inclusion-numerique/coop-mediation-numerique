import { signaler } from '@/configuration/telemetry/serveur'
import { RdvId } from '../../../../domain/identifiants/rdv-id'
import type { UtilisateurCoopId } from '../../../../domain/identifiants/utilisateur-coop-id'
import { StatutPresenceModifiable } from '../../../../domain/rdv/statut-presence'
import type { mettreAJourStatutRdv } from '../../domain/mettre-a-jour-statut-rdv'

type MettreAJourStatutRdv = ReturnType<typeof mettreAJourStatutRdv>

const marquer = async (
  mettreAJour: MettreAJourStatutRdv,
  utilisateurId: UtilisateurCoopId,
  rdvId: number,
): Promise<unknown> => {
  const resultat = await mettreAJour({
    utilisateurId,
    rdvId: RdvId(rdvId),
    statut: StatutPresenceModifiable('seen'),
  })

  return resultat.success
    ? null
    : new Error(
        `Statut du rendez-vous ${rdvId} non mis à jour (${resultat.error._tag})`,
      )
}

export const marquerLeRendezVousHonore =
  (mettreAJour: MettreAJourStatutRdv) =>
  (utilisateurId: UtilisateurCoopId) =>
  async (rdvId: number): Promise<void> => {
    const echec = await marquer(mettreAJour, utilisateurId, rdvId).catch(
      (erreur: unknown) => erreur,
    )

    if (echec !== null) signaler(echec)
  }
