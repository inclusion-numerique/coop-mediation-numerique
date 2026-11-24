import { prismaClient } from '@/configuration/prisma/prisma-client'
import type {
  IdentiteAnonyme,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { identiteAnonymeFromDomain } from '@/features/utilisateurs/implementations/prisma/compte.transfer'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'

export const couperAcces =
  (synchroniserLaPersonne: SynchroniserLaPersonne) =>
  ({
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

      await synchroniserLaPersonne(transaction, utilisateurId, supprimeLe)
    })
