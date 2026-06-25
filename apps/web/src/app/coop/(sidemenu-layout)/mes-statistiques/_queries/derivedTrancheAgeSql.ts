import { ANNEE_NAISSANCE_MIN as anneeNaissanceMin } from '@app/web/features/beneficiaire/domain/annee-naissance'

export const derivedTrancheAgeSql = (
  yearColumn: string,
  storedColumn: string,
): string => {
  const age = `EXTRACT(YEAR FROM CURRENT_DATE) - ${yearColumn}`

  return `COALESCE(
    CASE
      WHEN ${yearColumn} IS NULL
        OR ${yearColumn} < ${anneeNaissanceMin}
        OR ${yearColumn} > EXTRACT(YEAR FROM CURRENT_DATE) THEN NULL
      WHEN ${age} < 12 THEN 'moins_de_douze'
      WHEN ${age} < 18 THEN 'douze_dix_huit'
      WHEN ${age} < 25 THEN 'dix_huit_vingt_quatre'
      WHEN ${age} < 40 THEN 'vingt_cinq_trente_neuf'
      WHEN ${age} < 60 THEN 'quarante_cinquante_neuf'
      WHEN ${age} < 70 THEN 'soixante_soixante_neuf'
      ELSE 'soixante_dix_plus'
    END,
    ${storedColumn}::text
  )`
}
