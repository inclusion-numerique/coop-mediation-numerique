import { activitesMediateurIdsWhereCondition } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/activitesMediateurIdsWhereCondition'
import { activitesEquipeCoordonneeWhereCondition } from '@app/web/features/activites/use-cases/list/db/activitesEquipeCoordonneeWhereCondition'
import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'

// Option d'employeuse pour les filtres. `id` = int `main.structure_administrative.id` STRINGIFIÉ
// (ADR-002 périmètre élargi) : conservé en `string` pour laisser la cascade UI (comboboxes,
// validation, labels) inchangée ; le filtre SQL le re-caste en int.
export type StructureEmployeuseOption = {
  id: string
  nom: string
  commune: string | null
}

const optionSelect = {
  id: true,
  denominationAntenne: true,
  denominationSirene: true,
  adresse: { select: { nomCommune: true } },
} satisfies Prisma.StructureAdministrativeMainSelect

type OptionPayload = Prisma.StructureAdministrativeMainGetPayload<{
  select: typeof optionSelect
}>

const toOption = (structure: OptionPayload): StructureEmployeuseOption => ({
  id: String(structure.id),
  nom: structure.denominationAntenne ?? structure.denominationSirene ?? '',
  commune: structure.adresse?.nomCommune ?? null,
})

type PerimetreActivites = {
  mediateurIds: string[]
  coordinateurId?: string
}

const employeusesDesActivites = async ({
  mediateurIds,
  coordinateurId,
}: PerimetreActivites): Promise<number[]> => {
  const lignes = await prismaClient.$queryRaw<{ id: number }[]>`
    SELECT DISTINCT act.structure_employeuse_main_id AS id
    FROM activites act
    WHERE ${activitesMediateurIdsWhereCondition(mediateurIds)}
      AND act.suppression IS NULL
      AND act.structure_employeuse_main_id IS NOT NULL
      AND ${activitesEquipeCoordonneeWhereCondition(coordinateurId)}
  `

  return lignes.map(({ id }) => id)
}

export const getStructuresEmployeusesOptions = async (
  perimetre: PerimetreActivites,
): Promise<StructureEmployeuseOption[]> => {
  if (perimetre.mediateurIds.length === 0) return []

  const structures = await prismaClient.structureAdministrativeMain.findMany({
    where: { id: { in: await employeusesDesActivites(perimetre) } },
    select: optionSelect,
    orderBy: { denominationAntenne: 'asc' },
  })

  return structures.map(toOption)
}

export const searchStructuresEmployeuses = async ({
  query,
  excludeIds = [],
  ...perimetre
}: PerimetreActivites & {
  query: string
  excludeIds?: string[]
}): Promise<{ items: StructureEmployeuseOption[] }> => {
  if (perimetre.mediateurIds.length === 0) return { items: [] }

  const searchTerms = query.toLowerCase().trim()
  const excludeMainIds = excludeIds
    .map(Number)
    .filter((value) => Number.isInteger(value))

  const structures = await prismaClient.structureAdministrativeMain.findMany({
    where: {
      AND: [
        { id: { in: await employeusesDesActivites(perimetre) } },
        { id: { notIn: excludeMainIds } },
        searchTerms
          ? {
              OR: [
                {
                  denominationAntenne: {
                    contains: searchTerms,
                    mode: 'insensitive',
                  },
                },
                {
                  denominationSirene: {
                    contains: searchTerms,
                    mode: 'insensitive',
                  },
                },
                {
                  adresse: {
                    nomCommune: { contains: searchTerms, mode: 'insensitive' },
                  },
                },
              ],
            }
          : {},
      ],
    },
    select: optionSelect,
    orderBy: { denominationAntenne: 'asc' },
    take: 20,
  })

  return { items: structures.map(toOption) }
}
