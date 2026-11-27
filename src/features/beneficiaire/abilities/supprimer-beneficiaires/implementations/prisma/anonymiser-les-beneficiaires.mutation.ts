import { prismaClient } from '@/configuration/prisma'
import { Prisma } from '@/generated/prisma/client'
import { garderUnSeulCodePostal } from '../../../../implementations/prisma/un-seul-code-postal.mutation'
import type { AnonymiserLesBeneficiaires } from '../../domain/ports'

export const anonymiserLesBeneficiaires: AnonymiserLesBeneficiaires = async ({
  ids,
  mediateurId,
  maintenant,
}) => {
  await prismaClient.$transaction(async (tx) => {
    await tx.beneficiaire.updateMany({
      where: { id: { in: [...ids] }, mediateurId, suppression: null },
      data: {
        anonyme: true,
        suppression: maintenant,
        modification: maintenant,
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
    await garderUnSeulCodePostal(
      tx,
      Prisma.sql`id = ANY(${ids}::uuid[]) AND mediateur_id = ${mediateurId}::uuid`,
    )
  })
}
