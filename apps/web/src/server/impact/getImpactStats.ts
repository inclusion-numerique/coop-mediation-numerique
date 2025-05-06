import type { ActivitesFilters } from '@app/web/cra/ActivitesFilters'
import { prismaClient } from '@app/web/prismaClient'

type ActiviteParMois = {
  mois: string // Format "Month YYYY"
  date_mois: Date
  total: number
  avecBeneficiaire: number
  sansBeneficiaire: number
  pourcentageAvecBeneficiaire: number
  pourcentageSansBeneficiaire: number
}

export type ImpactStats = {
  conum: {
    total: number
    actifs: number
    ratio: number
    avecSuiviBeneficiaire: number
  }
  mediateur: {
    total: number
    actifs: number
    ratio: number
    avecSuiviBeneficiaire: number
  }
  coordoConum: {
    total: number
    actifs: number
    ratio: number
  }
  coordoHD: {
    total: number
    actifs: number
    ratio: number
  }
  activitesParMois: ActiviteParMois[]
}

const getActivitesParMois = async ({
  du,
  au,
  departements,
  communes,
  lieux,
}: ActivitesFilters): Promise<ActiviteParMois[]> => {
  const lieuFilters: string[] = [
    ...(departements?.map((dep) => `s.code_insee LIKE '${dep}%'`) ?? []),
    ...(communes?.map((insee) => `s.code_insee = '${insee}'`) ?? []),
    ...(lieux?.map((id) => `s.id = '${id}'`) ?? []),
  ]

  const conditions: (string | undefined)[] = [
    `a.suppression IS NULL`,
    `a.date <= CURRENT_DATE`,
    du && au ? `a.date BETWEEN '${du}' AND '${au}'` : undefined,
    lieuFilters.length > 0 ? `(${lieuFilters.join(' OR ')})` : undefined,
  ].filter(Boolean)

  const rawResult = await prismaClient.$queryRawUnsafe(`
    WITH mois AS (
      SELECT DISTINCT date_trunc('month', date) AS mois
      FROM activites
      WHERE suppression IS NULL
        AND date <= CURRENT_DATE
      ORDER BY mois DESC
      LIMIT 12
    )
    SELECT
      to_char(m.mois, 'Month YYYY') as mois,
      m.mois as date_mois,
      COUNT(DISTINCT a.id)::int as total,
      COUNT(DISTINCT CASE
                         WHEN EXISTS (
                             SELECT 1
                             FROM accompagnements acc
                                      JOIN beneficiaires b ON b.id = acc.beneficiaire_id
                             WHERE acc.activite_id = a.id
                               AND b.anonyme = false
                         ) THEN a.id
          END)::int as "avecBeneficiaire",
      ROUND(
              COUNT(DISTINCT CASE
                                 WHEN EXISTS (
                                     SELECT 1
                                     FROM accompagnements acc
                                              JOIN beneficiaires b ON b.id = acc.beneficiaire_id
                                     WHERE acc.activite_id = a.id
                                       AND b.anonyme = false
                                 ) THEN a.id
                  END)::numeric * 100.0 / NULLIF(COUNT(DISTINCT a.id), 0)
      )::int as "pourcentageAvecBeneficiaire",
      COUNT(DISTINCT CASE
                         WHEN NOT EXISTS (
                             SELECT 1
                             FROM accompagnements acc
                                      JOIN beneficiaires b ON b.id = acc.beneficiaire_id
                             WHERE acc.activite_id = a.id
                               AND b.anonyme = false
                         ) THEN a.id
          END)::int as "sansBeneficiaire",
      ROUND(
              COUNT(DISTINCT CASE
                                 WHEN NOT EXISTS (
                                     SELECT 1
                                     FROM accompagnements acc
                                              JOIN beneficiaires b ON b.id = acc.beneficiaire_id
                                     WHERE acc.activite_id = a.id
                                       AND b.anonyme = false
                                 ) THEN a.id
                  END)::numeric * 100.0 / NULLIF(COUNT(DISTINCT a.id), 0)
      )::int as "pourcentageSansBeneficiaire"
    FROM mois m
    LEFT JOIN activites a ON date_trunc('month', a.date) = m.mois
    LEFT JOIN structures s ON a.structure_id = s.id
    WHERE TRUE
    ${conditions.length > 0 ? `AND ${conditions.join('\nAND ')}` : ''}
    GROUP BY m.mois
    ORDER BY date_mois ASC
  `)

  return rawResult as any[]
}

const getMediateursAvecSuiviBeneficiaire = async (
  activitesFilters: ActivitesFilters,
): Promise<number> => {
  return prismaClient.mediateur.count({
    where: {
      enActivite: matchLieuFrom(activitesFilters),
      AND: [
        // Exclu les conseillers numériques
        { conseillerNumerique: null },
        // Uniquement les médiateurs avec inscription validée
        {
          user: {
            inscriptionValidee: matchPeriodFrom(activitesFilters),
          },
        },
        // Au moins une activité avec un bénéficiaire non anonyme
        {
          activites: {
            some: {
              suppression: null,
              accompagnements: {
                some: {
                  beneficiaire: {
                    anonyme: false,
                  },
                },
              },
            },
          },
        },
      ],
    },
  })
}

