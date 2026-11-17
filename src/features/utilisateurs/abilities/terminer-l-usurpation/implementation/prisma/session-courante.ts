import { identiteToDomain } from '@app/web/features/utilisateurs/db/identite.transfer'
import {
  type NomAffiche,
  nomAffiche,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'
import type { SessionCourante } from '../../domain'

export const sessionCourante = async (
  jeton: string,
): Promise<SessionCourante | null> => {
  const session = await prismaClient.session.findUnique({
    where: { sessionToken: jeton },
    select: { usurper: { select: { id: true, role: true } } },
  })

  if (session === null) return null

  return {
    jeton,
    usurpation:
      session.usurper === null
        ? { _tag: 'Aucune' }
        : {
            _tag: 'EnCours',
            usurpateurId: UtilisateurId(session.usurper.id),
            usurpateurEstAdministrateur: session.usurper.role === 'Admin',
          },
  }
}

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
