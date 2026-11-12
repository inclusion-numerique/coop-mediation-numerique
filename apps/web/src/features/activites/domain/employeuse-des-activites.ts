import type { CoordinateurId } from './coordinateur-id'
import type { EmployeuseId } from './employeuse-id'
import type { MediateurId } from './mediateur-id'
import type { NomDeCommune } from './nom-de-commune'
import type { NomDeStructure } from './nom-de-structure'

export type EmployeuseDesActivites = {
  readonly id: EmployeuseId
  readonly nom: NomDeStructure | null
  readonly commune: NomDeCommune | null
}

export type PerimetreDesActivites = {
  readonly mediateurs: readonly MediateurId[]
  readonly coordinateurId: CoordinateurId | null
}
