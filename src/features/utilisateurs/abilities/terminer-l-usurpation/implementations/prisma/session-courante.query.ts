import { prismaClient } from '@/configuration/prisma'
import { UtilisateurId } from '@/features/utilisateurs/domain'
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
