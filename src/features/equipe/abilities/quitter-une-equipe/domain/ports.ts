import type { LireLesAdhesionsDeLaPaire } from '../../../domain'
import type { Depart } from './depart'

export type EnregistrerLeDepart = (depart: Depart) => Promise<void>

export type QuitterUneEquipePorts = {
  readonly lireLesAdhesionsDeLaPaire: LireLesAdhesionsDeLaPaire
  readonly enregistrerLeDepart: EnregistrerLeDepart
}
