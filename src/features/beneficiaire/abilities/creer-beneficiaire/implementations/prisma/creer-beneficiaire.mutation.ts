import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { toBeneficiaireIdentifie } from '@/features/beneficiaire/domain/beneficiaire'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { beneficiaireFromDomain } from '@/features/beneficiaire/implementations/prisma/beneficiaire.transfer'
import type { CreerBeneficiaire } from '../../domain/creer-beneficiaire'

export const creerBeneficiaire: CreerBeneficiaire = async ({
  beneficiaire,
  mediateurId,
}) => {
  const now = new Date()
  const entity = toBeneficiaireIdentifie(beneficiaire, {
    id: BeneficiaireId(v4()),
    mediateurId,
    creation: now,
    modification: now,
  })

  await prismaClient.$transaction(async (tx) => {
    await tx.beneficiaire.create({ data: beneficiaireFromDomain(entity) })
    await tx.mediateur.update({
      where: { id: mediateurId },
      data: {
        derniereCreationBeneficiaire: now,
      },
    })
  })

  return entity
}
