import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type {
  BeneficiairesRecherches,
  ProposerDesBeneficiaires,
} from './rechercher-beneficiaires'

const AUCUN: BeneficiairesRecherches = { beneficiaires: [], totalCount: 0 }

export const beneficiairesInitiaux =
  (proposer: ProposerDesBeneficiaires) =>
  async ({
    mediateurId,
    includeBeneficiaireIds,
  }: {
    readonly mediateurId: MediateurId | null
    readonly includeBeneficiaireIds: readonly BeneficiaireId[]
  }): Promise<BeneficiairesRecherches> =>
    mediateurId === null
      ? AUCUN
      : proposer({ mediateurId, includeBeneficiaireIds })
