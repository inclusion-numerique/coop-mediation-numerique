import { prismaClient } from '@/configuration/prisma/prisma-client'
import { Prisma } from '@/generated/prisma/client'
import type { SelectOption } from '@/libraries/ui/components/form/utils/options'

type Commune = {
  readonly code_insee: string
  readonly nom_commune: string
  readonly code_postal: string
}

const optionDeLaCommune = ({
  code_insee,
  nom_commune,
  code_postal,
}: Commune): SelectOption => ({
  value: code_insee,
  label: `${nom_commune} · ${code_postal}`,
})

const communes = async (condition: Prisma.Sql, limite: number) =>
  (
    await prismaClient.$queryRaw<Commune[]>(Prisma.sql`
      SELECT DISTINCT ON (code_insee) code_insee, nom_commune, code_postal
      FROM main.adresse
      WHERE ${condition}
      ORDER BY code_insee, code_postal
      LIMIT ${limite}
    `)
  ).map(optionDeLaCommune)

const normalise = (sql: Prisma.Sql) =>
  Prisma.sql`translate(lower(unaccent(${sql})), '-''', '  ')`

export const rechercherDesCommunesDesEmployeuses = async ({
  recherche,
  limite,
}: {
  readonly recherche: string
  readonly limite: number
}): Promise<readonly SelectOption[]> =>
  (
    await communes(
      Prisma.sql`${normalise(Prisma.sql`nom_commune`)} LIKE '%' || ${normalise(Prisma.sql`${recherche.trim()}`)} || '%'
        OR code_postal LIKE ${`${recherche.trim()}%`}`,
      limite,
    )
  ).toSorted((une, autre) => une.label.localeCompare(autre.label))

export const communesDesEmployeuses = async (
  codesInsee: readonly string[],
): Promise<readonly SelectOption[]> =>
  codesInsee.length === 0
    ? []
    : communes(
        Prisma.sql`code_insee = ANY(${[...codesInsee]}::text[])`,
        codesInsee.length,
      )
