import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { prismaClient } from '@app/web/prismaClient'
import { getDepartementsFromCodesInsee } from '@app/web/utils/getDepartementFromCodeInsee'

export const getCommunesAndDepartementsOptions = async () => {
  const communes = await prismaClient.$queryRaw<
    {
      code: string
      commune: string
      code_postal: string
    }[]
  >`
      SELECT
          COALESCE(str.code_insee, act.lieu_code_insee) AS code,
          MIN(COALESCE(str.commune, act.lieu_commune)) AS commune,
          MIN(COALESCE(str.code_postal, act.lieu_code_postal)) AS code_postal
      FROM activites act
      LEFT JOIN lieu_inclusion str ON str.id = act.structure_id
      WHERE COALESCE(str.code_insee, act.lieu_code_insee) IS NOT NULL
      GROUP BY COALESCE(str.code_insee, act.lieu_code_insee)
      ORDER BY commune ASC
  `

  const communesOptions = communes.map(
    ({ code, code_postal, commune }) =>
      ({
        value: code,
        label: `${commune} · ${code_postal}`,
      }) satisfies SelectOption,
  )

  const departementsOptions: SelectOption[] = getDepartementsFromCodesInsee(
    communes.map(({ code }) => code),
  )
    .map(({ code, nom }) => ({
      value: code,
      label: `${code} · ${nom}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  return { communesOptions, departementsOptions }
}
