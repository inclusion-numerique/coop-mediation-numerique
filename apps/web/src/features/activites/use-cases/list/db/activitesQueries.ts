import { prismaClient } from '@app/web/prismaClient'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import type { Prisma } from '@prisma/client'
import { SearchActiviteAndRdvResultItem } from './searchActiviteAndRdvs'

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
  communeCodeInsee: true,
  accompagnementsCount: true,
} satisfies Prisma.BeneficiaireSelect

export const activiteListSelect = {
  id: true,
  type: true,
  mediateurId: true,
  rdvServicePublicId: true,
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
  mediateur: {
    select: {
      id: true,
      conseillerNumerique: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  rdv: {
    select: {
      id: true,
    },
  },
  date: true,

  duree: true,
  notes: true,

  structure: {
    select: {
      id: true,
      adresse: true,
      commune: true,
      codePostal: true,
      codeInsee: true,
      nom: true,
    },
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
  v1CraId: true,
  tags: {
    select: {
      tag: {
        select: {
          nom: true,
        },
      },
    },
  },
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

export type ActiviteListItem = Awaited<
  ReturnType<typeof getAllActivites>
>[number] & {
  timezone: string
}

export type ActivitesByDate = {
  date: string
  activites: ActiviteListItem[]
}

export type ActivitesAndRdvsByDate = {
  date: string
  items: SearchActiviteAndRdvResultItem[]
}

export const groupActivitesByDate = ({
  activites,
}: {
  activites: ActiviteListItem[]
}): ActivitesByDate[] => {
  const byDateRecord = activites.reduce<Record<string, ActiviteListItem[]>>(
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
