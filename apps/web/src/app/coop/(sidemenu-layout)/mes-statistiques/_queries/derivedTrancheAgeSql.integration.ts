import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'
import { derivedTrancheAgeSql } from './derivedTrancheAgeSql'

const currentYear = new Date().getFullYear()

/**
 * The SQL expression must mirror effectiveTrancheAge / trancheAgeFromAnneeNaissance:
 * derive the tranche from the birth year when usable, otherwise fall back to the
 * stored (snake_case) value, otherwise NULL.
 */
const cases: {
  title: string
  annee: number | null
  stored: string | null
  expected: string | null
}[] = [
  {
    title: 'derives moins_de_douze',
    annee: currentYear - 5,
    stored: null,
    expected: 'moins_de_douze',
  },
  {
    title: 'derives douze_dix_huit',
    annee: currentYear - 14,
    stored: null,
    expected: 'douze_dix_huit',
  },
  {
    title: 'derives dix_huit_vingt_quatre',
    annee: currentYear - 20,
    stored: null,
    expected: 'dix_huit_vingt_quatre',
  },
  {
    title: 'derives vingt_cinq_trente_neuf',
    annee: currentYear - 30,
    stored: null,
    expected: 'vingt_cinq_trente_neuf',
  },
  {
    title: 'derives quarante_cinquante_neuf',
    annee: currentYear - 50,
    stored: null,
    expected: 'quarante_cinquante_neuf',
  },
  {
    title: 'derives soixante_soixante_neuf (the RDVSP bug case)',
    annee: currentYear - 65,
    stored: null,
    expected: 'soixante_soixante_neuf',
  },
  {
    title: 'derives soixante_dix_plus',
    annee: currentYear - 80,
    stored: null,
    expected: 'soixante_dix_plus',
  },
  {
    title: 'birth year wins over an inconsistent stored value',
    annee: currentYear - 65,
    stored: 'quarante_cinquante_neuf',
    expected: 'soixante_soixante_neuf',
  },
  {
    title: 'falls back to stored value without a birth year',
    annee: null,
    stored: 'quarante_cinquante_neuf',
    expected: 'quarante_cinquante_neuf',
  },
  {
    title: 'falls back to stored value for an out-of-range year',
    annee: 1899,
    stored: 'quarante_cinquante_neuf',
    expected: 'quarante_cinquante_neuf',
  },
  {
    title: 'is null when nothing is usable',
    annee: null,
    stored: null,
    expected: null,
  },
]

describe('derivedTrancheAgeSql', () => {
  test('mirrors the TS derivation against a real Postgres', async () => {
    const valuesRows = cases.map(
      (testCase, index) =>
        Prisma.sql`(${index}, ${testCase.annee}::int, ${testCase.stored}::text)`,
    )

    const rows = await prismaClient.$queryRaw<
      { idx: number; result: string | null }[]
    >(
      Prisma.sql`
        SELECT idx, ${Prisma.raw(derivedTrancheAgeSql('v.annee', 'v.stored'))} AS result
        FROM (VALUES ${Prisma.join(valuesRows)}) AS v(idx, annee, stored)
        ORDER BY idx
      `,
    )

    expect(rows.map(({ result }) => result)).toEqual(
      cases.map(({ expected }) => expected),
    )
  })
})
