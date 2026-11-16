import { beneficiaireFromDomain } from '@app/web/features/beneficiaire/db'
import { toBeneficiaireIdentifie } from '@app/web/features/beneficiaire/domain/beneficiaire'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import type { ImporterBeneficiaires } from '../../domain/importer-beneficiaires'

export const importerBeneficiaires: ImporterBeneficiaires = async ({
  beneficiaires,
  mediateurId,
}) => {
  const now = new Date()

  const data = beneficiaires.map((beneficiaire) => ({
    ...beneficiaireFromDomain(
      toBeneficiaireIdentifie(beneficiaire, {
        id: BeneficiaireId(v4()),
        mediateurId,
        creation: now,
        modification: now,
      }),
    ),
    import: now,
  }))

  const { count } = await prismaClient.beneficiaire.createMany({ data })

  return { importes: count }
}
