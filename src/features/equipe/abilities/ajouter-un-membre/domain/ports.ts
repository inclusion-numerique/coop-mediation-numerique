import type {
  CoordinateurId,
  LireLesAdhesionsDeLaPaire,
  UtilisateurId,
} from '../../../domain'
import type { Ajout, UtilisateurAAjouter } from './ajout'

export type LireLUtilisateurAAjouter = (
  utilisateurId: UtilisateurId,
) => Promise<UtilisateurAAjouter | null>

export type CoordinateurExiste = (
  coordinateurId: CoordinateurId,
) => Promise<boolean>

export type EnregistrerLAdhesion = (ajout: Ajout) => Promise<void>

export type AjouterUnMembrePorts = {
  readonly lireLUtilisateurAAjouter: LireLUtilisateurAAjouter
  readonly coordinateurExiste: CoordinateurExiste
  readonly lireLesAdhesionsDeLaPaire: LireLesAdhesionsDeLaPaire
  readonly enregistrerLAdhesion: EnregistrerLAdhesion
}
