import { failure, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { AucunBeneficiaireValide } from '../../domain/errors'
import type { SupprimerBeneficiaires } from '../../domain/ports'

export const supprimerBeneficiaires: SupprimerBeneficiaires = async ({
  ids,
  mediateurId,
}) => {
  const beneficiaires = await prismaClient.beneficiaire.findMany({
    where: {
      id: { in: [...ids] },
      mediateurId,
      suppression: null,
    },
    select: { id: true },
  })

  const validIds = beneficiaires.map(({ id }) => id)

  if (validIds.length === 0) {
    return failure(AucunBeneficiaireValide)
  }

  await prismaClient.$transaction(async (tx) => {
    await tx.beneficiaire.updateMany({
      where: { id: { in: validIds } },
      data: {
        anonyme: true,
        suppression: new Date(),
        modification: new Date(),
        rdvUserId: null,
        prenom: null,
        nom: null,
        telephone: null,
        email: null,
        notes: null,
        adresse: null,
        pasDeTelephone: null,
      },
    })
    await tx.mediateur.update({
      where: { id: mediateurId },
      data: { beneficiairesCount: { decrement: validIds.length } },
    })
  })

  return success({ deleted: validIds.length })
}
