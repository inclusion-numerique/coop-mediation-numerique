import {
  type BeneficiaireIdentifie,
  toBeneficiaireIdentifie,
} from '@/features/beneficiaire/domain/beneficiaire'
import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { BeneficiaireNotFound } from '@/features/beneficiaire/domain/errors'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { failure, type Result, success } from '@/libraries/result'
import type { BeneficiaireAModifier } from './beneficiaire-a-modifier'

export type CreationDuBeneficiaire = (cible: {
  readonly id: BeneficiaireId
  readonly mediateurId: MediateurId
}) => Promise<Date | null>

export type EnregistrerLaModification = (
  beneficiaire: BeneficiaireIdentifie,
) => Promise<void>

export type ModifierBeneficiaire = (input: {
  readonly beneficiaire: BeneficiaireAModifier
  readonly mediateurId: MediateurId
  readonly maintenant: Date
}) => Promise<Result<BeneficiaireIdentifie, BeneficiaireNotFound>>

export const modifierBeneficiaire =
  ({
    creationDuBeneficiaire,
    enregistrerLaModification,
  }: {
    readonly creationDuBeneficiaire: CreationDuBeneficiaire
    readonly enregistrerLaModification: EnregistrerLaModification
  }): ModifierBeneficiaire =>
  async ({ beneficiaire, mediateurId, maintenant }) => {
    const creation = await creationDuBeneficiaire({
      id: beneficiaire.id,
      mediateurId,
    })

    if (creation === null) return failure(BeneficiaireNotFound(beneficiaire.id))

    const modifie = toBeneficiaireIdentifie(beneficiaire, {
      id: beneficiaire.id,
      mediateurId,
      creation,
      modification: maintenant,
    })

    await enregistrerLaModification(modifie)

    return success(modifie)
  }
