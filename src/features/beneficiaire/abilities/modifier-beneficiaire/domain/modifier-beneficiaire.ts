import {
  type BeneficiaireIdentifie,
  toBeneficiaireIdentifie,
} from '@/features/beneficiaire/domain/beneficiaire'
import { BeneficiaireNotFound } from '@/features/beneficiaire/domain/errors'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { failure, type Result, success } from '@/libraries/result'
import type { BeneficiaireAModifier } from './beneficiaire-a-modifier'
import type { EchecDeModifierBeneficiaire } from './errors'
import type { ModifierBeneficiairePorts } from './ports'

export const modifierBeneficiaire =
  ({
    creationDuBeneficiaire,
    enregistrerLaModification,
  }: ModifierBeneficiairePorts) =>
  async ({
    beneficiaire,
    mediateurId,
    maintenant,
  }: {
    readonly beneficiaire: BeneficiaireAModifier
    readonly mediateurId: MediateurId
    readonly maintenant: Date
  }): Promise<Result<BeneficiaireIdentifie, EchecDeModifierBeneficiaire>> => {
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
