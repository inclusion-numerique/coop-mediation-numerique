import { prismaClient } from '@/configuration/prisma'
import { Prisma } from '@/generated/prisma/client'
import type { CommuneDesEmployeuses } from '../../domain/commune-des-employeuses'

type Commune = {
  readonly code_insee: string
  readonly nom_commune: string
  readonly code_postal: string
}

const communeDuDomaine = ({
  code_insee,
  nom_commune,
  code_postal,
}: Commune): CommuneDesEmployeuses => ({
  codeInsee: code_insee,
  nom: nom_commune,
  codePostal: code_postal,
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
  ).map(communeDuDomaine)

const normalise = (sql: Prisma.Sql) =>
  Prisma.sql`translate(lower(unaccent(${sql})), '-''', '  ')`

export const rechercherDesCommunesDesEmployeuses = async ({
  recherche,
  limite,
}: {
  readonly recherche: string
  readonly limite: number
}): Promise<readonly CommuneDesEmployeuses[]> =>
  (
    await communes(
      Prisma.sql`${normalise(Prisma.sql`nom_commune`)} LIKE '%' || ${normalise(Prisma.sql`${recherche.trim()}`)} || '%'
        OR code_postal LIKE ${`${recherche.trim()}%`}`,
      limite,
    )
  ).toSorted((une, autre) =>
    `${une.nom} · ${une.codePostal}`.localeCompare(
      `${autre.nom} · ${autre.codePostal}`,
    ),
  )

export const communesDesEmployeuses = async (
  codesInsee: readonly string[],
): Promise<readonly CommuneDesEmployeuses[]> =>
  codesInsee.length === 0
    ? []
    : communes(
        Prisma.sql`code_insee = ANY(${[...codesInsee]}::text[])`,
        codesInsee.length,
      )
