import type { InscriptionEnCours } from '@/features/inscription/domain'
import type { SaisieEmployeuse } from './saisie-employeuse'

export type StructureEmployeuseRenseignee = {
  readonly saisie: SaisieEmployeuse
  readonly etatFranchi: InscriptionEnCours
}
