import { anneeNaissanceMin } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'

/**
 * SQL mirror of effectiveTrancheAge / trancheAgeFromAnneeNaissance.
 *
 * Derives the tranche d'âge (as the snake_case enum text) from the birth year
 * when it is present and in range, falling back to the stored tranche_age value
 * otherwise. Computed at query time so the bucket stays accurate as years pass
 * and so a stored tranche_age that diverged from the birth year (e.g. RDVSP
 * fiches, fusion) does not surface as "Non communiqué".
 *
 * Returns an SQL scalar expression yielding the snake_case enum value or NULL.
 *
 * @param yearColumn - SQL reference to the birth year column (e.g. 'ben.annee_naissance')
 * @param storedColumn - SQL reference to the stored tranche_age column (e.g. 'ben.tranche_age')
 */
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
