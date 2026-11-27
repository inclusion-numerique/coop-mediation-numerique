import { prismaClient } from '@/configuration/prisma'
import {
  type NomAffiche,
  nomAffiche,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { identiteToDomain } from '@/features/utilisateurs/implementations/prisma/identite.transfer'

export const rendreLaSession = async ({
  jeton,
  usurpateurId,
}: {
  readonly jeton: string
  readonly usurpateurId: UtilisateurId
}): Promise<NomAffiche> => {
  const session = await prismaClient.session.update({
    where: { sessionToken: jeton },
    data: { userId: usurpateurId, usurperId: null },
    select: {
      user: {
        select: { firstName: true, lastName: true, name: true, email: true },
      },
    },
  })

  return nomAffiche(identiteToDomain(session.user))
}
