import type { Lieu } from '../../../domain/lieu'

export type HeritageDeLaFiche = {
  readonly nomReferent: string | null
  readonly courrielReferent: string | null
  readonly telephoneReferent: string | null
  readonly v1Imported: Date | null
  readonly v1StructureId: string | null
  readonly v1StructureIdPg: number | null
  readonly v1PermanenceId: string | null
}

export type FicheFusionnable = {
  readonly lieu: Lieu
  readonly heritage: HeritageDeLaFiche
}
