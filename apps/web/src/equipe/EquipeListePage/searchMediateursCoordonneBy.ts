import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  toNumberOr,
} from '@app/web/libs/data-table/toNumberOr'
import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'

export type FilterParam = 'actifs' | 'inactifs' | 'invitations' | 'archives'
export type RoleFiltre = 'conseiller-numerique' | 'mediateur-numerique'

export type EquipeSearchParams = {
  lignes?: string
  page?: string
  recherche?: string
  tri?: 'membre' | 'structureEmployeuse' | 'statut'
  ordre?: 'asc' | 'desc'
  statut?: string
  role?: RoleFiltre
}

export type MediateurFound = {
  email: string
  phone: string | null
  mediateur_id: string | null
  user_id: string | null
  name: string | null
  first_name: string | null
  last_name: string | null
  conseiller_numerique_id: string | null
  date_derniere_activite: Date | null
  creation: Date
  suppression: Date | null
  deleted: Date | null
  type: 'coordinated' | 'invited'
  structure_employeuse: string | null
  structure_employeuse_adresse: string | null
  structure_employeuse_commune: string | null
  structure_employeuse_code_postal: string | null
  structure_employeuse_code_insee: string | null
}

const statusOrderClause = (direction: string) => `
  CASE
    WHEN type = 'invited' THEN 1
    WHEN deleted IS NOT NULL THEN 5
    WHEN suppression IS NOT NULL THEN 4
    WHEN date_derniere_activite IS NULL OR date_derniere_activite < NOW() - INTERVAL '2 months' THEN 3
    ELSE 2
  END ${direction}`

const nameOrderClause = (direction: string) =>
  `LOWER(COALESCE(name, '')) ${direction}`

const getOrderByClause = (
  tri: EquipeSearchParams['tri'],
  ordre: EquipeSearchParams['ordre'] = 'asc',
): string => {
  const direction = ordre === 'desc' ? 'DESC' : 'ASC'

  switch (tri) {
    case 'membre':
      return `${nameOrderClause(direction)}, ${statusOrderClause('ASC')}`
    case 'structureEmployeuse':
      return `LOWER(COALESCE(structure_employeuse, '')) ${direction}, ${nameOrderClause('ASC')}`
    case 'statut':
      return `${statusOrderClause(direction)}, ${nameOrderClause('ASC')}`
    default:
      return `${statusOrderClause('ASC')}, ${nameOrderClause('ASC')}`
  }
}

const statutFilterConditions: Record<FilterParam, string> = {
  actifs: `(type = 'coordinated' AND deleted IS NULL AND suppression IS NULL AND date_derniere_activite IS NOT NULL AND date_derniere_activite >= NOW() - INTERVAL '2 months')`,
  inactifs: `(type = 'coordinated' AND deleted IS NULL AND suppression IS NULL AND (date_derniere_activite IS NULL OR date_derniere_activite < NOW() - INTERVAL '2 months'))`,
  invitations: `(type = 'invited')`,
  archives: `(deleted IS NOT NULL OR suppression IS NOT NULL)`,
}

const getStatutFilterClause = (statut: string | undefined): string => {
  if (!statut) return 'TRUE'

  const statuts = statut.split(',').filter(Boolean) as FilterParam[]
  if (statuts.length === 0) return 'TRUE'

  const conditions = statuts
    .map((s) => statutFilterConditions[s])
    .filter(Boolean)

  if (conditions.length === 0) return 'TRUE'

  return conditions.join(' OR ')
}

const getRoleFilterClause = (role: RoleFiltre | undefined): string => {
  switch (role) {
    case 'conseiller-numerique':
      return `conseiller_numerique_id IS NOT NULL`
    case 'mediateur-numerique':
      return `conseiller_numerique_id IS NULL`
    default:
      return 'TRUE'
  }
}

const structureEmployeuseSubquery = (
  field: string,
  alias: string,
  userIdSource: string,
) => `
  (SELECT structures.${field}
   FROM "employes_structures" AS employes
   INNER JOIN "structures" AS structures ON structures.id = employes.structure_id
   WHERE employes.user_id = ${userIdSource} AND employes.suppression IS NULL
   ORDER BY employes.creation DESC
   LIMIT 1) AS ${alias}`

const structureEmployeuseColumns = (userIdSource: string) =>
  [
    structureEmployeuseSubquery('nom', 'structure_employeuse', userIdSource),
    structureEmployeuseSubquery(
      'adresse',
      'structure_employeuse_adresse',
      userIdSource,
    ),
    structureEmployeuseSubquery(
      'commune',
      'structure_employeuse_commune',
      userIdSource,
    ),
    structureEmployeuseSubquery(
      'code_postal',
      'structure_employeuse_code_postal',
      userIdSource,
    ),
    structureEmployeuseSubquery(
      'code_insee',
      'structure_employeuse_code_insee',
      userIdSource,
    ),
  ].join(',')

