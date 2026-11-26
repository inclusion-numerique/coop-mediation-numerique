import type {
  CompteRdv,
  CompteRdvUtilisable,
} from '../../../domain/compte/compte-rdv'
import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import type { DonneesAccueilRdv } from './donnees-accueil-rdv'

export type CompteDuMediateur = (
  utilisateurId: UtilisateurCoopId,
) => Promise<CompteRdv | null>

export type LireDonneesAccueilRdv = (lecture: {
  readonly compte: CompteRdvUtilisable
  readonly maintenant: Date
}) => Promise<DonneesAccueilRdv>

export type ConsulterRdvsAccueilPorts = {
  readonly compteDuMediateur: CompteDuMediateur
  readonly lireDonnees: LireDonneesAccueilRdv
}
