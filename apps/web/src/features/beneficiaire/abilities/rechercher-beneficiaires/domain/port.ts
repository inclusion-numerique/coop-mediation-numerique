import type { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import type { CommuneResidence } from '@app/web/features/beneficiaire/domain/commune-residence'
import type { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import type { Nom } from '@app/web/features/beneficiaire/domain/nom'
import type { Prenom } from '@app/web/features/beneficiaire/domain/prenom'

export type BeneficiaireSearchItem = {
  readonly id: BeneficiaireId
  readonly prenom: Prenom
  readonly nom: Nom
  readonly communeResidence: CommuneResidence | null
}

export type RechercherBeneficiaires = (input: {
  mediateurId: MediateurId
  query: string
  excludeIds?: readonly BeneficiaireId[]
}) => Promise<readonly BeneficiaireSearchItem[]>

export type GetInitialBeneficiairesOptions = (input: {
  mediateurId: MediateurId
  includeBeneficiaireIds?: readonly BeneficiaireId[]
}) => Promise<{
  options: readonly BeneficiaireSearchItem[]
  totalCount: number
}>
