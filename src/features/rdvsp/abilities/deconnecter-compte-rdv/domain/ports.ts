import type {
  CompteRdv,
  CompteRdvDeconnecte,
} from '../../../domain/compte/compte-rdv'
import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'

export type CompteRdvDeLUtilisateur = (
  utilisateurId: UtilisateurCoopId,
) => Promise<CompteRdv | null>

export type EnregistrerLeCompteDeconnecte = (
  compte: CompteRdvDeconnecte,
) => Promise<void>

export type DeconnecterCompteRdvPorts = {
  readonly compteDeLUtilisateur: CompteRdvDeLUtilisateur
  readonly enregistrer: EnregistrerLeCompteDeconnecte
}
