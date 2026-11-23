import { z } from 'zod'
import type { Prisma } from '@/generated/prisma/client'
import {
  type CritereStatut,
  critereDuStatut,
  type FiltresUtilisateurs,
  type Intervalle,
  type RoleFiltre,
  rolesFiltres,
} from '../domain'
import { enPosteWhere } from './conseiller-numerique-en-poste'

const coordinateurQuiCoordonne = {
  OR: [
    { derniereCreationActivite: { not: null } },
    { mediateursCoordonnes: { some: { suppression: null } } },
  ],
} satisfies Prisma.CoordinateurWhereInput

const activiteOu = (
  date: Prisma.DateTimeNullableFilter,
): Prisma.UserWhereInput => {
  const renseignee = { ...date, not: null }
  return {
    OR: [
      { mediateur: { is: { derniereCreationActivite: renseignee } } },
      { mediateur: { is: { derniereCreationBeneficiaire: renseignee } } },
      {
        lastSeen: renseignee,
        coordinateur: { is: coordinateurQuiCoordonne },
      },
    ],
  }
}

const aUneActivite = activiteOu({ not: null })

const activiteApres = (date: Date) => activiteOu({ gt: date })

const entre = ({ apres, auPlusTard }: Intervalle) => ({
  ...(apres === null ? {} : { gt: apres }),
  ...(auPlusTard === null ? {} : { lte: auPlusTard }),
})

const vivant = {
  deleted: null,
  role: 'User',
} satisfies Prisma.UserWhereInput

const statutWhere = (critere: CritereStatut): Prisma.UserWhereInput => {
  if (critere._tag === 'Supprime') return { deleted: { not: null } }
  if (critere._tag === 'InscriptionEnCours')
    return {
      ...vivant,
      inscriptionValidee: null,
      created: entre(critere.creation),
    }
  if (critere._tag === 'Nouveau')
    return {
      ...vivant,
      inscriptionValidee: { not: null, ...entre(critere.inscription) },
      NOT: aUneActivite,
    }
  if (critere._tag === 'Actif')
    return {
      ...vivant,
      inscriptionValidee: { not: null },
      AND: [activiteApres(critere.activiteApres)],
    }
  return {
    ...vivant,
    inscriptionValidee: { not: null },
    AND: [
      critere.activite.apres === null
        ? aUneActivite
        : activiteApres(critere.activite.apres),
      ...(critere.activite.auPlusTard === null
        ? []
        : [{ NOT: activiteApres(critere.activite.auPlusTard) }]),
    ],
  }
}

const whereParRole: Record<
  (typeof rolesFiltres)[number],
  Prisma.UserWhereInput
> = {
  mediateur: { role: 'User', mediateur: { isNot: null } },
  coordinateur: { role: 'User', coordinateur: { isNot: null } },
  administrateur: { role: 'Admin' },
}

const whereDuRole = (role: (typeof rolesFiltres)[number]) => whereParRole[role]

const rolesWhere = (roles: readonly RoleFiltre[]): Prisma.UserWhereInput[] =>
  roles.length === 0 ? [] : [{ OR: roles.map(whereDuRole) }]

const dispositifWhere = ({
  dispositif,
  roles,
}: FiltresUtilisateurs): Prisma.UserWhereInput[] => {
  if (dispositif === null) return []
  if (dispositif === 'ConseillerNumerique') return [enPosteWhere(true)]
  return [
    enPosteWhere(false),
    ...(roles.length === 0
      ? [
          {
            OR: [
              { mediateur: { isNot: null } },
              { coordinateur: { isNot: null } },
            ],
          },
        ]
      : []),
  ]
}

const avecLesAnciens = ({ rattachements }: FiltresUtilisateurs): boolean =>
  rattachements === 'ActuelsEtAnciens'

const activiteVivante = (
  critere: Prisma.ActiviteWhereInput,
): Prisma.UserWhereInput => ({
  mediateur: { is: { activites: { some: { ...critere, suppression: null } } } },
})

