import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

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

// Employeuses (SA main) des médiateurs donnés, via une affectation active en PUR MAIN
// (`main.personne_affectations_emploi` -> `main.personne` -> `coop.users` -> `mediateur`).
const affectationDesMediateurs = (
  mediateurIds: string[],
): Prisma.StructureAdministrativeMainWhereInput => ({
  affectationsEmploi: {
    some: {
      estActive: true,
      personne: { user: { mediateur: { id: { in: mediateurIds } } } },
    },
  },
})

export const getStructuresEmployeusesOptions = async ({
  mediateurIds,
}: {
  mediateurIds: string[]
}): Promise<StructureEmployeuseOption[]> => {
  if (mediateurIds.length === 0) return []

  const structures = await prismaClient.structureAdministrativeMain.findMany({
    where: affectationDesMediateurs(mediateurIds),
    select: optionSelect,
    orderBy: { denominationAntenne: 'asc' },
  })

  return structures.map(toOption)
}

export const searchStructuresEmployeuses = async ({
  query,
  mediateurIds,
  excludeIds = [],
}: {
  query: string
  mediateurIds: string[]
  excludeIds?: string[]
}): Promise<{ items: StructureEmployeuseOption[] }> => {
  if (mediateurIds.length === 0) return { items: [] }

  const searchTerms = query.toLowerCase().trim()
  const excludeMainIds = excludeIds
    .map(Number)
    .filter((value) => Number.isInteger(value))

  const structures = await prismaClient.structureAdministrativeMain.findMany({
    where: {
      AND: [
        affectationDesMediateurs(mediateurIds),
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
