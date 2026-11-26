import {
  type BeneficiaireIdentifie,
  toBeneficiaireIdentifie,
} from '@/features/beneficiaire/domain/beneficiaire'
import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { type Result, success } from '@/libraries/result'
import type { BeneficiaireACreer } from './beneficiaire-a-creer'
import type { EchecDeCreerBeneficiaire } from './errors'
import type { CreerBeneficiairePorts } from './ports'

export const creerBeneficiaire =
  ({ enregistrerLeBeneficiaire }: CreerBeneficiairePorts) =>
  async ({
    beneficiaire,
    beneficiaireId,
    mediateurId,
    maintenant,
  }: {
    readonly beneficiaire: BeneficiaireACreer
    readonly beneficiaireId: BeneficiaireId
    readonly mediateurId: MediateurId
    readonly maintenant: Date
  }): Promise<Result<BeneficiaireIdentifie, EchecDeCreerBeneficiaire>> => {
    const cree = toBeneficiaireIdentifie(beneficiaire, {
      id: beneficiaireId,
      mediateurId,
      creation: maintenant,
      modification: maintenant,
    })

    await enregistrerLeBeneficiaire(cree)

    return success(cree)
  }
