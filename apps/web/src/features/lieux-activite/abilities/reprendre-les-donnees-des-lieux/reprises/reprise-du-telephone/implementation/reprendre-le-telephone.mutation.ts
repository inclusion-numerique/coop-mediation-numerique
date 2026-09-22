import { prismaClient } from '@app/web/prismaClient'
import { ecrireAuContactDuRegistre } from '../../../implementation/prisma/contact-au-registre'
import type { ReprendreLeTelephone } from '../domain/reprise-du-telephone'
import type { TelephoneAReprendre } from '../domain/telephone-a-reprendre'

const telephoneAEcrire = (aReprendre: TelephoneAReprendre): string | null =>
  aReprendre.verdict === 'a-corriger' ? aReprendre.corrige : null

export const reprendreLeTelephone: ReprendreLeTelephone = async (
  lieuId,
  aReprendre,
) => {
  const ligne = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    select: { modification: true },
  })

  if (ligne == null) return

  await prismaClient.$transaction(async (transaction) => {
    await transaction.lieuInclusion.update({
      where: { id: lieuId },
      data: {
        telephone: telephoneAEcrire(aReprendre),
        modification: ligne.modification,
      },
    })

    await ecrireAuContactDuRegistre(transaction, lieuId, 'telephone')
  })
}
