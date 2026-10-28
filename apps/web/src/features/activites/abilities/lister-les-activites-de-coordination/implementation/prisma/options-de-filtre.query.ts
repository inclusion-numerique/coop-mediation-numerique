import { prismaClient } from '@app/web/prismaClient'
import { type CoordinateurId, NomDeTag, TagId } from '../../../../domain'
import { type OptionsDeFiltre, PorteeDeTag } from '../../domain'

const porteeDe = (tag: {
  mediateurId: string | null
  coordinateurId: string | null
  departement: string | null
  equipe: boolean | null
}): PorteeDeTag => {
  if (tag.equipe === true) return PorteeDeTag('Equipe')
  if (tag.mediateurId !== null || tag.coordinateurId !== null)
    return PorteeDeTag('Personnel')
  if (tag.departement !== null) return PorteeDeTag('Departemental')
  return PorteeDeTag('National')
}

export const optionsDeFiltre = async ({
  coordinateurId,
}: {
  coordinateurId: CoordinateurId
}): Promise<OptionsDeFiltre> => {
  const deLaCoordination = { coordinateurId, suppression: null }
  const [tags, bornes] = await Promise.all([
    prismaClient.tag.findMany({
      where: {
        activitesCoordinationTags: {
          some: { activiteCoordination: deLaCoordination },
        },
      },
      select: {
        id: true,
        nom: true,
        mediateurId: true,
        coordinateurId: true,
        departement: true,
        equipe: true,
      },
      orderBy: { nom: 'asc' },
    }),
    prismaClient.activiteCoordination.aggregate({
      _min: { date: true },
      _max: { date: true },
      where: deLaCoordination,
    }),
  ])

  return {
    tags: tags.flatMap((tag) => {
      const nom = NomDeTag.safe(tag.nom)
      return nom === null
        ? []
        : [{ id: TagId(tag.id), nom, portee: porteeDe(tag) }]
    }),
    periodeCouverte:
      bornes._min.date === null || bornes._max.date === null
        ? null
        : { du: bornes._min.date, au: bornes._max.date },
  }
}
