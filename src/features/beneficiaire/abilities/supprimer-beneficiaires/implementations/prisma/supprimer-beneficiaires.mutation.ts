import { prismaClient } from '@/configuration/prisma/prisma-client'
import { Prisma } from '@/generated/prisma/client'
import { failure, success } from '@/libraries/result'
import { garderUnSeulCodePostal } from '../../../../implementations/prisma/un-seul-code-postal.mutation'
import { AucunBeneficiaireValide } from '../../domain/errors'
import type { SupprimerBeneficiaires } from '../../domain/supprimer-beneficiaires'

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
    await garderUnSeulCodePostal(tx, Prisma.sql`id = ANY(${validIds}::uuid[])`)
  })

  return success({ deleted: validIds.length })
}
