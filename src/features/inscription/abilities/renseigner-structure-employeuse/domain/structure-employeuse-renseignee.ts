import type { InscriptionEnCours } from '@/features/inscription/domain'

export type StructureEmployeuseRenseignee<Employeuse, Rattachement> = {
  readonly employeuse: Employeuse
  readonly rattachement: Rattachement
  readonly etatFranchi: InscriptionEnCours
}
