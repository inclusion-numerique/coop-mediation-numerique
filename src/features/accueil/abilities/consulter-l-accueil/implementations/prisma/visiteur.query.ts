import { prismaClient } from '@/configuration/prisma'
import type { LireLeVisiteur } from '../../domain/ports'
import { versVisiteur, visiteurSelect } from './visiteur.transfer'

export const lireLeVisiteur: LireLeVisiteur = async ({ utilisateurId }) => {
  const utilisateur = await prismaClient.user.findUnique({
    where: { id: utilisateurId },
    select: visiteurSelect,
  })

  return utilisateur === null ? null : versVisiteur(utilisateur)
}
