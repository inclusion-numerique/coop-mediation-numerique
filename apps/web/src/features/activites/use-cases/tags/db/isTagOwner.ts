import { SessionUser } from '@app/web/auth/sessionUser'
import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { getUserDepartement } from '@app/web/features/utilisateurs/utils/getUserDepartement'
import { prismaClient } from '@app/web/prismaClient'

type TagOwnershipCondition = object

const ownedByMediateur = (mediateurId: string): TagOwnershipCondition => ({
  mediateurId,
})

const ownedByEquipe = (
  coordinateurIds: string[],
): TagOwnershipCondition | null =>
  coordinateurIds.length > 0
    ? { equipe: true, coordinateurId: { in: coordinateurIds } }
    : null

const ownedByCoordinateur = (
  coordinateurId: string,
): TagOwnershipCondition => ({
  coordinateurId,
})

const ownedByDepartement = (
  departementCode: string | undefined,
): TagOwnershipCondition | null =>
  departementCode != null ? { departement: departementCode } : null

const getMediateurConditions = (
  sessionUser: SessionUser,
): TagOwnershipCondition[] => {
  if (!isMediateur(sessionUser)) return []

  const equipeCoordinateurIds = sessionUser.mediateur.coordinations.map(
    (c) => c.coordinateur.id,
  )

  return [
    ownedByMediateur(sessionUser.mediateur.id),
    ownedByEquipe(equipeCoordinateurIds),
  ].filter((condition) => condition != null)
}

const getCoordinateurConditions = (
  sessionUser: SessionUser,
): TagOwnershipCondition[] => {
  if (!isCoordinateur(sessionUser)) return []

  const departement = getUserDepartement(sessionUser)

  return [
    ownedByCoordinateur(sessionUser.coordinateur.id),
    ownedByDepartement(departement?.code),
  ].filter((condition) => condition != null)
}

export const isTagOwner =
  (sessionUser: SessionUser) =>
  async (tagId: string): Promise<boolean> => {
    const conditions = [
      ...getMediateurConditions(sessionUser),
      ...getCoordinateurConditions(sessionUser),
    ]

    if (conditions.length === 0) return false

    const tag = await prismaClient.tag.findFirst({
      where: { id: tagId, OR: conditions },
    })

    return tag != null
  }
