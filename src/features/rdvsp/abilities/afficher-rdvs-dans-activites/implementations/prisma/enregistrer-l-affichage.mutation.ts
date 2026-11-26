import { prismaClient } from '@/configuration/prisma'
import type { EnregistrerLAffichage } from '../../domain/afficher-rdvs-dans-activites'

export const enregistrerLAffichage: EnregistrerLAffichage = async ({
  utilisateurId,
  afficher,
}) => {
  await prismaClient.rdvAccount.updateMany({
    where: { userId: utilisateurId },
    data: { includeRdvsInActivitesList: afficher },
  })
}
