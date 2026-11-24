import { prismaClient } from '@/configuration/prisma/prisma-client'
import { Prisma } from '@/generated/prisma/client'
import { cumulsSuccessifs } from '@/libraries/collections/cumuls-successifs'
import { libelleCourtDuMois } from '@/libraries/date/month-short-labels'

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
  WHERE ben.suppression IS NULL AND ben.v1_imported IS NULL AND ben.creation >= ${Prisma.raw(
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
      mois: libelleCourtDuMois(month),
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
      WHERE ben.suppression IS NULL AND ben.v1_imported IS NULL
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

const initialRunningTotalPerMonth =
  async (): Promise<BeneficiairePerMonth> => ({
    mois: 'Avant période',
    ...(await getInitialCountBeforePeriod()).reduce(
      toInitialRunningTotalPerMonth,
      { byBeneficiairesSuivis: 0, byBeneficiairesAnonymes: 0 },
    ),
  })

const toRunningTotalPerMonth = (
  cumul: BeneficiairePerMonth,
  {
    mois,
    byBeneficiairesSuivis,
    byBeneficiairesAnonymes,
  }: BeneficiairePerMonth,
): BeneficiairePerMonth => ({
  mois,
  byBeneficiairesSuivis: cumul.byBeneficiairesSuivis + byBeneficiairesSuivis,
  byBeneficiairesAnonymes:
    cumul.byBeneficiairesAnonymes + byBeneficiairesAnonymes,
})

export const donneesDesBeneficiaires = async () => {
  const perMonth = await getBeneficiairesPerMonth()

  return {
    perMonth,
    runningTotalPerMonth: cumulsSuccessifs(
      await initialRunningTotalPerMonth(),
      perMonth,
      toRunningTotalPerMonth,
    ),
  }
}
