import { toBeneficiaireIdentifie } from '@app/web/features/beneficiaire/abilities/creer-beneficiaire/domain/beneficiaire-a-creer'
import { beneficiaireFromDomain } from '@app/web/features/beneficiaire/db'
import { BeneficiaireNotFound } from '@app/web/features/beneficiaire/domain/errors'
import { failure, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
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
