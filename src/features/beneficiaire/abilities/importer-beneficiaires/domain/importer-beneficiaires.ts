import { toBeneficiaireIdentifie } from '@/features/beneficiaire/domain/beneficiaire'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { type Result, success } from '@/libraries/result'
import type { LigneAImporter } from './beneficiaire-a-importer'
import type { BeneficiairesImportes } from './beneficiaires-importes'
import type { EchecDImporterBeneficiaires } from './errors'
import type { ImporterBeneficiairesPorts } from './ports'

export const importerBeneficiaires =
  ({ enregistrerLesBeneficiairesImportes }: ImporterBeneficiairesPorts) =>
  async ({
    lignes,
    mediateurId,
    maintenant,
  }: {
    readonly lignes: readonly LigneAImporter[]
    readonly mediateurId: MediateurId
    readonly maintenant: Date
  }): Promise<Result<BeneficiairesImportes, EchecDImporterBeneficiaires>> => {
    const beneficiaires = lignes.map(({ id, beneficiaire }) =>
      toBeneficiaireIdentifie(beneficiaire, {
        id,
        mediateurId,
        creation: maintenant,
        modification: maintenant,
      }),
    )

    await enregistrerLesBeneficiairesImportes(beneficiaires)

    return success({ beneficiaires })
  }
