import {
  UtilisateurId,
  UtilisateurIntrouvable,
} from '@app/web/features/utilisateurs/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'

export const deconnecterUnUtilisateur = async (
  utilisateurId: string,
): Promise<
  Result<{ readonly sessionsFermees: number }, UtilisateurIntrouvable>
> => {
  const id = UtilisateurId.safe(utilisateurId)
  const existe =
    id !== null && (await prismaClient.user.count({ where: { id } })) > 0

  if (id === null || !existe)
    return failure(UtilisateurIntrouvable(utilisateurId))

  const { count } = await prismaClient.session.deleteMany({
    where: { userId: id },
  })

  return success({ sessionsFermees: count })
}
