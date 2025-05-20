import { prismaClient } from '@app/web/prismaClient'
import { monthShortLabels } from '@app/web/utils/monthShortLabels'
import { Prisma } from '@prisma/client'

type BeneficiaireType = 'suivi' | 'anonyme'

type InitialCountBeforePeriod = { type: BeneficiaireType; count: number }

type BeneficiaireData = {
  byBeneficiairesSuivis: number
  byBeneficiairesAnonymes: number
}

type BeneficiairePerMonth = BeneficiaireData & { mois: string }

const fromDate = `DATE_TRUNC('month', CURRENT_DATE - INTERVAL '${11} months')`

const getBeneficiairesPerMonth = async () =>
  await prismaClient.$queryRaw<
    {
      bybeneficiairessuivis: number
      bybeneficiairesanonymes: number
      month: number
    }[]
  >`
  WITH filtered_beneficiaires AS (SELECT ben.creation,
    CASE
      WHEN ben.anonyme IS TRUE THEN 'anonyme'
      ELSE 'suivi'
      END AS type
  FROM beneficiaires ben
  WHERE ben.suppression IS NULL AND ben.creation >= ${Prisma.raw(
    fromDate,
  )}),months AS (SELECT generate_series(${Prisma.raw(fromDate)}, ${Prisma.raw(
    'CURRENT_DATE',
  )}, '1 month'::interval) AS month), counts_per_month AS (
    SELECT DATE_TRUNC('month', creation) AS month, type, COUNT(*)::int AS count
    FROM filtered_beneficiaires
    GROUP BY DATE_TRUNC('month', creation), type)
      SELECT
        EXTRACT(MONTH FROM months.month)::int AS month,
        COALESCE(SUM(CASE WHEN cpm.type = 'suivi' THEN cpm.count END), 0)::int  AS byBeneficiairesSuivis,
        COALESCE(SUM(CASE WHEN cpm.type = 'anonyme' THEN cpm.count END), 0)::int AS byBeneficiairesAnonymes
      FROM months
        LEFT JOIN counts_per_month cpm ON cpm.month = months.month
      GROUP BY months.month
      ORDER BY months.month
  `.then((result) =>
    result.map(({ bybeneficiairessuivis, bybeneficiairesanonymes, month }) => ({
      byBeneficiairesSuivis: bybeneficiairessuivis,
      byBeneficiairesAnonymes: bybeneficiairesanonymes,
      mois: monthShortLabels[month - 1],
    })),
  )

const getInitialCountBeforePeriod = async () =>
  await prismaClient.$queryRaw<InitialCountBeforePeriod[]>`
      SELECT
          CASE
              WHEN ben.anonyme IS TRUE THEN 'anonyme'
              ELSE 'suivi'
              END AS type,
          COUNT(*)::int AS count
      FROM beneficiaires ben
      WHERE ben.suppression IS NULL
        AND ben.creation < ${Prisma.raw(fromDate)}
      GROUP BY
          CASE
              WHEN ben.anonyme IS TRUE THEN 'anonyme'
              ELSE 'suivi'
              END`

const toInitialRunningTotalPerMonth = (
  { byBeneficiairesSuivis, byBeneficiairesAnonymes }: BeneficiaireData,
  { type, count }: InitialCountBeforePeriod,
) => ({
  byBeneficiairesSuivis: byBeneficiairesSuivis + (type === 'suivi' ? count : 0),
  byBeneficiairesAnonymes:
    byBeneficiairesAnonymes + (type === 'anonyme' ? count : 0),
})

const initialRunningTotalPerMonth = async () => [
  {
    mois: 'Avant période',
    ...(await getInitialCountBeforePeriod()).reduce(
      toInitialRunningTotalPerMonth,
      { byBeneficiairesSuivis: 0, byBeneficiairesAnonymes: 0 },
    ),
  },
]

const toRunningTotalPerMonth = (
  beneficiairesPerMonth: BeneficiairePerMonth[],
  {
    mois,
    byBeneficiairesSuivis,
    byBeneficiairesAnonymes,
  }: BeneficiairePerMonth,
  index: number,
) => [
  ...beneficiairesPerMonth,
  {
    mois,
    byBeneficiairesSuivis:
      beneficiairesPerMonth[index].byBeneficiairesSuivis +
      byBeneficiairesSuivis,
    byBeneficiairesAnonymes:
      beneficiairesPerMonth[index].byBeneficiairesAnonymes +
      byBeneficiairesAnonymes,
  },
]

export const getBeneficiairesData = async () => {
  const perMonth = await getBeneficiairesPerMonth()

  return {
    perMonth,
    runningTotalPerMonth: perMonth.reduce(
      toRunningTotalPerMonth,
      await initialRunningTotalPerMonth(),
    ),
  }
}
