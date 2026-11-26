import type { LireLesAdhesionsDeLaPaire } from '../../../domain'
import type { Retrait } from './retrait'

export type ArchiverLAdhesion = (retrait: Retrait) => Promise<void>

export type RetirerUnMembrePorts = {
  readonly lireLesAdhesionsDeLaPaire: LireLesAdhesionsDeLaPaire
  readonly archiverLAdhesion: ArchiverLAdhesion
}
