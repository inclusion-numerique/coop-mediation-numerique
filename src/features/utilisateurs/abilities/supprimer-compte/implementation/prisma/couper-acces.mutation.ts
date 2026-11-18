import { prismaClient } from '@/configuration/prisma/prismaClient'
import { identiteAnonymeFromDomain } from '@/features/utilisateurs/db/compte.transfer'
import type {
  IdentiteAnonyme,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { synchroniserPersonne } from '@/libraries/registre-personne'

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

    if (!dejaAnonymise) {
      await transaction.user.update({
        where: { id: utilisateurId },
        data: identiteAnonymeFromDomain(identite, supprimeLe),
      })
    }

    await synchroniserPersonne(transaction, utilisateurId, supprimeLe)
  })
