import { AnneeNaissance } from '@app/web/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { CommuneResidence } from '@app/web/features/beneficiaire/domain/commune-residence'
import { Email } from '@app/web/features/beneficiaire/domain/email'
import { Genre } from '@app/web/features/beneficiaire/domain/genre'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@app/web/features/beneficiaire/domain/nom'
import { Notes } from '@app/web/features/beneficiaire/domain/notes'
import { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import { StatutSocial } from '@app/web/features/beneficiaire/domain/statut-social'
import { Telephone } from '@app/web/features/beneficiaire/domain/telephone'
import { TrancheAge } from '@app/web/features/beneficiaire/domain/tranche-age'
import { prismaClient } from '@app/web/prismaClient'
import {
  DEFAULT_PAGE,
  PageSize,
  type Search,
  type Sort,
  type SortDirection,
} from '@arckit/resultset'
import type {
  Prisma,
  Genre as PrismaGenre,
  StatutSocial as PrismaStatutSocial,
  TrancheAge as PrismaTrancheAge,
} from '@prisma/client'
import type {
  BeneficiaireListItem,
  BeneficiaireSortField,
  ListerBeneficiaires,
} from '../../domain/lister-beneficiaires'

const DEFAULT_PAGE_SIZE = PageSize(20)

const orderByFor: Record<
  BeneficiaireSortField,
  (direction: SortDirection) => Prisma.BeneficiaireOrderByWithRelationInput
> = {
  nom: (direction) => ({ nom: direction }),
  prenom: (direction) => ({ prenom: direction }),
  anneeNaissance: (direction) => ({ anneeNaissance: direction }),
  accompagnementsCount: (direction) => ({ accompagnementsCount: direction }),
}

const toOrderBy = (
  sort?: Sort<BeneficiaireSortField>,
): Prisma.BeneficiaireOrderByWithRelationInput[] =>
  sort
    ? [orderByFor[sort.field](sort.direction)]
    : [{ nom: 'asc' }, { prenom: 'asc' }]

const beneficiaireSelect = {
  id: true,
  mediateurId: true,
  prenom: true,
  nom: true,
  telephone: true,
  email: true,
  anneeNaissance: true,
  trancheAge: true,
  genre: true,
  statutSocial: true,
  commune: true,
  communeCodePostal: true,
  communeCodeInsee: true,
  adresse: true,
  creation: true,
  accompagnementsCount: true,
  notes: true,
} satisfies Prisma.BeneficiaireSelect

const toSearchParts = (search?: Search): string[] =>
  (search ?? '')
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

const toListItem = (row: {
  id: string
  mediateurId: string
  prenom: string | null
  nom: string | null
  telephone: string | null
  email: string | null
  anneeNaissance: number | null
  trancheAge: PrismaTrancheAge | null
  genre: PrismaGenre | null
  statutSocial: PrismaStatutSocial | null
  commune: string | null
  communeCodePostal: string | null
  communeCodeInsee: string | null
  adresse: string | null
  creation: Date
  accompagnementsCount: number
  notes: string | null
}): BeneficiaireListItem => ({
  id: BeneficiaireId(row.id),
  mediateurId: MediateurId(row.mediateurId),
  prenom: Prenom(row.prenom ?? ''),
  nom: Nom(row.nom ?? ''),
  telephone: row.telephone ? Telephone(row.telephone) : null,
  email: row.email ? Email(row.email) : null,
  anneeNaissance: row.anneeNaissance
    ? AnneeNaissance(row.anneeNaissance)
    : null,
  trancheAge: TrancheAge(row.trancheAge),
  genre: Genre(row.genre),
  statutSocial: StatutSocial(row.statutSocial),
  communeResidence:
    row.commune && row.communeCodePostal && row.communeCodeInsee
      ? CommuneResidence({
          commune: row.commune,
          codePostal: row.communeCodePostal,
          codeInsee: row.communeCodeInsee,
          ...(row.adresse ? { adresse: row.adresse } : {}),
        })
      : null,
  creation: row.creation,
  accompagnementsCount: row.accompagnementsCount,
  notes: row.notes ? Notes(row.notes) : null,
})

export const listerBeneficiaires: ListerBeneficiaires = async ({
  mediateurId,
  search,
  page = DEFAULT_PAGE,
  pageSize = DEFAULT_PAGE_SIZE,
  sort,
  excludeIds = [],
}) => {
  const searchParts = toSearchParts(search)

  const where: Prisma.BeneficiaireWhereInput = {
    suppression: null,
    mediateurId,
    anonyme: false,
    ...(searchParts.length > 0
      ? {
          AND: searchParts.map((part) => ({
            OR: [
              { prenom: { contains: part, mode: 'insensitive' as const } },
              { nom: { contains: part, mode: 'insensitive' as const } },
              { commune: { contains: part, mode: 'insensitive' as const } },
              { email: { contains: part, mode: 'insensitive' as const } },
              {
                communeCodePostal: {
                  contains: part,
                  mode: 'insensitive' as const,
                },
              },
            ],
          })),
        }
      : {}),
    ...(excludeIds.length > 0 ? { id: { notIn: [...excludeIds] } } : {}),
  }

  const skip = (page - 1) * pageSize

  const [rows, matchesCount] = await Promise.all([
    prismaClient.beneficiaire.findMany({
      where,
      take: pageSize,
      skip,
      select: beneficiaireSelect,
      orderBy: toOrderBy(sort),
    }),
    prismaClient.beneficiaire.count({ where }),
  ])

  return {
    items: rows.map(toListItem),
    totalItems: matchesCount,
    currentPage: page,
    pageSize,
  }
}
