import { prismaClient } from '@/configuration/prisma'
import { Prisma } from '@/generated/prisma/client'
import { cumulsSuccessifs } from '@/libraries/collections'
import { libelleCourtDuMois } from '@/libraries/date'
import { computeProportion } from '@/libraries/proportions'

type BeneficiairePerMonth = {
  byBeneficiairesSuivis: number
  byBeneficiairesAnonymes: number
  mois: string
}

const fromDate = `DATE_TRUNC('month', CURRENT_DATE - INTERVAL '11 months')`

type BeneficiairesQueryResult = {
  total_suivis: number
  total_anonymes: number
  monthly_data: {
    month_date: string
    month: number
    bybeneficiairessuivis: number
    bybeneficiairesanonymes: number
  }[]
  initial_suivis: number
  initial_anonymes: number
}

export const lireLesBeneficiaires = async () => {
  const [data] = await prismaClient.$queryRaw<[BeneficiairesQueryResult]>`
    WITH
    beneficiaires_accompagnes AS (
      SELECT
        DATE_TRUNC('month', creation) AS month,
        CASE WHEN anonyme IS TRUE THEN 'anonyme' ELSE 'suivi' END AS type,
        COUNT(*)::int AS count
      FROM beneficiaires
      WHERE v1_imported IS NULL
        AND accompagnements_count > 0
      GROUP BY DATE_TRUNC('month', creation), type
    ),
    totals AS (
      SELECT
        COALESCE(SUM(CASE WHEN type = 'suivi' THEN count END), 0)::int AS total_suivis,
        COALESCE(SUM(CASE WHEN type = 'anonyme' THEN count END), 0)::int AS total_anonymes
      FROM beneficiaires_accompagnes
      WHERE month <= DATE_TRUNC('month', CURRENT_DATE)
    ),
    months AS (
      SELECT generate_series(${Prisma.raw(fromDate)}, CURRENT_DATE, '1 month'::interval) AS month
    ),
    monthly_aggregated AS (
      SELECT
        months.month AS month_date,
        EXTRACT(MONTH FROM months.month)::int AS month,
        COALESCE(SUM(CASE WHEN ba.type = 'suivi' THEN ba.count END), 0)::int AS byBeneficiairesSuivis,
        COALESCE(SUM(CASE WHEN ba.type = 'anonyme' THEN ba.count END), 0)::int AS byBeneficiairesAnonymes
      FROM months
        LEFT JOIN beneficiaires_accompagnes ba ON ba.month = months.month
      GROUP BY months.month
    ),
    initial_counts AS (
      SELECT
        COALESCE(SUM(CASE WHEN type = 'suivi' THEN count END), 0)::int AS initial_suivis,
        COALESCE(SUM(CASE WHEN type = 'anonyme' THEN count END), 0)::int AS initial_anonymes
      FROM beneficiaires_accompagnes
      WHERE month < ${Prisma.raw(fromDate)}
    )
    SELECT
      t.total_suivis,
      t.total_anonymes,
      (SELECT json_agg(row_to_json(m.*) ORDER BY m.month_date) FROM monthly_aggregated m) AS monthly_data,
      ic.initial_suivis,
      ic.initial_anonymes
    FROM totals t, initial_counts ic
  `

  const perMonth: BeneficiairePerMonth[] = (data.monthly_data ?? []).map(
    ({ month, bybeneficiairessuivis, bybeneficiairesanonymes }) => ({
      byBeneficiairesSuivis: bybeneficiairessuivis,
      byBeneficiairesAnonymes: bybeneficiairesanonymes,
      mois: libelleCourtDuMois(month),
    }),
  )

  const runningTotalPerMonth: BeneficiairePerMonth[] = cumulsSuccessifs(
    {
      mois: 'Avant période',
      byBeneficiairesSuivis: data.initial_suivis,
      byBeneficiairesAnonymes: data.initial_anonymes,
    },
    perMonth,
    (previous, month) => ({
      mois: month.mois,
      byBeneficiairesSuivis:
        previous.byBeneficiairesSuivis + month.byBeneficiairesSuivis,
      byBeneficiairesAnonymes:
        previous.byBeneficiairesAnonymes + month.byBeneficiairesAnonymes,
    }),
  )

  const total = data.total_suivis + data.total_anonymes

  return {
    total,
    series: [
      {
        label: 'Bénéficiaires suivis',
        key: 'byBeneficiairesSuivis',
        value: data.total_suivis,
        percentage: computeProportion(data.total_suivis, total),
      },
      {
        label: 'Bénéficiaires anonymes',
        key: 'byBeneficiairesAnonymes',
        value: data.total_anonymes,
        percentage: computeProportion(data.total_anonymes, total),
      },
    ],
    perMonth,
    runningTotalPerMonth,
  }
}
