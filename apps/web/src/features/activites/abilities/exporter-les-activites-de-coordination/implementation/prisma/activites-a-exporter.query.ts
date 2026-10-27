import { prismaClient } from '@app/web/prismaClient'
import {
  activiteDeCoordinationDe,
  activiteDeCoordinationSelect,
  filtreDesCoordinations,
} from '../../../../db/activite-de-coordination.transfer'
import {
  type ActiviteDeCoordination,
  type CoordinateurId,
  type CriteresDesCoordinations,
  NomDeTag,
  type TagDeLActivite,
  TagId,
} from '../../../../domain'

export const exporterLesActivitesDeCoordination = async ({
  coordinateurId,
  criteres,
}: {
  coordinateurId: CoordinateurId
  criteres: CriteresDesCoordinations
}): Promise<readonly ActiviteDeCoordination[]> =>
  (
    await prismaClient.activiteCoordination.findMany({
      where: filtreDesCoordinations({ coordinateurId, criteres }),
      orderBy: [{ date: 'desc' }, { creation: 'desc' }],
      select: activiteDeCoordinationSelect,
    })
  ).map(activiteDeCoordinationDe)

export const tagsDesCriteres = async ({
  tags,
}: CriteresDesCoordinations): Promise<readonly TagDeLActivite[]> =>
  tags.length === 0
    ? []
    : (
        await prismaClient.tag.findMany({
          where: { id: { in: [...tags] } },
          select: { id: true, nom: true },
        })
      ).flatMap(({ id, nom }) => {
        const nomDuTag = NomDeTag.safe(nom)
        return nomDuTag === null ? [] : [{ id: TagId(id), nom: nomDuTag }]
      })
