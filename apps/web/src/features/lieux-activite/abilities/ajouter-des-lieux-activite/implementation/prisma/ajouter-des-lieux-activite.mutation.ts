import { type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { LieuId } from '../../../../domain/lieu-id'
import type { MediateurId } from '../../../../domain/mediateur-id'
import type { UserId } from '../../../../domain/user-id'
import {
  type AjouterDesLieuxActivitePorts,
  demandeDAjout,
  type EchecDAjout,
  identifiantsCarto,
  type LieuDemande,
  lieuxAMaterialiser,
} from '../../domain'
import { rattacherAuLieu } from './rattacher-au-lieu'

/**
 * Traite les éléments l'un APRÈS l'autre, et non de front.
 *
 * `Promise.all` ne convient pas ici : deux lieux demandés peuvent se corréler au
 * même lieu de la coop, et des sondes menées en parallèle ne verraient pas les
 * créations l'une de l'autre — le doublon que l'on cherche précisément à éviter.
 */
const enSerie = async <Element, Resultat>(
  elements: readonly Element[],
  traiter: (element: Element) => Promise<Resultat>,
): Promise<readonly Resultat[]> =>
  elements.reduce<Promise<readonly Resultat[]>>(
    async (precedents, element) => [
      ...(await precedents),
      await traiter(element),
    ],
    Promise.resolve([]),
  )

/**
 * Ajoute d'un coup les lieux du panier à l'activité du médiateur.
 *
 * Tout ou rien : le médiateur valide un ensemble, et un demi-panier serait plus
 * déroutant qu'un échec net. D'où l'unique transaction — mais les structures de
 * la cartographie sont résolues AVANT de l'ouvrir, l'Entrepôt ayant son propre
 * client Prisma, sans transaction partagée.
 */
export const ajouterDesLieuxActivite = async ({
  demandes,
  userId,
  mediateurId,
  ports,
  maintenant = new Date(),
}: {
  readonly demandes: readonly LieuDemande[]
  readonly userId: UserId
  readonly mediateurId: MediateurId | null
  readonly ports: AjouterDesLieuxActivitePorts
  readonly maintenant?: Date
}): Promise<Result<{ readonly lieux: readonly LieuId[] }, EchecDAjout>> => {
  const demande = demandeDAjout({ mediateurId, demandes })

  if (!demande.success) return demande

  const aMaterialiser = lieuxAMaterialiser(
    await ports.lireLieuxDejaRattaches(demande.data.mediateurId),
    demande.data.demandes,
  )

  if (aMaterialiser.length === 0) return success({ lieux: [] })

  const structuresCartoParId = await ports.trouverStructuresCarto(
    identifiantsCarto(aMaterialiser),
  )

  const lieux = await prismaClient.$transaction((transaction) =>
    enSerie(aMaterialiser, async (lieu) => {
      const { lieuId } = await rattacherAuLieu(transaction, {
        userId,
        lieu,
        structuresCartoParId,
        maintenant,
      })

      return LieuId(lieuId)
    }),
  )

  return success({ lieux })
}
