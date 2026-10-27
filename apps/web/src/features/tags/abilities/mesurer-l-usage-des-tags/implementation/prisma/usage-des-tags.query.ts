import { prismaClient } from '@app/web/prismaClient'
import { orderItemsByIndexedValues } from '@app/web/utils/orderItemsByIndexedValues'
import {
  DescriptionDuTag,
  Effectif,
  NomDuTag,
  PorteeDuTag,
  type Proportion,
  proportion,
  TagId,
  type TagLePlusUtilise,
  type UsageDesTags,
} from '../../domain'

const NOMBRE_DE_TAGS_LES_PLUS_UTILISES = 300

const createursDeTagsUtilises = async (): Promise<Proportion> => {
  const [createurs, mediateurs] = await Promise.all([
    prismaClient.tag.findMany({
      where: { activites: { some: {} }, mediateurId: { not: null } },
      select: { mediateurId: true },
      distinct: ['mediateurId'],
    }),
    prismaClient.mediateur.count(),
  ])

  return proportion(Effectif(createurs.length), Effectif(mediateurs))
}

const activitesAvecUnTag = async (): Promise<Proportion> => {
  const [activitesTaguees, activites] = await Promise.all([
    prismaClient.activitesTags.findMany({
      select: { activiteId: true },
      distinct: ['activiteId'],
    }),
    prismaClient.activite.count(),
  ])

  return proportion(Effectif(activitesTaguees.length), Effectif(activites))
}

const porteeDepuisLaBase = ({
  equipe,
  mediateurId,
  coordinateurId,
  departement,
}: {
  equipe: boolean | null
  mediateurId: string | null
  coordinateurId: string | null
  departement: string | null
}): PorteeDuTag =>
  PorteeDuTag(
    equipe === true
      ? 'Equipe'
      : mediateurId || coordinateurId
        ? 'Personnel'
        : departement
          ? 'Departemental'
          : 'National',
  )

const tagsLesPlusUtilises = async (): Promise<TagLePlusUtilise[]> => {
  const usages = await prismaClient.activitesTags.groupBy({
    by: ['tagId'],
    _count: { tagId: true },
    orderBy: { _count: { tagId: 'desc' } },
    take: NOMBRE_DE_TAGS_LES_PLUS_UTILISES,
  })

  const idsOrdonnes = usages.map(({ tagId }) => tagId)
  const usageParTag = new Map(
    usages.map(({ tagId, _count }) => [tagId, _count.tagId]),
  )

  const tags = await prismaClient.tag.findMany({
    where: { id: { in: idsOrdonnes } },
    select: {
      id: true,
      nom: true,
      description: true,
      mediateurId: true,
      coordinateurId: true,
      departement: true,
      equipe: true,
      activites: {
        select: { activite: { select: { accompagnementsCount: true } } },
      },
      _count: { select: { activitesCoordinationTags: true } },
    },
  })

  return orderItemsByIndexedValues(tags, idsOrdonnes).map((tag) => ({
    id: TagId(tag.id),
    nom: NomDuTag(tag.nom),
    portee: porteeDepuisLaBase(tag),
    description: DescriptionDuTag.safe(tag.description ?? ''),
    utilisations: Effectif(usageParTag.get(tag.id) ?? 0),
    accompagnements: Effectif(
      tag.activites.reduce(
        (total, { activite }) => total + activite.accompagnementsCount,
        0,
      ) + tag._count.activitesCoordinationTags,
    ),
  }))
}

export const usageDesTags = async (): Promise<UsageDesTags> => {
  const [createurs, activites, tags] = await Promise.all([
    createursDeTagsUtilises(),
    activitesAvecUnTag(),
    tagsLesPlusUtilises(),
  ])

  return {
    createursDeTagsUtilises: createurs,
    activitesAvecUnTag: activites,
    tagsLesPlusUtilises: tags,
  }
}
