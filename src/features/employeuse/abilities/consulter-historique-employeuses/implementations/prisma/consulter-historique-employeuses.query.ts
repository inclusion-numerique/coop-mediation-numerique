import { prismaClient } from '@/configuration/prisma/prisma-client'
import {
  personneEmployeuseSelect,
  personneToEmployeusesHistorique,
} from '../../../../implementations/prisma/employeuse.transfer'
import type { ConsulterHistoriqueEmployeuses } from '../../domain/consulter-historique-employeuses'

export const consulterHistoriqueEmployeuses: ConsulterHistoriqueEmployeuses =
  async ({ userId }) => {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { personneMain: { select: personneEmployeuseSelect } },
    })

    return personneToEmployeusesHistorique(user?.personneMain ?? null)
  }
