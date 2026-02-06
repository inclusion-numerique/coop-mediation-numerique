import { SessionUser } from '@app/web/auth/sessionUser'
import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { getUserDepartement } from '@app/web/features/utilisateurs/utils/getUserDepartement'
import { Prisma } from '@prisma/client'
import {
  Equipe,
  getEquipeCoordinateurIds,
  getEquipesFromSessionUser,
} from '../../equipe'
import { getTagScope, TagScope } from '../../tagScope'

export type TagRow = {
  id: string
  nom: string
  description: string | null
  mediateurId: string | null
  coordinateurId: string | null
  departement: string | null
  equipe: boolean | null
}

const scopeHierarchy: Record<TagScope, number> = {
  [TagScope.Personnel]: 1,
  [TagScope.Equipe]: 2,
  [TagScope.Departemental]: 3,
  [TagScope.National]: 4,
}

export const canMergeToScope = (
  sourceScope: TagScope,
  destinationScope: TagScope,
): boolean => scopeHierarchy[destinationScope] >= scopeHierarchy[sourceScope]

export const filterByMergeScope =
  (sourceScope: TagScope) =>
  (tag: TagRow): boolean =>
    canMergeToScope(sourceScope, getTagScope(tag))

const visibleByMediateur = (mediateurId: string): Prisma.Sql =>
  Prisma.sql`t.mediateur_id = ${mediateurId}::UUID`

const visibleByCoordinateur = (coordinateurId: string): Prisma.Sql =>
  Prisma.sql`t.coordinateur_id = ${coordinateurId}::UUID`

const visibleByEquipe = (coordinateurIds: string[]): Prisma.Sql | null =>
  coordinateurIds.length > 0
    ? Prisma.sql`(t.equipe = true AND t.coordinateur_id IN (${Prisma.join(coordinateurIds.map((id) => Prisma.sql`${id}::UUID`))}))`
    : null

const visibleByDepartement = (departementCode: string): Prisma.Sql =>
  Prisma.sql`t.departement = ${departementCode}::text`

const visibleByNational = (): Prisma.Sql =>
  Prisma.sql`(t.mediateur_id IS NULL AND t.coordinateur_id IS NULL AND t.departement IS NULL AND t.equipe IS NULL)`

const getMediateurVisibilityConditions = (
  sessionUser: SessionUser,
  equipeCoordinateurIds: string[],
): Prisma.Sql[] => {
  if (!isMediateur(sessionUser)) return []

  return [
    visibleByMediateur(sessionUser.mediateur.id),
    visibleByEquipe(equipeCoordinateurIds),
  ].filter((c): c is Prisma.Sql => c != null)
}

const getCoordinateurVisibilityConditions = (
  sessionUser: SessionUser,
): Prisma.Sql[] => {
  if (!isCoordinateur(sessionUser)) return []

  const departement = getUserDepartement(sessionUser)

  return [
    visibleByCoordinateur(sessionUser.coordinateur.id),
    departement ? visibleByDepartement(departement.code) : null,
  ].filter((c): c is Prisma.Sql => c != null)
}

type VisibilityClauseResult = {
  clause: Prisma.Sql | null
  equipes: Equipe[]
}

export const buildEditableTagsVisibilityClause = (
  sessionUser: SessionUser,
): VisibilityClauseResult => {
  const equipes = getEquipesFromSessionUser(sessionUser)
  const equipeCoordinateurIds = getEquipeCoordinateurIds(equipes)

  const conditions = [
    ...getMediateurVisibilityConditions(sessionUser, equipeCoordinateurIds),
    ...getCoordinateurVisibilityConditions(sessionUser),
  ]

  return conditions.length === 0
    ? { clause: null, equipes }
    : { clause: Prisma.sql`(${Prisma.join(conditions, ' OR ')})`, equipes }
}

export const buildAllVisibleTagsVisibilityClause = (
  sessionUser: SessionUser,
): { clause: Prisma.Sql; equipes: Equipe[] } => {
  const equipes = getEquipesFromSessionUser(sessionUser)
  const equipeCoordinateurIds = getEquipeCoordinateurIds(equipes)
  const departement = getUserDepartement(sessionUser)

  const conditions = [
    ...getMediateurVisibilityConditions(sessionUser, equipeCoordinateurIds),
    ...getCoordinateurVisibilityConditions(sessionUser),
    departement ? visibleByDepartement(departement.code) : null,
    visibleByNational(),
  ].filter((c): c is Prisma.Sql => c != null)

  const clause =
    conditions.length > 0
      ? Prisma.sql`(${Prisma.join(conditions, ' OR ')})`
      : Prisma.sql`FALSE`

  return { clause, equipes }
}
