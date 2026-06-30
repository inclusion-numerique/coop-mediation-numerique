import { BeneficiaireValidation } from '@app/web/features/beneficiaire/forms/beneficiaire-validation'
import { z } from 'zod'

/**
 * Relaxed validation for beneficiaire in CRA forms.
 *
 * For CRA (Compte Rendu d'Activité), only `id` is used by the server for existing beneficiaires.
 * `prenom`, `nom` are for UI display only.
 *
 * Fields with strict validation are overridden with relaxed versions to avoid
 * re-validating data that was already validated at beneficiaire creation.
 */
export const BeneficiaireCraValidation = BeneficiaireValidation.omit({
  prenom: true,
  nom: true,
  telephone: true,
  email: true,
  anneeNaissance: true,
}).extend({
  // Relax required fields
  prenom: z.string().nullish(),
  nom: z.string().nullish(),
  // Relax format-validated fields
  telephone: z.string().nullish(),
  email: z.string().nullish(),
  anneeNaissance: z.number().nullish(),
})

export type BeneficiaireCraData = z.infer<typeof BeneficiaireCraValidation>
