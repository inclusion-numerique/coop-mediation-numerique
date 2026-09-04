import { prismaClient } from '@app/web/prismaClient'
import { acteurSelectForList } from '../../acteurs/db/searchActeurs'

/**
 * Les médiateurs qui exercent dans un lieu, avec la date de leur dernière
 * activité sur place.
 *
 * Cette lecture appartient à l'annuaire — c'est lui qui affiche ces cartes — et
 * non à la fiche du lieu, qui se contente de lui réserver un emplacement.
 */
export const mediateursEnActiviteDuLieu = async (lieuId: string) => {
  const rattachements = await prismaClient.mediateurEnActivite.findMany({
    where: {
      structureId: lieuId,
      suppression: null,
      fin: null,
      mediateur: { user: { deleted: null } },
    },
    orderBy: [
      { mediateur: { user: { lastName: 'asc' } } },
      { mediateur: { user: { firstName: 'asc' } } },
    ],
    select: {
      id: true,
      mediateur: {
        select: {
          user: { select: acteurSelectForList },
          activites: {
            take: 1,
            orderBy: { date: 'desc' },
            select: { id: true, date: true },
            where: { structureId: lieuId },
          },
        },
      },
    },
  })

  return rattachements.map((rattachement) => ({
    ...rattachement,
    mediateur: {
      ...rattachement.mediateur,
      derniereActivite: {
        date: rattachement.mediateur.activites[0]?.date ?? null,
      },
    },
  }))
}

export type MediateurEnActiviteDuLieu = Awaited<
  ReturnType<typeof mediateursEnActiviteDuLieu>
>[number]
