import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { MotifDEcart } from './errors'
import type {
  DonneesDeFusion,
  MergedBeneficiaire,
  NouveauBeneficiaire,
} from './usager-externe'

export type UsagerEcarte = {
  readonly rdvUserId: number
  readonly reason: MotifDEcart
}

export type EcritureDUnUsager =
  | {
      readonly _tag: 'MiseAJour'
      readonly id: BeneficiaireId
      readonly mediateurId: MediateurId
      readonly donnees: DonneesDeFusion
    }
  | { readonly _tag: 'Creation'; readonly beneficiaire: NouveauBeneficiaire }

export type FusionDesUsagers = {
  readonly merges: readonly MergedBeneficiaire[]
  readonly skipped: readonly UsagerEcarte[]
  readonly ecritures: readonly EcritureDUnUsager[]
}
