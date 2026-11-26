import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { Nom } from '@/features/beneficiaire/domain/nom'
import type { Prenom } from '@/features/beneficiaire/domain/prenom'

export type BeneficiaireTrouve = {
  readonly id: BeneficiaireId
  readonly prenom: Prenom
  readonly nom: Nom
  readonly communeResidence: CommuneResidence | null
}

export type BeneficiairesRecherches = {
  readonly beneficiaires: readonly BeneficiaireTrouve[]
  readonly totalCount: number
}

export type RechercherBeneficiaires = (input: {
  mediateurId: MediateurId
  query: string
  excludeIds?: readonly BeneficiaireId[]
}) => Promise<BeneficiairesRecherches>

export type ProposerDesBeneficiaires = (input: {
  mediateurId: MediateurId
  includeBeneficiaireIds?: readonly BeneficiaireId[]
}) => Promise<BeneficiairesRecherches>
