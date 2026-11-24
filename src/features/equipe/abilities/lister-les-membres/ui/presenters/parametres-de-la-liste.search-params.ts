import type { Model } from '@/libraries/model'
import type { FiltreRole, FiltreStatut } from '../../../../domain/index'

export type RoleFiltre = Model.InputOf<typeof FiltreRole>

export type FilterParam = Model.InputOf<typeof FiltreStatut>

export type ParametresDeLaListe = {
  lignes?: string
  page?: string
  recherche?: string
  statut?: string
  role?: string
  tri?: string
  ordre?: string
}
