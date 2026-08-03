import { prismaClient } from '@app/web/prismaClient'
import {
  personneEmployeuseSelect,
  personneToAffectations,
  personneToContrats,
} from '../../../../db/employeuse.transfer'
import { employeuseActuelle } from '../../../../domain/employeuse-actuelle'
import type { ConsulterEmployeuseActuelle } from '../../domain/consulter-employeuse-actuelle'

export const consulterEmployeuseActuelle: ConsulterEmployeuseActuelle = async ({
  userId,
}) => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: { personneMain: { select: personneEmployeuseSelect } },
  })

  const personne = user?.personneMain ?? null

  return employeuseActuelle(
    personneToAffectations(personne),
    personneToContrats(personne),
  )
}
