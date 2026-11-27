import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'

export type CompteRdvExiste = (
  utilisateurId: UtilisateurCoopId,
) => Promise<boolean>

export type EnregistrerLAffichage = (affichage: {
  readonly utilisateurId: UtilisateurCoopId
  readonly afficher: boolean
}) => Promise<void>

export type AfficherRdvsDansActivitesPorts = {
  readonly compteRdvExiste: CompteRdvExiste
  readonly enregistrerLAffichage: EnregistrerLAffichage
}
