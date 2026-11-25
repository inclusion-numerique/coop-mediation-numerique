import { prismaClient } from '@/configuration/prisma'
import {
  personneEmployeuseActuelleSelect,
  personneToEmployeuseActuelle,
} from '../../../../implementations/prisma/employeuse.transfer'
import type { ConsulterEmployeuseActuelle } from '../../domain/consulter-employeuse-actuelle'

export const consulterEmployeuseActuelle: ConsulterEmployeuseActuelle = async ({
  userId,
}) => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: { personneMain: { select: personneEmployeuseActuelleSelect } },
  })

  return personneToEmployeuseActuelle(user?.personneMain ?? null)
}
