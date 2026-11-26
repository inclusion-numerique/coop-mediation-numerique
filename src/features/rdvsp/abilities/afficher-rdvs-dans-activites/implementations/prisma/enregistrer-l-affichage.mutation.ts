import { prismaClient } from '@/configuration/prisma'
import type { EnregistrerLAffichage } from '../../domain/ports'

export const enregistrerLAffichage: EnregistrerLAffichage = async ({
  utilisateurId,
  afficher,
}) => {
  await prismaClient.rdvAccount.updateMany({
    where: { userId: utilisateurId },
    data: { includeRdvsInActivitesList: afficher },
  })
}
