import type { Adresse, Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuId } from '../../../domain/lieu-id'
import type { NombreDActivites } from '../../../domain/nombres'

export type LieuActiviteTrouve = {
  readonly id: LieuId
  readonly nom: Nom
  readonly adresse: Adresse | null
  readonly activites: NombreDActivites
  readonly lePlusUtilise: boolean
}
