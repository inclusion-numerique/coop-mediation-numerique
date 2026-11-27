import { prismaClient } from '@/configuration/prisma'
import {
  historiqueDEmploiLu,
  personneEmployeuseSelect,
} from '../../../../implementations/prisma/employeuse.transfer'
import type { LireLHistoriqueDEmploi } from '../../domain/ports'

export const lireLHistoriqueDEmploi: LireLHistoriqueDEmploi = async (
  utilisateurId,
) => {
  const user = await prismaClient.user.findUnique({
    where: { id: utilisateurId },
    select: { personneMain: { select: personneEmployeuseSelect } },
  })

  return user?.personneMain ? historiqueDEmploiLu(user.personneMain) : null
}
