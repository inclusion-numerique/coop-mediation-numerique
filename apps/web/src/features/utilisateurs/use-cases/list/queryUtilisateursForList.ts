import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

export const searchUtilisateurSelect = {
  id: true,
  name: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  inscriptionValidee: true,
  lastLogin: true,
  lastSeen: true,
  profilInscription: true,
  created: true,
  deleted: true,
  isConseillerNumerique: true,
  mediateur: {
    select: {
      id: true,
      derniereCreationActivite: true,
      derniereCreationBeneficiaire: true,
      accompagnementsCount: true,
      beneficiairesCount: true,
      _count: {
        select: {
          enActivite: true,
          beneficiaires: {
            where: { anonyme: false },
          },
          coordinations: true,
        },
      },
    },
  },
  coordinateur: {
    select: {
      id: true,
      derniereCreationActivite: true,
      _count: {
        select: {
          mediateursCoordonnes: {
            where: { suppression: null },
          },
        },
      },
    },
  },
  // Structure employeuse lue depuis `main` (source de vérité, ADR-002 étape 6) : nom via la
  // denomination, code INSEE via la relation adresse. Réexposée en `{ nom, codeInsee }` par le
  // mapper ci-dessous pour laisser les consommateurs (data-table, export, dérivation département)
  // inchangés.
  emplois: {
    where: { suppression: null },
    orderBy: { creation: 'desc' },
    take: 1,
    select: {
      structureMain: {
        select: {
          denominationSirene: true,
          denominationAntenne: true,
          adresse: { select: { codeInsee: true } },
        },
      },
    },
  },
} satisfies Prisma.UserSelect

type UtilisateurForListRow = Prisma.UserGetPayload<{
  select: typeof searchUtilisateurSelect
}>

// Nom employeuse : denomination_antenne sinon denomination_sirene (même règle que le sérialiseur
// sessionUser et getActeurEmploiForDate).
const toEmploiStructure = (
  emploi: UtilisateurForListRow['emplois'][number],
): { structure: { nom: string | null; codeInsee: string | null } } => ({
  structure: {
    nom:
      emploi.structureMain?.denominationAntenne ??
      emploi.structureMain?.denominationSirene ??
      null,
    codeInsee: emploi.structureMain?.adresse?.codeInsee ?? null,
  },
})

export const queryUtilisateursForList = async ({
  skip,
  take,
  where,
  orderBy,
}: {
  where: Prisma.UserWhereInput
  take?: number
  skip?: number
  orderBy?: Prisma.UserOrderByWithRelationInput[]
}) => {
  const utilisateurs = await prismaClient.user.findMany({
    where,
    take,
    skip,
    select: searchUtilisateurSelect,
    orderBy: [...(orderBy ?? []), { lastName: 'asc' }],
  })

  return utilisateurs.map(({ emplois, ...utilisateur }) => ({
    ...utilisateur,
    emplois: emplois.map(toEmploiStructure),
  }))
}

export type UtilisateurForList = Awaited<
  ReturnType<typeof queryUtilisateursForList>
>[number]