const lieuxWhere = (filtres: FiltresUtilisateurs): Prisma.UserWhereInput[] => {
  if (filtres.lieux.length === 0) return []

  const lieux = [...filtres.lieux]
  const rattache: Prisma.UserWhereInput = {
    mediateur: {
      is: {
        enActivite: {
          some: { structureId: { in: lieux }, suppression: null, fin: null },
        },
      },
    },
  }

  return [
    avecLesAnciens(filtres)
      ? { OR: [rattache, activiteVivante({ structureId: { in: lieux } })] }
      : rattache,
  ]
}

const coordinateursWhere = (
  filtres: FiltresUtilisateurs,
): Prisma.UserWhereInput[] =>
  filtres.coordinateurs.length === 0
    ? []
    : [
        {
          mediateur: {
            is: {
              coordinations: {
                some: {
                  coordinateurId: { in: [...filtres.coordinateurs] },
                  ...(avecLesAnciens(filtres) ? {} : { suppression: null }),
                },
              },
            },
          },
        },
      ]

const adresseDeLEmployeuse = ({
  communes,
  departements,
}: FiltresUtilisateurs): Prisma.EmployeuseActuelleWhereInput[] => [
  ...(communes.length === 0 ? [] : [{ codeInsee: { in: [...communes] } }]),
  ...(departements.length === 0
    ? []
    : [
        {
          OR: departements.map((departement) => ({
            codeInsee: { startsWith: departement },
          })),
        },
      ]),
]

const employeuseActuelleOu = (
  critere: Prisma.EmployeuseActuelleWhereInput,
): Prisma.UserWhereInput => ({
  personneMain: { is: { employeuseActuelle: { is: critere } } },
})

const anciennesEmployeuses = (
  employeuses: Prisma.IntFilter,
): Prisma.UserWhereInput[] => [
  {
    personneMain: {
      is: {
        affectationsEmploi: {
          some: { structureAdministrativeId: employeuses },
        },
      },
    },
  },
  activiteVivante({ structureEmployeuseMainId: employeuses }),
]

const parEmployeuse = (
  filtres: FiltresUtilisateurs,
): Prisma.UserWhereInput[] => {
  if (filtres.employeuses.length === 0) return []

  const employeuses = { in: [...filtres.employeuses] }
  const actuelle = employeuseActuelleOu({
    structureAdministrativeId: employeuses,
  })

  return [
    avecLesAnciens(filtres)
      ? { OR: [actuelle, ...anciennesEmployeuses(employeuses)] }
      : actuelle,
  ]
}

const parAdresseDeLEmployeuse = (
  filtres: FiltresUtilisateurs,
): Prisma.UserWhereInput[] => {
  const adresse = adresseDeLEmployeuse(filtres)
  return adresse.length === 0 ? [] : [employeuseActuelleOu({ AND: adresse })]
}

const employeuseWhere = (
  filtres: FiltresUtilisateurs,
): Prisma.UserWhereInput[] => [
  ...parEmployeuse(filtres),
  ...parAdresseDeLEmployeuse(filtres),
]

const estUnIdentifiant = (mot: string): boolean =>
  z.guid().safeParse(mot).success

const rechercheWhere = (mots: readonly string[]): Prisma.UserWhereInput[] =>
  mots.map((mot) => ({
    OR: [
      { firstName: { contains: mot, mode: 'insensitive' } },
      { lastName: { contains: mot, mode: 'insensitive' } },
      { email: { contains: mot, mode: 'insensitive' } },
      ...(estUnIdentifiant(mot) ? [{ id: mot }] : []),
    ],
  }))

export const utilisateursWhere = ({
  mots,
  filtres,
  maintenant,
}: {
  readonly mots: readonly string[]
  readonly filtres: FiltresUtilisateurs
  readonly maintenant: Date
}): Prisma.UserWhereInput => ({
  AND: [
    ...rechercheWhere(mots),
    ...rolesWhere(filtres.roles),
    ...dispositifWhere(filtres),
    ...(filtres.statut === null
      ? []
      : [statutWhere(critereDuStatut(filtres.statut, maintenant))]),
    ...lieuxWhere(filtres),
    ...employeuseWhere(filtres),
    ...coordinateursWhere(filtres),
  ],
})
