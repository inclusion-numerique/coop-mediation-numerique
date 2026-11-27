import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { failure, type Result, success } from '@/libraries/result'
import type { BeneficiairesAnonymises } from './beneficiaires-anonymises'
import {
  AucunBeneficiaireValide,
  type EchecDeSupprimerBeneficiaires,
} from './errors'
import type { SupprimerBeneficiairesPorts } from './ports'

export const supprimerBeneficiaires =
  ({
    beneficiairesExistants,
    anonymiserLesBeneficiaires,
  }: SupprimerBeneficiairesPorts) =>
  async ({
    ids,
    mediateurId,
    maintenant,
  }: {
    readonly ids: readonly BeneficiaireId[]
    readonly mediateurId: MediateurId
    readonly maintenant: Date
  }): Promise<
    Result<BeneficiairesAnonymises, EchecDeSupprimerBeneficiaires>
  > => {
    const existants = await beneficiairesExistants({ ids, mediateurId })

    if (existants.length === 0) return failure(AucunBeneficiaireValide())

    const anonymises = { ids: existants, mediateurId, maintenant }

    await anonymiserLesBeneficiaires(anonymises)

    return success(anonymises)
  }
