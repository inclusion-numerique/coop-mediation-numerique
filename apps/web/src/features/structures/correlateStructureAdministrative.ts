import { prismaClient } from '@app/web/prismaClient'

/**
 * Corrélation employeuse (structure_administrative) <-> lieu (structures) par
 * SIMILITUDE nom + adresse + code INSEE — il n'existe aucun lien FK entre les deux
 * (une employeuse et un lieu sont des lignes indépendantes).
 *
 * La clé inclut l'ADRESSE (pas seulement la commune) : deux entités de même nom dans
 * une même commune (ex : deux bureaux « La Poste ») se distinguent par leur adresse.
 * Le match est une égalité stricte (nom, adresse, codeInsee) : la SA a été créée
 * (migration 1a.2, write paths d'inscription, materialisation du lieu) en copiant ces
 * champs depuis la structure, donc l'égalité retrouve l'employeuse correspondante.
 *
 * Limite assumée du modèle sans FK : deux entités STRICTEMENT identiques (même nom,
 * même adresse, même commune) restent indistinguables — le compteur les agrège alors.
 * Assouplissable (normalisation / fuzzy) si le besoin apparaît.
 */

type CorrelationInput = {
  id: string
  nom: string
  adresse: string
  codeInsee: string | null
}

export const structureCorrelationKey = ({
  nom,
  adresse,
  codeInsee,
}: {
  nom: string
  adresse: string
  codeInsee: string | null
}) => `${nom}__${adresse}__${codeInsee ?? ''}`

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
      OR: uniqueKeys.map(({ nom, adresse, codeInsee }) => ({
        nom,
        adresse,
        codeInsee,
      })),
      suppression: null,
    },
    select: {
      nom: true,
      adresse: true,
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
 * l'employeuse corrélée à un lieu par nom + adresse + code INSEE. Utilisé par la
 * prévisualisation de fusion de structures pour conserver l'affichage sans lien FK.
 */
export const getCorrelatedEmployeuseRelations = async ({
  nom,
  adresse,
  codeInsee,
}: {
  nom: string
  adresse: string
  codeInsee: string | null
}): Promise<{ employesIds: string[]; activitesEmployeurIds: string[] }> => {
  const employeuse = await prismaClient.structureAdministrative.findFirst({
    where: { nom, adresse, codeInsee, suppression: null },
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
