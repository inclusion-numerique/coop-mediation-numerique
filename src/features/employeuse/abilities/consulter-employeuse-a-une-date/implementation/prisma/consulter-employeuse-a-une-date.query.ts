import { prismaClient } from '@/configuration/prisma/prismaClient'
import {
  personneEmployeuseActuelleSelect,
  personneToEmployeuseALaDate,
} from '../../../../db/employeuse.transfer'
import type { ConsulterEmployeuseAUneDate } from '../../domain/consulter-employeuse-a-une-date'

export const consulterEmployeuseAUneDate: ConsulterEmployeuseAUneDate = async ({
  userId,
  date,
}) => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: { personneMain: { select: personneEmployeuseActuelleSelect } },
  })

  return personneToEmployeuseALaDate(user?.personneMain ?? null, date)
}
