import { prismaClient } from '@/configuration/prisma'
import { toBeneficiaireIdentifie } from '@/features/beneficiaire/domain/beneficiaire'
import { BeneficiaireNotFound } from '@/features/beneficiaire/domain/errors'
import { beneficiaireFromDomain } from '@/features/beneficiaire/implementations/prisma/beneficiaire.transfer'
import { failure, success } from '@/libraries/result'
import type { ModifierBeneficiaire } from '../../domain/beneficiaire-a-modifier'

export const modifierBeneficiaire: ModifierBeneficiaire = async ({
  beneficiaire,
  mediateurId,
}) => {
  const existing = await prismaClient.beneficiaire.findFirst({
    where: { id: beneficiaire.id, mediateurId, suppression: null },
    select: { creation: true },
  })

  if (!existing) return failure(BeneficiaireNotFound(beneficiaire.id))

  const entity = toBeneficiaireIdentifie(beneficiaire, {
    id: beneficiaire.id,
    mediateurId,
    creation: existing.creation,
    modification: new Date(),
  })

  const { id: _id, ...data } = beneficiaireFromDomain(entity)
  await prismaClient.beneficiaire.update({
    where: { id: beneficiaire.id },
    data,
  })

  return success(entity)
}
