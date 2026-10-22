import { conseillerNumeriqueWhere } from '@app/web/features/employeuse/server'
import type { Prisma } from '@app/web/generated/prisma/client'
import { z } from 'zod'
import {
  type CritereStatut,
  critereDuStatut,
  type FiltresUtilisateurs,
  type Intervalle,
  type RoleFiltre,
  rolesFiltres,
} from '../domain'

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
  if (dispositif === 'ConseillerNumerique')
    return [conseillerNumeriqueWhere(true)]
  return [
    conseillerNumeriqueWhere(false),
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

const lieuxWhere = ({ lieux }: FiltresUtilisateurs): Prisma.UserWhereInput[] =>
  lieux.length === 0
    ? []
    : [
        {
          mediateur: {
            is: {
              enActivite: {
                some: {
                  structureId: { in: [...lieux] },
                  suppression: null,
                  fin: null,
                },
              },
            },
          },
        },
      ]

const adresseDeLEmployeuse = ({
  communes,
  departements,
}: FiltresUtilisateurs): Prisma.AdresseMainWhereInput[] => [
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

const employeuseWhere = (
  filtres: FiltresUtilisateurs,
): Prisma.UserWhereInput[] => {
  const adresse = adresseDeLEmployeuse(filtres)

  return filtres.employeuses.length === 0 && adresse.length === 0
    ? []
    : [
        {
          personneMain: {
            is: {
              affectationsEmploi: {
                some: {
                  estActive: true,
                  structureAdministrative: {
                    ...(filtres.employeuses.length === 0
                      ? {}
                      : { id: { in: [...filtres.employeuses] } }),
                    ...(adresse.length === 0
                      ? {}
                      : { adresse: { is: { AND: adresse } } }),
                  },
                },
              },
            },
          },
        },
      ]
}

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
  ],
})
