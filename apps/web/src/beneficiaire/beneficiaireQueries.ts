import { thematiqueLabels } from '@app/web/features/activites/use-cases/cra/fields/thematique'
import { prismaClient } from '@app/web/prismaClient'
import { Prisma, Thematique } from '@prisma/client'
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
  thematique: Thematique
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
  labelMap: { [key in Thematique]: string },
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

  const thematiquesCounts = await prismaClient.$queryRaw<
    { thematique: string; count: bigint }[]
  >`
      SELECT unnest(a.thematiques) AS thematique, count(*) AS count
      ${activitesFragment}
      GROUP BY thematique
      ORDER BY thematique ASC
    `

  // Merge the results and sort by label
  return addLabelToThematiques(thematiquesCounts, thematiqueLabels).sort(
    (a, b) => a.label.localeCompare(b.label),
  )
}
