import { prismaClient } from '@/configuration/prisma'
import {
  EchecTechnique,
  type IdentiteAnonyme,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { identiteAnonymeFromDomain } from '@/features/utilisateurs/implementations/prisma/compte.transfer'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { failure, type Result, success } from '@/libraries/result'

export const couperAcces =
  (synchroniserLaPersonne: SynchroniserLaPersonne) =>
  async ({
    utilisateurId,
    identite,
    supprimeLe,
    dejaAnonymise,
  }: {
    readonly utilisateurId: UtilisateurId
    readonly identite: IdentiteAnonyme
    readonly supprimeLe: Date
    readonly dejaAnonymise: boolean
  }): Promise<Result<void, EchecTechnique>> => {
    try {
      await prismaClient.$transaction(async (transaction) => {
        await transaction.session.deleteMany({
          where: { userId: utilisateurId },
        })

        await transaction.account.deleteMany({
          where: { userId: utilisateurId },
        })

        if (!dejaAnonymise) {
          await transaction.user.update({
            where: { id: utilisateurId },
            data: identiteAnonymeFromDomain(identite, supprimeLe),
          })
        }

        await synchroniserLaPersonne(transaction, utilisateurId, supprimeLe)
      })
      return success(undefined)
    } catch (erreur) {
      return failure(
        EchecTechnique(
          erreur instanceof Error ? erreur.message : String(erreur),
        ),
      )
    }
  }
