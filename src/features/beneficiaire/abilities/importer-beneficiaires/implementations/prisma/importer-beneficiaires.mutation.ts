import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { toBeneficiaireIdentifie } from '@/features/beneficiaire/domain/beneficiaire'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { beneficiaireFromDomain } from '@/features/beneficiaire/implementations/prisma/beneficiaire.transfer'
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
