import type { Prisma } from '@prisma/client'

export const softDeleteBeneficiaires = async (
  tx: Prisma.TransactionClient,
  beneficiaireIds: string[],
) => {
  if (beneficiaireIds.length === 0) return

  await tx.beneficiaire.updateMany({
    where: { id: { in: beneficiaireIds } },
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
}
