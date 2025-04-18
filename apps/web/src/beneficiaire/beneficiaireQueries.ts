import {
  thematiqueDemarcheAdministrativeLabels,
  thematiqueLabels,
} from '@app/web/cra/cra'
import { prismaClient } from '@app/web/prismaClient'
import {
  Prisma,
  Thematique,
  ThematiqueDemarcheAdministrative,
} from '@prisma/client'
import { pascalCase } from 'change-case'

export const beneficiaireAccompagnementsCountSelect = {
  _count: {
    select: {
      accompagnements: true,
    },
  },
} satisfies Prisma.BeneficiaireSelect

export type ThematiqueCount = {
  thematique: Thematique
  count: number
  enumValue: string
  label: string
}

export type ThematiqueDemarcheAdministrativeCount = {
  thematique: ThematiqueDemarcheAdministrative
  count: number
  enumValue: string
  label: string
}

export type CraThematiqueCount =
  | ThematiqueCount
  | ThematiqueDemarcheAdministrativeCount

export type CountThematiquesResult = CraThematiqueCount[]

const addLabelToThematiques = (
  counts: { thematique: string; count: bigint }[],
  labelMap:
    | { [key in ThematiqueDemarcheAdministrative]: string }
    | { [key in Thematique]: string },
): CraThematiqueCount[] =>
  counts.map((queryResult) => {
    const thematique = pascalCase(
      queryResult.thematique,
    ) as keyof typeof labelMap

    return {
      thematique,
      enumValue: queryResult.thematique,
      label: labelMap[thematique],
      count: Number(queryResult.count),
    }
  })

export const countThematiques = async ({
  beneficiaireId,
  mediateurId,
}: {
  beneficiaireId: string
  mediateurId: string
}): Promise<CountThematiquesResult> => {
  const activitesFragment = Prisma.raw(`FROM activites a
      INNER JOIN accompagnements acc
      ON a.id = acc.activite_id
        AND acc.beneficiaire_id = '${beneficiaireId}'::UUID
      WHERE a.suppression IS NULL
       AND a.mediateur_id = '${mediateurId}'::UUID
       `)

  const [thematiquesCounts, thematiquesDemarcheCounts] = await Promise.all([
    prismaClient.$queryRaw<{ thematique: string; count: bigint }[]>`
      SELECT unnest(a.thematiques) AS thematique, count(*) AS count
      ${activitesFragment}
      GROUP BY thematique
      ORDER BY thematique ASC
    `,
    prismaClient.$queryRaw<{ thematique: string; count: bigint }[]>`
      SELECT unnest(a.thematiques_demarche) AS thematique, count(*) AS count
      ${activitesFragment}
      GROUP BY thematique
      ORDER BY thematique ASC
    `,
  ])

  // Use the helper function to map both thematiques and thematiques_demarche
  const thematiquesWithLabel = addLabelToThematiques(
    thematiquesCounts,
    thematiqueLabels,
  )

  const thematiquesDemarchesWithLabel = addLabelToThematiques(
    thematiquesDemarcheCounts,
    thematiqueDemarcheAdministrativeLabels,
  )

  // Merge the results and sort by label
  const sortedThematiques = [
    ...thematiquesWithLabel,
    ...thematiquesDemarchesWithLabel,
  ].sort((a, b) => a.label.localeCompare(b.label))

  return sortedThematiques
}
