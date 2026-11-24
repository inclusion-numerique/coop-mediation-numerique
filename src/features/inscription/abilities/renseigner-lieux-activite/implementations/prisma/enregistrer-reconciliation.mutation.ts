import { prismaClient } from '@/configuration/prisma/prisma-client'
import { inscriptionEtatFromDomain } from '@/features/inscription/implementations/prisma/inscription-etat.transfer'
import type { Prisma } from '@/generated/prisma/client'
import type { EnregistrerReconciliation, LieuActiviteInput } from '../../domain'

export type RattacherAuLieuDesire<StructureCarto> = (
  transaction: Prisma.TransactionClient,
  input: {
    readonly userId: string
    readonly lieu: LieuActiviteInput
    readonly structuresCartoParId: ReadonlyMap<string, StructureCarto>
    readonly maintenant: Date
  },
) => Promise<unknown>

/**
 * Applique la réconciliation en une transaction : clôt les activités retirées,
 * rattache les nouvelles, puis projette l'état franchi (colonnes d'inscription
 * issues du transfer, jamais composées à la main). Les structures carto ont été
 * résolues hors transaction (Entrepôt, client Prisma distinct).
 *
 * La matérialisation d'un lieu — corrélation, création depuis la carto ou depuis
 * l'adresse, rattachement idempotent — appartient à `lieux-activite` et se
 * compose ici dans NOTRE transaction : la clôture, les rattachements et l'état
 * franchi tombent ensemble ou pas du tout.
 */
export const enregistrerReconciliation =
  <StructureCarto>(
    rattacherAuLieuDesire: RattacherAuLieuDesire<StructureCarto>,
  ): EnregistrerReconciliation<StructureCarto> =>
  async ({
    etatFranchi,
    userId,
    aCloturer,
    aCreer,
    structuresCarto: structuresCartoParId,
  }) => {
    const maintenant = new Date()

    await prismaClient.$transaction(async (transaction) => {
      await transaction.mediateurEnActivite.updateMany({
        where: { id: { in: [...aCloturer] } },
        data: {
          fin: maintenant,
          suppression: maintenant,
          suppressionParId: userId,
        },
      })

      // Séquentiel, et non `Promise.all` : deux lieux désirés peuvent se corréler
      // au même lieu de la coop, et des sondes menées de front ne verraient pas
      // les créations l'une de l'autre — le doublon que l'on cherche à éviter.
      await aCreer.reduce(async (precedentes, lieu) => {
        await precedentes
        await rattacherAuLieuDesire(transaction, {
          userId,
          lieu,
          structuresCartoParId,
          maintenant,
        })
      }, Promise.resolve())

      await transaction.user.update({
        where: { id: userId },
        data: inscriptionEtatFromDomain(etatFranchi),
      })
    })
  }
