import type { Prisma } from '@/generated/prisma/client'
import {
  type CritereStatut,
  critereDuStatut,
  type FiltresUtilisateurs,
  type Intervalle,
  type RoleFiltre,
  rolesFiltres,
  UtilisateurId,
} from '../../domain'
import { enPosteWhere } from './conseiller-numerique-en-poste.where'
import type { UtilisateursRattaches } from './utilisateurs-rattaches.query'

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

const parmi = (ids: readonly string[]): Prisma.UserWhereInput => ({
  id: { in: [...ids] },
})

const lieuxWhere = (
  { lieux }: FiltresUtilisateurs,
  rattaches: readonly string[] | null,
): Prisma.UserWhereInput[] => {
  if (lieux.length === 0) return []
  if (rattaches !== null) return [parmi(rattaches)]

  return [
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

const parEmployeuse = (
  { employeuses }: FiltresUtilisateurs,
  rattaches: readonly string[] | null,
): Prisma.UserWhereInput[] => {
  if (employeuses.length === 0) return []
  if (rattaches !== null) return [parmi(rattaches)]

  return [
    employeuseActuelleOu({
      structureAdministrativeId: { in: [...employeuses] },
    }),
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
  rattaches: readonly string[] | null,
): Prisma.UserWhereInput[] => [
  ...parEmployeuse(filtres, rattaches),
  ...parAdresseDeLEmployeuse(filtres),
]

const estUnIdentifiant = (mot: string): boolean =>
  UtilisateurId.safe(mot) !== null

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
  rattaches,
}: {
  readonly mots: readonly string[]
  readonly filtres: FiltresUtilisateurs
  readonly maintenant: Date
  readonly rattaches: UtilisateursRattaches
}): Prisma.UserWhereInput => ({
  AND: [
    ...rechercheWhere(mots),
    ...rolesWhere(filtres.roles),
    ...dispositifWhere(filtres),
    ...(filtres.statut === null
      ? []
      : [statutWhere(critereDuStatut(filtres.statut, maintenant))]),
    ...lieuxWhere(filtres, rattaches.lieux),
    ...employeuseWhere(filtres, rattaches.employeuses),
    ...coordinateursWhere(filtres),
  ],
})
