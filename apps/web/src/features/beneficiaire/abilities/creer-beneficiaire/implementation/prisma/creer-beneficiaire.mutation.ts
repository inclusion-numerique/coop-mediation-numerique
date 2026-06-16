import { beneficiaireFromDomain } from '@app/web/features/beneficiaire/db'
import { toBeneficiaireIdentifie } from '@app/web/features/beneficiaire/domain/beneficiaire-a-creer'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
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
        beneficiairesCount: { increment: 1 },
        derniereCreationBeneficiaire: now,
      },
    })
  })

  return entity
}
