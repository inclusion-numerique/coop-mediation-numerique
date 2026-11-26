import type { LireLesAdhesionsDeLaPaire } from '../../../domain'
import type { SuppressionDesArchives } from './suppression-des-archives'

export type SupprimerLesAdhesionsArchivees = (
  suppression: SuppressionDesArchives,
) => Promise<void>

export type SupprimerUnAncienMembrePorts = {
  readonly lireLesAdhesionsDeLaPaire: LireLesAdhesionsDeLaPaire
  readonly supprimerLesAdhesionsArchivees: SupprimerLesAdhesionsArchivees
}