const getConseillersNumeriquesAvecSuiviBeneficiaire = async (
  activitesFilters: ActivitesFilters,
): Promise<number> => {
  return prismaClient.mediateur.count({
    where: {
      enActivite: matchLieuFrom(activitesFilters),
      AND: [
        // Uniquement les conseillers numériques
        {
          conseillerNumerique: {
            isNot: null,
          },
        },
        // Uniquement les médiateurs avec inscription validée
        {
          user: {
            inscriptionValidee: matchPeriodFrom(activitesFilters),
          },
        },
        // Au moins une activité avec un bénéficiaire non anonyme
        {
          activites: {
            some: {
              suppression: null,
              accompagnements: {
                some: {
                  beneficiaire: {
                    anonyme: false,
                  },
                },
              },
            },
          },
        },
      ],
    },
  })
}

const matchPeriodFrom = ({ du, au }: ActivitesFilters) =>
  du == null || au == null
    ? { not: null }
    : { gte: new Date(du), lte: new Date(au) }

const matchLieuFrom = ({ departements, communes, lieux }: ActivitesFilters) => {
  return departements == null && communes == null && lieux == null
    ? {}
    : {
        some: {
          structure: {
            OR: [
              ...(departements?.map((code) => ({
                codeInsee: { startsWith: code },
              })) ?? []),
              ...(communes?.map((codeInsee) => ({ codeInsee })) ?? []),
              ...(lieux?.map((id) => ({ id })) ?? []),
            ],
          },
        },
      }
}

export const getImpactStats = async ({
  activitesFilters,
}: {
  activitesFilters: ActivitesFilters
}): Promise<ImpactStats> => {
  const [
    conum,
    conumActifs,
    conumAvecSuiviBeneficiaire,
    mediateur,
    mediateurActifs,
    mediateurAvecSuiviBeneficiaire,
    coordoConum,
    coordoConumActifs,
    coordoHD,
    coordoHDActifs,
    activitesParMois,
  ] = await Promise.all([
    prismaClient.conseillerNumerique.count({
      where: {
        mediateur: {
          enActivite: matchLieuFrom(activitesFilters),
          user: {
            inscriptionValidee: matchPeriodFrom(activitesFilters),
          },
        },
      },
    }),
    prismaClient.conseillerNumerique.count({
      where: {
        mediateur: {
          enActivite: matchLieuFrom(activitesFilters),
          activites: {
            some: {
              date: {
                gte: new Date(new Date().setDate(new Date().getDate() - 30)),
              },
              suppression: null,
            },
          },
          user: {
            inscriptionValidee: matchPeriodFrom(activitesFilters),
          },
        },
      },
    }),
    getConseillersNumeriquesAvecSuiviBeneficiaire(activitesFilters),
    prismaClient.mediateur.count({
      where: {
        enActivite: matchLieuFrom(activitesFilters),
        AND: [
          {
            user: {
              inscriptionValidee: matchPeriodFrom(activitesFilters),
            },
          },
          {
            conseillerNumerique: null,
          },
        ],
      },
    }),
    prismaClient.mediateur.count({
      where: {
        enActivite: matchLieuFrom(activitesFilters),
        AND: [
          {
            user: {
              inscriptionValidee: matchPeriodFrom(activitesFilters),
            },
          },
          {
            conseillerNumerique: null,
          },
          {
            activites: {
              some: {
                date: {
                  gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                },
                suppression: null,
              },
            },
          },
        ],
      },
    }),
    getMediateursAvecSuiviBeneficiaire(activitesFilters),
    prismaClient.coordinateur.count({
      where: {
        conseillerNumeriqueId: {
          not: null,
        },
        user: {
          inscriptionValidee: matchPeriodFrom(activitesFilters),
          emplois: matchLieuFrom(activitesFilters),
        },
      },
    }),
    prismaClient.coordinateur.count({
      where: {
        conseillerNumeriqueId: {
          not: null,
        },
        user: {
          inscriptionValidee: matchPeriodFrom(activitesFilters),
          emplois: matchLieuFrom(activitesFilters),
          lastLogin: {
            gte: new Date(new Date().setDate(new Date().getDate() - 31)),
          },
        },
      },
    }),
    prismaClient.coordinateur.count({
      where: {
        conseillerNumeriqueId: null,
        user: {
          inscriptionValidee: matchPeriodFrom(activitesFilters),
          emplois: matchLieuFrom(activitesFilters),
        },
      },
    }),
    prismaClient.coordinateur.count({
      where: {
        conseillerNumeriqueId: null,
        user: {
          inscriptionValidee: matchPeriodFrom(activitesFilters),
          emplois: matchLieuFrom(activitesFilters),
          lastLogin: {
            gte: new Date(new Date().setDate(new Date().getDate() - 31)),
          },
        },
      },
    }),

    getActivitesParMois(activitesFilters),
  ])

  return {
    conum: {
      total: conum,
      actifs: conumActifs,
      ratio: conum === 0 ? 0 : Math.round((conumActifs * 100) / conum),
      avecSuiviBeneficiaire: conumAvecSuiviBeneficiaire,
    },
    mediateur: {
      total: mediateur,
      actifs: mediateurActifs,
      ratio:
        mediateur === 0 ? 0 : Math.round((mediateurActifs * 100) / mediateur),
      avecSuiviBeneficiaire: mediateurAvecSuiviBeneficiaire,
    },
    coordoConum: {
      total: coordoConum,
      actifs: coordoConumActifs,
      ratio:
        coordoConum === 0
          ? 0
          : Math.round((coordoConumActifs * 100) / coordoConum),
    },
    coordoHD: {
      total: coordoHD,
      actifs: coordoHDActifs,
      ratio: coordoHD === 0 ? 0 : Math.round((coordoHDActifs * 100) / coordoHD),
    },
    activitesParMois,
  }
}
