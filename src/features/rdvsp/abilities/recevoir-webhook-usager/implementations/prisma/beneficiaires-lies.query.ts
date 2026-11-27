import { prismaClient } from '@/configuration/prisma'
import { BeneficiaireId } from '../../../../domain/identifiants/beneficiaire-id'
import type { BeneficiairesLiesAUsager } from '../../domain/ports'

export const beneficiairesLiesAUsager: BeneficiairesLiesAUsager = async (
  usagerId,
) =>
  (
    await prismaClient.beneficiaire.findMany({
      where: { rdvUserId: usagerId, suppression: null },
      select: { id: true },
    })
  ).map(({ id }) => ({ id: BeneficiaireId(id) }))
