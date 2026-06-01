import {
  anneeNaissanceMax,
  anneeNaissanceMin,
} from '@app/web/features/beneficiaires/validation/BeneficiaireValidation' // Todo: move file to beneficiaires feature
import type { TrancheAge } from '@prisma/client'

export const trancheAgeFromAnneeNaissance = (
  anneeNaissance?: string | number | null,
): TrancheAge | null => {
  if (!anneeNaissance) return null

  const anneeInt =
    typeof anneeNaissance === 'string'
      ? Number.parseInt(anneeNaissance, 10)
      : anneeNaissance

  if (anneeInt < anneeNaissanceMin || anneeInt > anneeNaissanceMax) return null

  const age = new Date().getFullYear() - anneeInt

  if (age < 12) return 'MoinsDeDouze'
  if (age < 18) return 'DouzeDixHuit'
  if (age < 25) return 'DixHuitVingtQuatre'
  if (age < 40) return 'VingtCinqTrenteNeuf'
  if (age < 60) return 'QuaranteCinquanteNeuf'
  if (age < 70) return 'SoixanteSoixanteNeuf'

  return 'SoixanteDixPlus'
}

/**
 * Effective tranche d'âge for display and statistics.
 *
 * The tranche is derived from the birth year whenever one is available (and the
 * derivation stays accurate as years pass), falling back to the stored value
 * only when there is no usable birth year — e.g. anonymous beneficiaires whose
 * tranche was picked directly.
 *
 * This is the single source of truth mirrored by the SQL in getBeneficiaireStats.
 */
export const effectiveTrancheAge = (
  anneeNaissance?: string | number | null,
  trancheAge?: TrancheAge | null,
): TrancheAge | null =>
  trancheAgeFromAnneeNaissance(anneeNaissance) ?? trancheAge ?? null
