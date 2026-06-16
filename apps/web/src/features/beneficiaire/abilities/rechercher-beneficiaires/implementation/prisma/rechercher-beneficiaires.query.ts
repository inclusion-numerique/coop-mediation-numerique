import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { CommuneResidence } from '@app/web/features/beneficiaire/domain/commune-residence'
import { Nom } from '@app/web/features/beneficiaire/domain/nom'
import { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import type {
  BeneficiaireSearchItem,
  GetInitialBeneficiairesOptions,
  RechercherBeneficiaires,
} from '../../domain/rechercher-beneficiaires'

const searchSelect = {
  id: true,
  prenom: true,
  nom: true,
  commune: true,
  communeCodePostal: true,
  communeCodeInsee: true,
  adresse: true,
} satisfies Prisma.BeneficiaireSelect

const baseWhere = (mediateurId: string): Prisma.BeneficiaireWhereInput => ({
  suppression: null,
  mediateurId,
  anonyme: false,
})

const toSearchItem = (row: {
  id: string
  prenom: string | null
  nom: string | null
  commune: string | null
  communeCodePostal: string | null
  communeCodeInsee: string | null
  adresse: string | null
}): BeneficiaireSearchItem => ({
  id: BeneficiaireId(row.id),
  prenom: Prenom(row.prenom ?? ''),
  nom: Nom(row.nom ?? ''),
  communeResidence:
    row.commune && row.communeCodePostal && row.communeCodeInsee
      ? CommuneResidence({
          commune: row.commune,
          codePostal: row.communeCodePostal,
          codeInsee: row.communeCodeInsee,
          ...(row.adresse ? { adresse: row.adresse } : {}),
        })
      : null,
})

export const rechercherBeneficiaires: RechercherBeneficiaires = async ({
  mediateurId,
  query,
  excludeIds = [],
}) => {
  const parts = query
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const rows = await prismaClient.beneficiaire.findMany({
    where: {
      ...baseWhere(mediateurId),
      ...(parts.length > 0
        ? {
            AND: parts.map((part) => ({
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
    },
    select: searchSelect,
    orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
    take: 20,
  })

  return rows.map(toSearchItem)
}

export const getInitialBeneficiairesOptions: GetInitialBeneficiairesOptions =
  async ({ mediateurId, includeBeneficiaireIds = [] }) => {
    const where = baseWhere(mediateurId)

    const [topBeneficiaires, included, totalCount] = await Promise.all([
      prismaClient.beneficiaire.findMany({
        where: {
          ...where,
          ...(includeBeneficiaireIds.length > 0
            ? { id: { notIn: [...includeBeneficiaireIds] } }
            : {}),
        },
        select: searchSelect,
        orderBy: [
          { accompagnementsCount: 'desc' },
          { nom: 'asc' },
          { prenom: 'asc' },
        ],
        take: 20,
      }),
      includeBeneficiaireIds.length > 0
        ? prismaClient.beneficiaire.findMany({
            where: { ...where, id: { in: [...includeBeneficiaireIds] } },
            select: searchSelect,
          })
        : Promise.resolve([]),
      prismaClient.beneficiaire.count({ where }),
    ])

    return {
      options: [...included, ...topBeneficiaires].map(toSearchItem),
      totalCount,
    }
  }
