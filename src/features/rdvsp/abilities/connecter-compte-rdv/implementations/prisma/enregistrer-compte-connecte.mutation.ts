import { prismaClient } from '@/configuration/prisma'
import { compteRdvFromDomain } from '../../../../implementations/prisma/compte-rdv.transfer'
import type { EnregistrerCompteConnecte } from '../../domain/ports'

export const enregistrerCompteConnecte: EnregistrerCompteConnecte = async ({
  compte,
  agentIdPrecedent,
}) => {
  const colonnes = compteRdvFromDomain(compte)

  await prismaClient.rdvAccount.upsert({
    where: { id: agentIdPrecedent ?? compte.agentId },
    create: colonnes,
    update: colonnes,
  })
}
