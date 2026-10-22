import { identiteAnonymeFromDomain } from '@app/web/features/utilisateurs/db/compte.transfer'
import type {
  IdentiteAnonyme,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'

export const couperAcces = ({
  utilisateurId,
  identite,
  supprimeLe,
  dejaAnonymise,
}: {
  readonly utilisateurId: UtilisateurId
  readonly identite: IdentiteAnonyme
  readonly supprimeLe: Date
  readonly dejaAnonymise: boolean
}): Promise<void> =>
  prismaClient.$transaction(async (transaction) => {
    await transaction.session.deleteMany({ where: { userId: utilisateurId } })

    await transaction.account.deleteMany({ where: { userId: utilisateurId } })

    if (dejaAnonymise) return

    await transaction.user.update({
      where: { id: utilisateurId },
      data: identiteAnonymeFromDomain(identite, supprimeLe),
    })
  })
