import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import type { EnregistrerLeRattachement } from '../../domain/ports'
import {
  deactivateCoopAffectationsExcept,
  ensureAffectationEmploiMain,
} from './garantir-l-affectation-d-emploi.mutation'

export type RegistreDesPersonnes = {
  readonly garantirLaPersonne: (
    compte: { readonly coopUserId: string; readonly email: string },
    transaction: Prisma.TransactionClient,
  ) => Promise<{ readonly id: number }>
  readonly synchroniserLaPersonne: (
    transaction: Prisma.TransactionClient,
    utilisateurId: string,
  ) => Promise<unknown>
}

export const enregistrerLeRattachement =
  ({
    garantirLaPersonne,
    synchroniserLaPersonne,
  }: RegistreDesPersonnes): EnregistrerLeRattachement =>
  async ({ userId, employeuseId }) => {
    await prismaClient.$transaction(async (transaction) => {
      const { email } = await transaction.user.findUniqueOrThrow({
        where: { id: userId },
        select: { email: true },
      })

      const personne = await garantirLaPersonne(
        { coopUserId: userId, email },
        transaction,
      )

      await ensureAffectationEmploiMain(
        { personneId: personne.id, structureAdministrativeId: employeuseId },
        transaction,
      )

      await deactivateCoopAffectationsExcept(
        {
          personneId: personne.id,
          keepStructureAdministrativeIds: [employeuseId],
        },
        transaction,
      )

      await synchroniserLaPersonne(transaction, userId)
    })
  }
