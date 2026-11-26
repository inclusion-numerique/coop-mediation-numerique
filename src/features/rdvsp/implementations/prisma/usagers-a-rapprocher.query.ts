import { prismaClient } from '@/configuration/prisma'
import type { LireLesUsagersARapprocher } from '../../domain/ports'

export const lireLesUsagersARapprocher: LireLesUsagersARapprocher = async (
  usagerIds,
) =>
  (
    await prismaClient.rdvUser.findMany({
      where: { id: { in: [...usagerIds] } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        address: true,
        birthDate: true,
      },
    })
  ).map((usager) => ({
    rdvUserId: usager.id,
    nom: usager.lastName,
    prenom: usager.firstName,
    telephone: usager.phoneNumber,
    email: usager.email,
    adresse: usager.address,
    birthDate: usager.birthDate,
  }))
