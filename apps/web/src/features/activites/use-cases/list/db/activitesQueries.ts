import { BeneficiaireRdv } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/getBeneficiaireRdvsList'
import { prismaClient } from '@app/web/prismaClient'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { Prisma } from '@prisma/client'

/**
 * Helpers for activite detail modals and activité lists that merge data from all types of Cras
 */

export const activiteListeBeneficiaireSelect = {
  id: true,
  prenom: true,
  nom: true,
  anonyme: true,
  attributionsAleatoires: true,
  trancheAge: true,
  statutSocial: true,
  genre: true,
  commune: true,
  communeCodePostal: true,
  _count: {
    select: {
      accompagnements: true,
    },
  },
} satisfies Prisma.BeneficiaireSelect

export const activiteListSelect = {
  id: true,
  type: true,
  mediateurId: true,
  accompagnements: {
    select: {
      beneficiaire: {
        select: {
          ...activiteListeBeneficiaireSelect,
        },
      },
      premierAccompagnement: true,
    },
  },
  date: true,

  duree: true,
  notes: true,

  structure: {
    select: { id: true, commune: true, codePostal: true, nom: true },
  },
  lieuCodePostal: true,
  lieuCommune: true,
  lieuCodeInsee: true,

  creation: true,
  modification: true,

  typeLieu: true,
  autonomie: true,
  structureDeRedirection: true,

  materiel: true,
  thematiques: true,

  orienteVersStructure: true,

  precisionsDemarche: true,

  titreAtelier: true,
  niveau: true,
} satisfies Prisma.ActiviteSelect

export const getAllActivites = async ({
  beneficiaireId,
  mediateurId,
}: {
  beneficiaireId?: string
  mediateurId?: string
}) =>
  prismaClient.activite.findMany({
    where: {
      accompagnements: { some: { beneficiaireId } },
      mediateurId,
      suppression: null,
    },
    select: activiteListSelect,
    orderBy: [
      {
        date: 'desc',
      },
      { creation: 'desc' },
    ],
  })

export const mediateurHasActivites = async ({
  beneficiaireId,
  mediateurId,
}: {
  beneficiaireId?: string
  mediateurId: string
}) =>
  prismaClient.activite
    .count({
      where: {
        mediateurId,
        suppression: null,
        accompagnements: beneficiaireId
          ? {
              some: {
                beneficiaireId,
              },
            }
          : undefined,
      },
      take: 1,
    })
    .then((count) => count > 0)

export type ActiviteForList = Awaited<
  ReturnType<typeof getAllActivites>
>[number]

export type ActivitesByDate = {
  date: string
  activites: ActiviteForList[]
}

export type ActivitesAndRdvsByDate = {
  date: string
  activites: (ActiviteForList | BeneficiaireRdv)[]
}

export const groupActivitesByDate = ({
  activites,
}: {
  activites: ActiviteForList[]
}): ActivitesByDate[] => {
  const byDateRecord = activites.reduce<Record<string, ActiviteForList[]>>(
    (accumulator, activity) => {
      const date = dateAsIsoDay(activity.date)
      if (!accumulator[date]) {
        accumulator[date] = []
      }
      accumulator[date].push(activity)
      return accumulator
    },
    {},
  )

  return Object.entries(byDateRecord).map(([date, groupedActivites]) => ({
    date,
    activites: groupedActivites,
  }))
}

export const groupActivitesAndRdvsByDate = ({
  activites,
  rdvs,
}: {
  activites: ActiviteForList[]
  rdvs: BeneficiaireRdv[]
}): ActivitesAndRdvsByDate[] => {
  const byDateRecord = [...rdvs, ...activites].reduce<
    Record<string, (ActiviteForList | BeneficiaireRdv)[]>
  >((accumulator, activity) => {
    const date = dateAsIsoDay(activity.date)
    if (!accumulator[date]) {
      accumulator[date] = []
    }
    accumulator[date].push(activity)
    return accumulator
  }, {})

  return (
    Object.entries(byDateRecord)
      .map(([date, groupedActivites]) => ({
        date,
        activites: groupedActivites,
      }))
      // sort by date desc
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  )
}
