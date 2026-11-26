import { prismaClient } from '@/configuration/prisma'
import type { LierUsagerAuBeneficiaire } from '../../domain/ports'

export const lierUsagerAuBeneficiaire: LierUsagerAuBeneficiaire = async ({
  beneficiaire,
  usagerId,
}) => {
  await prismaClient.$transaction(async (transaction) => {
    await transaction.rdvUser.upsert({
      where: { id: usagerId },
      create: {
        id: usagerId,
        firstName: beneficiaire.prenom ?? '-',
        lastName: beneficiaire.nom ?? '-',
        email: beneficiaire.email,
        phoneNumber: beneficiaire.telephone,
        notifyByEmail: false,
        notifyBySms: false,
      },
      update: {},
    })

    await transaction.beneficiaire.update({
      where: { id: beneficiaire.id },
      data: { rdvUserId: usagerId },
    })
  })
}
