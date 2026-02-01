import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { departementCodeFromInseeRegex } from '@app/web/features/mon-reseau/departementCodeFromInseeRegex'
import { prismaClient } from '@app/web/prismaClient'

export const getLieuxFiltersOptions = async ({
  departementCode,
}: {
  departementCode: string
}) => {
  // Get communes from structures in the department
  const communes = await prismaClient.$queryRaw<
    {
      code: string
      commune: string
      code_postal: string
    }[]
  >`
    SELECT
      s.code_insee AS code,
      MAX(s.commune) AS commune,
      MAX(s.code_postal) AS code_postal
    FROM structures s
    WHERE s.suppression IS NULL
      AND SUBSTRING(s.code_insee FROM ${departementCodeFromInseeRegex}) = ${departementCode}
      AND s.code_insee IS NOT NULL
      AND s.commune IS NOT NULL
      AND TRIM(s.commune) <> ''
      AND s.code_postal IS NOT NULL
      AND TRIM(s.code_postal) <> ''
    GROUP BY s.code_insee
    ORDER BY commune ASC
  `

  const communesOptions: SelectOption[] = communes.map(
    ({ code, code_postal, commune }) => ({
      value: code,
      label: `${commune} · ${code_postal}`,
    }),
  )

  return {
    communesOptions,
  }
}