const userInfoColumns = `
  users.id AS user_id,
  users.first_name AS first_name,
  users.last_name AS last_name,
  users.name AS name,
  users.phone AS phone,
  conseillers.id AS conseiller_numerique_id`

const pendingInvitationsQuery = (coordinateurId: string) => `
  SELECT
    invitations.email,
    invitations.mediateur_id AS mediateur_id,
    ${userInfoColumns},
    NULL::timestamp AS suppression,
    NULL::timestamp AS date_derniere_activite,
    NULL::timestamp AS deleted,
    invitations.creation AS creation,
    'invited' AS type,
    ${structureEmployeuseColumns('mediateurs.user_id')}
  FROM "invitations_equipes" AS invitations
    LEFT JOIN "mediateurs" AS mediateurs ON mediateurs.id = invitations.mediateur_id
    LEFT JOIN "users" AS users ON users.id = mediateurs.user_id
    LEFT JOIN "conseillers_numeriques" AS conseillers ON conseillers."mediateur_id" = mediateurs."id"
  WHERE invitations."coordinateur_id" = '${coordinateurId}'::uuid
    AND invitations.acceptee IS NULL
    AND invitations.refusee IS NULL`

const coordinatedMediateursQuery = (coordinateurId: string) => `
  SELECT
    users.email AS email,
    mediateurs.id AS mediateur_id,
    ${userInfoColumns},
    mc.suppression AS suppression,
    mediateurs.derniere_creation_activite AS date_derniere_activite,
    users.deleted AS deleted,
    mediateurs.creation AS creation,
    'coordinated' AS type,
    ${structureEmployeuseColumns('users.id')}
  FROM "mediateurs" AS mediateurs
    LEFT JOIN "users" AS users ON users."id" = mediateurs."user_id"
    LEFT JOIN "conseillers_numeriques" AS conseillers ON conseillers."mediateur_id" = mediateurs."id"
    INNER JOIN "mediateurs_coordonnes" AS mc ON mc."mediateur_id" = mediateurs."id"
  WHERE mc.coordinateur_id = '${coordinateurId}'::uuid`

const buildMembresEquipeCTE = (coordinateurId: string) =>
  Prisma.raw(`
  WITH combined_data AS (
    ${pendingInvitationsQuery(coordinateurId)}
    UNION ALL
    ${coordinatedMediateursQuery(coordinateurId)}
  )
`)

const buildWhereClause = (searchParams: EquipeSearchParams) =>
  Prisma.raw(`
  WHERE (
    ${
      searchParams.recherche == null
        ? 'TRUE'
        : `(
          email ILIKE '%${searchParams.recherche}%'
          OR first_name ILIKE '%${searchParams.recherche}%'
          OR last_name ILIKE '%${searchParams.recherche}%'
        )`
    }
  )
  AND (${getStatutFilterClause(searchParams.statut)})
  AND (${getRoleFilterClause(searchParams.role)})
`)

export const findAllMediateursCoordonneBy =
  ({ id }: { id: string }) =>
  async (searchParams: EquipeSearchParams = {}): Promise<MediateurFound[]> => {
    const cte = buildMembresEquipeCTE(id)
    const whereClause = buildWhereClause(searchParams)
    const orderByClause = Prisma.raw(
      getOrderByClause(searchParams.tri, searchParams.ordre),
    )

    return prismaClient.$queryRaw<MediateurFound[]>`
      ${cte}
      SELECT * FROM combined_data
      ${whereClause}
      ORDER BY ${orderByClause}
    `
  }

export const searchMediateursCoordonneBy =
  ({ id }: { id: string }) =>
  async (searchParams: EquipeSearchParams) => {
    const { take, skip } = takeAndSkipFromPage({
      page: toNumberOr(searchParams?.page)(DEFAULT_PAGE),
      pageSize: toNumberOr(searchParams?.lignes)(DEFAULT_PAGE_SIZE),
    })

    const membresEquipeCTE = buildMembresEquipeCTE(id)
    const whereClause = buildWhereClause(searchParams)
    const orderByClause = Prisma.raw(
      getOrderByClause(searchParams.tri, searchParams.ordre),
    )

    const mediateurs = await prismaClient.$queryRaw<MediateurFound[]>`
      ${membresEquipeCTE}
      SELECT * FROM combined_data
      ${whereClause}
      ORDER BY ${orderByClause}
      LIMIT ${take} OFFSET ${skip}
    `

    const result: [{ count: number }] = await prismaClient.$queryRaw`
      ${membresEquipeCTE}
      SELECT COUNT(*)::int AS count FROM combined_data
      ${whereClause}
    `

    return {
      mediateurs,
      matchesCount: result[0].count,
      totalPages: take ? Math.ceil(result[0].count / take) : 1,
    }
  }
