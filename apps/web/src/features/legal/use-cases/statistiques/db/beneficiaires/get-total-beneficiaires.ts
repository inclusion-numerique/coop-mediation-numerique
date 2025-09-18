import { prismaClient } from '@app/web/prismaClient'

export const getTotalBeneficiaires = async () => {
  const totalData = await prismaClient.$queryRaw<
    { type: 'anonyme' | 'suivi'; count: number; percentage: number }[]
  >`
  WITH type_counts AS (
    SELECT
      CASE
        WHEN ben.anonyme IS TRUE THEN 'anonyme'
        ELSE 'suivi'
        END AS type,
      COUNT(*)::int AS count
    FROM beneficiaires ben
    WHERE ben.suppression IS NULL AND ben.v1_imported IS NULL
    GROUP BY
      CASE
        WHEN ben.anonyme IS TRUE THEN 'anonyme'
        ELSE 'suivi'
        END
  ),
  total AS (SELECT SUM(count)::numeric AS total_count FROM type_counts)
    SELECT
      rc.type,
      rc.count,
      ROUND((rc.count * 100.0 / t.total_count)::numeric, 1)::float AS percentage
    FROM type_counts rc, total t
  `

  return totalData.reduce(
    (
      { byBeneficiairesSuivis, byBeneficiairesAnonymes, total },
      { type, count, percentage },
    ) => ({
      byBeneficiairesSuivis: {
        value: byBeneficiairesSuivis.value + (type === 'suivi' ? count : 0),
        percentage:
          byBeneficiairesSuivis.percentage +
          (type === 'suivi' ? percentage : 0),
      },
      byBeneficiairesAnonymes: {
        value: byBeneficiairesAnonymes.value + (type === 'anonyme' ? count : 0),
        percentage:
          byBeneficiairesAnonymes.percentage +
          (type === 'anonyme' ? percentage : 0),
      },
      total: total + count,
    }),
    {
      total: 0,
      byBeneficiairesSuivis: { value: 0, percentage: 0 },
      byBeneficiairesAnonymes: { value: 0, percentage: 0 },
    },
  )
}
