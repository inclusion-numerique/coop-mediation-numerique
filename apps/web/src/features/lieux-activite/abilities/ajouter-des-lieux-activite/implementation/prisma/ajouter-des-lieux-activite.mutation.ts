import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import {
  type AjouterDesLieuxActivitePorts,
  type EchecDAjout,
  type LieuDemande,
  lieuxAMaterialiser,
  MediateurRequis,
  PanierVide,
} from '../../domain'
import { rattacherAuLieu } from './rattacher-au-lieu'

const estDefini = (valeur?: string | null): valeur is string => valeur != null

/**
 * Ajoute d'un coup les lieux du panier à l'activité du médiateur.
 *
 * Tout ou rien : le médiateur valide un ensemble, et un demi-panier serait plus
 * déroutant qu'un échec net. D'où l'unique transaction — mais les structures de
 * la cartographie sont résolues AVANT de l'ouvrir, l'Entrepôt ayant son propre
 * client Prisma, sans transaction partagée.
 *
 * Le traitement est séquentiel, et non `Promise.all` : deux lieux demandés
 * peuvent se corréler au même lieu de la coop, et des sondes menées de front ne
 * verraient pas les créations l'une de l'autre — le doublon que l'on cherche
 * précisément à éviter.
 */
export const ajouterDesLieuxActivite = async ({
  demandes,
  userId,
  mediateurId,
  ports,
  maintenant = new Date(),
}: {
  readonly demandes: readonly LieuDemande[]
  readonly userId: string
  readonly mediateurId: string | null
  readonly ports: AjouterDesLieuxActivitePorts
  readonly maintenant?: Date
}): Promise<Result<{ readonly lieux: readonly string[] }, EchecDAjout>> => {
  if (mediateurId == null) return failure(MediateurRequis)
  if (demandes.length === 0) return failure(PanierVide)

  const aMaterialiser = lieuxAMaterialiser(
    await ports.lireLieuxDejaRattaches(mediateurId),
    demandes,
  )

  if (aMaterialiser.length === 0) return success({ lieux: [] })

  const structuresCarto = await ports.trouverStructuresCarto(
    aMaterialiser
      .map(
        ({ structureCartographieNationaleId }) =>
          structureCartographieNationaleId,
      )
      .filter(estDefini),
  )

  const structuresCartoParId = new Map(
    structuresCarto.map((structure) => [structure.id, structure]),
  )

  const lieux = await prismaClient.$transaction(async (transaction) =>
    aMaterialiser.reduce<Promise<readonly string[]>>(
      async (precedents, lieu) => [
        ...(await precedents),
        (
          await rattacherAuLieu(transaction, {
            userId,
            lieu,
            structuresCartoParId,
            maintenant,
          })
        ).lieuId,
      ],
      Promise.resolve([]),
    ),
  )

  return success({ lieux })
}
