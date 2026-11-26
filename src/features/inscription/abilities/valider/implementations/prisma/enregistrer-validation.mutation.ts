import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { EnregistrerValidation } from '../../domain/ports'

export const enregistrerValidation: EnregistrerValidation = async ({
  userId,
  inscriptionValidee,
  cguAPoser,
}) => {
  await prismaClient.user.update({
    where: { id: userId },
    data: {
      inscriptionValidee,
      onboardingStatus: null,
      ...(cguAPoser === null ? {} : { acceptationCgu: cguAPoser }),
    },
  })

  addMutationLog({
    userId,
    nom: 'ValiderInscription',
    data: { id: userId },
  })
}
