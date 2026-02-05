import type { Prisma } from '@prisma/client'
import { RoleSlug } from '../list/role'
import { StatutSlug } from '../list/statut'
import { actifFilter } from './db/actif-filter'
import { inscriptionFilter } from './db/inscription-filter'
import { nouveauFilter } from './db/nouveau-filter'

const daysAgo = (now: Date, days: number) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

export const filterOnStatut =
  (now: Date) =>
  (queryParams?: {
    statut?: StatutSlug
  }): {} | { statut: Prisma.UserWhereInput } => {
    const daysAgo7 = daysAgo(now, 7)
    const daysAgo30 = daysAgo(now, 30)
    const daysAgo60 = daysAgo(now, 60)
    const daysAgo90 = daysAgo(now, 90)
    const daysAgo180 = daysAgo(now, 180)

    const statutFiltersMap: Map<StatutSlug, Prisma.UserWhereInput> = new Map([
      ['inscription0', inscriptionFilter({ gte: daysAgo7 })],
      ['inscription7', inscriptionFilter({ lt: daysAgo7, gte: daysAgo30 })],
      ['inscription30', inscriptionFilter({ lt: daysAgo30, gte: daysAgo60 })],
      ['inscription60', inscriptionFilter({ lt: daysAgo60, gte: daysAgo90 })],
      ['inscription90', inscriptionFilter({ lt: daysAgo90 })],
      ['nouveau0', nouveauFilter({ gte: daysAgo7 })],
      ['nouveau7', nouveauFilter({ lt: daysAgo7, gte: daysAgo30 })],
      ['nouveau30', nouveauFilter({ lt: daysAgo30, gte: daysAgo60 })],
      ['nouveau60', nouveauFilter({ lt: daysAgo60, gte: daysAgo90 })],
      ['nouveau90', nouveauFilter({ lt: daysAgo90 })],
      ['actif', actifFilter({ gte: daysAgo30 })],
      ['inactif30', actifFilter({ lt: daysAgo30, gte: daysAgo90 })],
      ['inactif90', actifFilter({ lt: daysAgo90, gte: daysAgo180 })],
      ['inactif180', actifFilter({ lt: daysAgo180 })],
      ['deleted', { deleted: { not: null } }],
    ])

    return queryParams?.statut == null
      ? {}
      : (statutFiltersMap.get(queryParams.statut) ?? {})
  }

const roleFilter: Record<
  RoleSlug,
  {
    role: 'User' | 'Admin'
    coordinateur?: { isNot: null } | null
    mediateur?: { isNot: null } | null
  }
> = {
  mediateur: { role: 'User', mediateur: { isNot: null } },
  coordinateur: { role: 'User', coordinateur: { isNot: null } },
  administrateur: { role: 'Admin' },
}

export const filterOnRoles = (queryParams?: {
  roles: RoleSlug[]
}): {} | { role: Prisma.UserWhereInput } => {
  if (queryParams == null || queryParams.roles.length === 0) return {}

  const roleFilters = queryParams.roles.map((role) => roleFilter[role])

  if (roleFilters.length === 1) return roleFilters[0]

  return {
    OR: roleFilters,
  }
}

// Filter for users NOT in conseiller numérique program (by role)
const horsDispositifFilter: Record<
  Exclude<RoleSlug, 'administrateur'>,
  {
    isConseillerNumerique: false
    mediateur?: { isNot: null }
    coordinateur?: { isNot: null }
  }
> = {
  mediateur: { isConseillerNumerique: false, mediateur: { isNot: null } },
  coordinateur: { isConseillerNumerique: false, coordinateur: { isNot: null } },
}

// Filter for users IN conseiller numérique program (by role)
const conseillerNumeriqueFilter: Record<
  Exclude<RoleSlug, 'administrateur'>,
  {
    isConseillerNumerique: true
    mediateur?: { isNot: null }
    coordinateur?: { isNot: null }
  }
> = {
  mediateur: {
    isConseillerNumerique: true,
    mediateur: { isNot: null },
  },
  coordinateur: {
    isConseillerNumerique: true,
    coordinateur: { isNot: null },
  },
}

const onlyUsers = (
  role: RoleSlug,
): role is Exclude<RoleSlug, 'administrateur'> => role !== 'administrateur'

export const filterOnDispositif = (queryParams?: {
  conseiller_numerique?: '0' | '1'
  roles: RoleSlug[]
}): {} | { dispositif: Prisma.UserWhereInput } => {
  if (queryParams?.conseiller_numerique == null) return {}

  const isConseillerNumerique = queryParams.conseiller_numerique === '1'
  const filterMap = isConseillerNumerique
    ? conseillerNumeriqueFilter
    : horsDispositifFilter

  // Get roles that are not 'administrateur'
  const userRoles = queryParams.roles.filter(onlyUsers)

  // If no roles specified, return OR of all role variants (or just CN check for conseiller_numerique=1 with no roles)
  if (userRoles.length === 0) {
    if (isConseillerNumerique) {
      // Special case: conseiller_numerique=1 with no roles -> just check isConseillerNumerique
      return { OR: [{ isConseillerNumerique: true }] }
    }
    // hors dispositif with no roles -> OR of both role variants
    return { OR: Object.values(filterMap) }
  }

  // If single role, return that filter directly (not wrapped in OR)
  if (userRoles.length === 1) {
    return filterMap[userRoles[0]]
  }

  // Multiple roles -> OR of selected role filters
  return { OR: userRoles.map((role) => filterMap[role]) }
}

const canFilterOnLieux = ({
  lieux,
  departements,
  communes,
}: {
  lieux?: string[]
  departements?: string[]
  communes?: string[]
}) =>
  (lieux?.length ?? 0) === 0 &&
  (departements?.length ?? 0) === 0 &&
  (communes?.length ?? 0) === 0

const hasLieuxFilter = ({ lieux }: { lieux?: string[] }) =>
  lieux != null && lieux.length > 0

const hasDepartementsFilter = (queryParams: {
  departements?: string[]
}): queryParams is { departements: string[] } =>
  queryParams.departements != null && queryParams.departements.length > 0

const hasComunesFilter = ({ communes }: { communes?: string[] }) =>
  communes != null && communes.length > 0

export const filterOnLieux = (queryParams?: {
  lieux?: string[]
  departements?: string[]
  communes?: string[]
}) =>
  queryParams == null || canFilterOnLieux(queryParams)
    ? {}
    : {
        emplois: {
          some: {
            suppression: null,
            structure: {
              ...(hasLieuxFilter(queryParams)
                ? { id: { in: queryParams.lieux } }
                : {}),
              ...(hasDepartementsFilter(queryParams)
                ? {
                    OR: queryParams.departements.map((departement) => ({
                      codeInsee: { startsWith: departement },
                    })),
                  }
                : {}),
              ...(hasComunesFilter(queryParams)
                ? { codeInsee: { in: queryParams.communes } }
                : {}),
            },
          },
        },
      }
