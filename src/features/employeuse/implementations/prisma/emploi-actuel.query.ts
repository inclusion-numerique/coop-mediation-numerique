import { prismaClient } from '@/configuration/prisma'
import type { LireLEmploiActuel } from '../../domain/ports'
import {
  emploiActuelLu,
  personneEmployeuseActuelleSelect,
} from './employeuse.transfer'

export const lireLEmploiActuel: LireLEmploiActuel = async (utilisateurId) => {
  const user = await prismaClient.user.findUnique({
    where: { id: utilisateurId },
    select: { personneMain: { select: personneEmployeuseActuelleSelect } },
  })

  return user?.personneMain ? emploiActuelLu(user.personneMain) : null
}
