import {
  personneEmployeuseSelect,
  personneToEmployeuseActuelle,
} from '@app/web/features/employeuse/server'
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
  // Structure employeuse lue depuis `main` via `personne -> affectations` (ADR-002 périmètre élargi
  // 2026-07-23) : employeuse COURANTE (priorité idposte>coop), réexposée en `emplois: [{ structure:
  // { nom, codeInsee } }]` par le mapper ci-dessous pour laisser les consommateurs (data-table,
  // export, dérivation département) inchangés.
  personneMain: { select: personneEmployeuseSelect },
} satisfies Prisma.UserSelect

type UtilisateurForListRow = Prisma.UserGetPayload<{
  select: typeof searchUtilisateurSelect
}>

// Réexpose l'employeuse courante sous la forme historique `emplois[].structure` (tableau à 0 ou 1
// élément) attendue par les consommateurs de la liste.
const toEmplois = (
  personneMain: UtilisateurForListRow['personneMain'],
): { structure: { nom: string | null; codeInsee: string | null } }[] => {
  const employeuse = personneToEmployeuseActuelle(personneMain)
  return employeuse
    ? [
        {
          structure: {
            nom: employeuse.employeuse.denomination,
            codeInsee: employeuse.employeuse.adresse?.codeInsee ?? null,
          },
        },
      ]
    : []
}

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

  return utilisateurs.map(({ personneMain, ...utilisateur }) => ({
    ...utilisateur,
    emplois: toEmplois(personneMain),
  }))
}

export type UtilisateurForList = Awaited<
  ReturnType<typeof queryUtilisateursForList>
>[number]
