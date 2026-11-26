import { prismaClient } from '@/configuration/prisma'
import type { CompteRdvExiste } from '../../domain/afficher-rdvs-dans-activites'

export const compteRdvExiste: CompteRdvExiste = async (utilisateurId) =>
  (await prismaClient.rdvAccount.count({
    where: { userId: utilisateurId },
  })) > 0
