import type { CoordinateurId } from '../identifiants/coordinateur-id'
import type { EmployeuseId } from '../identifiants/employeuse-id'
import type { MediateurId } from '../identifiants/mediateur-id'
import type { NomDeCommune } from '../nom-de-commune'
import type { NomDeStructure } from '../nom-de-structure'

export type EmployeuseDesActivites = {
  readonly id: EmployeuseId
  readonly nom: NomDeStructure | null
  readonly commune: NomDeCommune | null
}

export type PerimetreDesActivites = {
  readonly mediateurs: readonly MediateurId[]
  readonly coordinateurId: CoordinateurId | null
}
