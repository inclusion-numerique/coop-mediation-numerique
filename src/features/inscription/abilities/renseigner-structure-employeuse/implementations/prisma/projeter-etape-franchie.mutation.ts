import { prismaClient } from '@/configuration/prisma'
import type { ProjeterEtapeFranchie } from '@/features/inscription/abilities/renseigner-structure-employeuse/domain'
import { inscriptionEtatFromDomain } from '@/features/inscription/implementations/prisma/inscription-etat.transfer'

export const projeterEtapeFranchie: ProjeterEtapeFranchie = async (etat) => {
  await prismaClient.user.update({
    where: { id: etat.userId },
    data: inscriptionEtatFromDomain(etat),
    select: { id: true },
  })
}
