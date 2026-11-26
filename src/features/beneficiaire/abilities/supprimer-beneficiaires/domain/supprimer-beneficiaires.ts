import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { failure, type Result, success } from '@/libraries/result'
import { AucunBeneficiaireValide } from './errors'

export type BeneficiairesExistants = (input: {
  readonly ids: readonly BeneficiaireId[]
  readonly mediateurId: MediateurId
}) => Promise<readonly BeneficiaireId[]>

export type AnonymiserLesBeneficiaires = (input: {
  readonly ids: readonly BeneficiaireId[]
  readonly maintenant: Date
}) => Promise<void>

export type SupprimerBeneficiaires = (input: {
  readonly ids: readonly BeneficiaireId[]
  readonly mediateurId: MediateurId
  readonly maintenant: Date
}) => Promise<Result<{ deleted: number }, AucunBeneficiaireValide>>

export const supprimerBeneficiaires =
  ({
    beneficiairesExistants,
    anonymiserLesBeneficiaires,
  }: {
    readonly beneficiairesExistants: BeneficiairesExistants
    readonly anonymiserLesBeneficiaires: AnonymiserLesBeneficiaires
  }): SupprimerBeneficiaires =>
  async ({ ids, mediateurId, maintenant }) => {
    const existants = await beneficiairesExistants({ ids, mediateurId })

    if (existants.length === 0) return failure(AucunBeneficiaireValide)

    await anonymiserLesBeneficiaires({ ids: existants, maintenant })

    return success({ deleted: existants.length })
  }
