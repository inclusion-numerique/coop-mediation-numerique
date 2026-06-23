import { prismaClient } from '@app/web/prismaClient'

/**
 * Corrélation employeuse (structure_administrative) <-> lieu (structures) par
 * SIMILITUDE nom + code INSEE — il n'existe aucun lien FK entre les deux (une
 * employeuse et un lieu sont des lignes indépendantes).
 *
 * Le match est une égalité stricte sur (nom, codeInsee) : la SA a été créée (migration
 * 1a.2, write paths d'inscription, materialisation du lieu) en copiant ces champs depuis
 * la structure, donc l'égalité retrouve l'employeuse correspondante. Suffisant et
 * déterministe ; peut être assoupli (normalisation) si le besoin de fuzzy apparaît.
 */

type CorrelationInput = {
  id: string
  nom: string
  codeInsee: string | null
}

export const structureCorrelationKey = ({
  nom,
  codeInsee,
}: {
  nom: string
  codeInsee: string | null
}) => `${nom}__${codeInsee ?? ''}`

/**
 * Pour un ensemble de structures (lieu), renvoie une Map id -> nombre d'emplois de
 * l'employeuse corrélée. `activeOnly` ne compte que les emplois en cours (fin: null).
 */
export const getEmploisCountByCorrelation = async (
  structures: CorrelationInput[],
  { activeOnly = true }: { activeOnly?: boolean } = {},
): Promise<Map<string, number>> => {
  const uniqueKeys = [
    ...new Map(
      structures.map((structure) => [
        structureCorrelationKey(structure),
        structure,
      ]),
    ).values(),
  ]

  if (uniqueKeys.length === 0) {
    return new Map<string, number>()
  }

  const employeuses = await prismaClient.structureAdministrative.findMany({
    where: {
      OR: uniqueKeys.map(({ nom, codeInsee }) => ({ nom, codeInsee })),
      suppression: null,
    },
    select: {
      nom: true,
      codeInsee: true,
      _count: {
        select: {
          emplois: {
            where: activeOnly
              ? { suppression: null, fin: null }
              : { suppression: null },
          },
        },
      },
    },
  })

  const countByKey = employeuses.reduce((accumulator, employeuse) => {
    const key = structureCorrelationKey(employeuse)
    accumulator.set(
      key,
      (accumulator.get(key) ?? 0) + employeuse._count.emplois,
    )
    return accumulator
  }, new Map<string, number>())

  return new Map(
    structures.map((structure) => [
      structure.id,
      countByKey.get(structureCorrelationKey(structure)) ?? 0,
    ]),
  )
}

/** Variante mono-structure : nombre d'emplois de l'employeuse corrélée. */
export const getEmploisCountForStructure = async (
  structure: CorrelationInput,
  options?: { activeOnly?: boolean },
): Promise<number> => {
  const counts = await getEmploisCountByCorrelation([structure], options)
  return counts.get(structure.id) ?? 0
}

/**
 * Détail des relations employeuses (ids des emplois + des activités employeur) de
 * l'employeuse corrélée à un lieu par nom + code INSEE. Utilisé par la prévisualisation
 * de fusion de structures pour conserver l'affichage sans lien FK.
 */
export const getCorrelatedEmployeuseRelations = async ({
  nom,
  codeInsee,
}: {
  nom: string
  codeInsee: string | null
}): Promise<{ employesIds: string[]; activitesEmployeurIds: string[] }> => {
  const employeuse = await prismaClient.structureAdministrative.findFirst({
    where: { nom, codeInsee, suppression: null },
    select: {
      emplois: { where: { suppression: null }, select: { userId: true } },
      activites: { where: { suppression: null }, select: { id: true } },
    },
  })

  return {
    employesIds: employeuse?.emplois.map(({ userId }) => userId) ?? [],
    activitesEmployeurIds: employeuse?.activites.map(({ id }) => id) ?? [],
  }
}
