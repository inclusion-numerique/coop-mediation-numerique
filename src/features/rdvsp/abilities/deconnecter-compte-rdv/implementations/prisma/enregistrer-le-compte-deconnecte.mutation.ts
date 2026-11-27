import { prismaClient } from '@/configuration/prisma'
import { compteRdvFromDomain } from '../../../../implementations/prisma/compte-rdv.transfer'
import type { EnregistrerLeCompteDeconnecte } from '../../domain/ports'

export const enregistrerLeCompteDeconnecte: EnregistrerLeCompteDeconnecte =
  async (compte) => {
    await prismaClient.rdvAccount.update({
      where: { id: compte.agentId },
      data: compteRdvFromDomain(compte),
    })
  }
