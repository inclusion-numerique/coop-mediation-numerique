import { prismaClient } from '@/configuration/prisma'
import { Prisma } from '@/generated/prisma/client'
import { departementsDesCodesInsee } from '@/libraries/departement'
import type { SelectOption } from '@/libraries/ui'

export const communesDuMediateur = async ({
  mediateurIds,
}: {
  mediateurIds: string[]
}) => {
  if (mediateurIds.length === 0) {
    return { communesOptions: [], departementsOptions: [] }
  }

  const communes = await prismaClient.$queryRaw<
    {
      code: string
      commune: string
      code_postal: string
    }[]
  >`
      WITH calculated_insee AS (
          SELECT
              COALESCE(str.code_insee, act.lieu_code_insee) AS code_insee,
              COALESCE(str.commune, act.lieu_commune) AS commune,
              COALESCE(str.code_postal, act.lieu_code_postal) AS code_postal
          FROM activites act
                   LEFT JOIN lieu_inclusion str ON str.id = act.structure_id
          WHERE act.mediateur_id = ANY(ARRAY[${Prisma.join(mediateurIds.map((id) => `${id}`))}]::UUID[])
      )
      SELECT
          code_insee AS code,
          MIN(commune) AS commune,
          MIN(code_postal) AS code_postal
      FROM calculated_insee
      WHERE code_insee IS NOT NULL
      GROUP BY code_insee
      ORDER BY commune ASC;
  `

  const communesOptions = communes.map(
    ({ code, code_postal, commune }) =>
      ({
        value: code,
        label: `${commune} · ${code_postal}`,
      }) satisfies SelectOption,
  )

  const departementsOptions: SelectOption[] = departementsDesCodesInsee(
    communes.map(({ code }) => code),
  ).map(({ code, nom }) => ({
    value: code,
    label: `${code} · ${nom}`,
  }))

  return { communesOptions, departementsOptions }
}
