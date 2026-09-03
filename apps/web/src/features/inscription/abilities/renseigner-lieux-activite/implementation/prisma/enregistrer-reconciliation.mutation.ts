import { inscriptionEtatFromDomain } from '@app/web/features/inscription/db'
import { rattacherAuLieu } from '@app/web/features/lieux-activite'
import { prismaClient } from '@app/web/prismaClient'
import type { EnregistrerReconciliation } from '../../domain'

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
export const enregistrerReconciliation: EnregistrerReconciliation = async ({
  etatFranchi,
  userId,
  aCloturer,
  aCreer,
  structuresCarto,
}) => {
  const structuresCartoParId = new Map(
    structuresCarto.map((structure) => [structure.id, structure]),
  )
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
      await rattacherAuLieu(transaction, {
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
