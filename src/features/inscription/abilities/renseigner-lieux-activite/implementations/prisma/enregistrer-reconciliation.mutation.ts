import { prismaClient } from '@/configuration/prisma'
import { inscriptionEtatFromDomain } from '@/features/inscription/implementations/prisma/inscription-etat.transfer'
import type { Prisma } from '@/generated/prisma/client'
import type {
  EnregistrerReconciliation,
  ReconciliationEnregistree,
} from '../../domain'

export type EcritureDesLieux<Destination> = {
  readonly lieuDisparu: (
    transaction: Prisma.TransactionClient,
    destinations: readonly Destination[],
  ) => Promise<string | null>
  readonly appliquerLesDestinations: (
    transaction: Prisma.TransactionClient,
    input: {
      readonly utilisateurId: string
      readonly destinations: readonly Destination[]
      readonly maintenant: Date
    },
  ) => Promise<void>
}

export const enregistrerReconciliation =
  <Destination>({
    lieuDisparu,
    appliquerLesDestinations,
  }: EcritureDesLieux<Destination>): EnregistrerReconciliation<Destination> =>
  async ({ etatFranchi, userId, aCloturer, destinations, maintenant }) =>
    prismaClient.$transaction(
      async (transaction): Promise<ReconciliationEnregistree> => {
        const disparu = await lieuDisparu(transaction, destinations)

        if (disparu !== null) return { _tag: 'LieuDisparu', lieuId: disparu }

        await transaction.mediateurEnActivite.updateMany({
          where: { id: { in: [...aCloturer] } },
          data: {
            fin: maintenant,
            suppression: maintenant,
            suppressionParId: userId,
          },
        })

        await appliquerLesDestinations(transaction, {
          utilisateurId: userId,
          destinations,
          maintenant,
        })

        await transaction.user.update({
          where: { id: userId },
          data: inscriptionEtatFromDomain(etatFranchi),
        })

        return { _tag: 'Enregistree' }
      },
    )
