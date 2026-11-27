import { prismaClient } from '@/configuration/prisma'
import { Prisma } from '@/generated/prisma/client'
import { garderUnSeulCodePostal } from '../../../../implementations/prisma/un-seul-code-postal.mutation'

export const anonymiserPortefeuille = async ({
  mediateurId,
  maintenant = new Date(),
}: {
  readonly mediateurId: string
  readonly maintenant?: Date
}): Promise<{ readonly anonymises: number }> => {
  const { count } = await prismaClient.$transaction(async (transaction) => {
    const anonymises = await transaction.beneficiaire.updateMany({
      where: { mediateurId, suppression: null },
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
      transaction,
      Prisma.sql`mediateur_id = ${mediateurId}::uuid AND anonyme = true`,
    )
    return anonymises
  })

  return { anonymises: count }
}
