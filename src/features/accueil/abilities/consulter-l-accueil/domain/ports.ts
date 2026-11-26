import type { Visiteur } from './accueil'
import type { UtilisateurId } from './utilisateur-id'

export type LireLeVisiteur = (critere: {
  readonly utilisateurId: UtilisateurId
}) => Promise<Visiteur | null>

export type ConsulterLAccueilPorts = {
  readonly lireLeVisiteur: LireLeVisiteur
}
