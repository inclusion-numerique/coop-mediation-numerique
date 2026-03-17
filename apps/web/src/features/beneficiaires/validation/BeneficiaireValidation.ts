import {
  genreValues,
  statutSocialValues,
  trancheAgeValues,
} from '@app/web/beneficiaire/beneficiaire'
import { AdresseBanValidation } from '@app/web/external-apis/ban/AdresseBanValidation'
import {
  telephoneRegex,
  telephoneValidation,
} from '@app/web/utils/telephoneValidation'
import z from 'zod'

export { telephoneRegex, telephoneValidation }

export const anneeNaissanceMax = new Date().getFullYear()
export const anneeNaissanceMin = 1900

export const anneeNaissanceValidation = z
  .number({
    invalid_type_error: 'Veuillez renseigner une année de naissance valide',
  })
  .int('Veuillez renseigner une année de naissance valide')
  .min(anneeNaissanceMin, 'Veuillez renseigner une année de naissance valide')
  .max(anneeNaissanceMax, 'Veuillez renseigner une année de naissance valide')
  .nullish()

export const BeneficiaireValidation = z.object({
  id: z.string().uuid().nullish(), // defined if update, nullish if create
  prenom: z
    .string({
      required_error: 'Veuillez renseigner un prénom',
      invalid_type_error: 'Veuillez renseigner un prénom',
    })
    .trim()
    .min(1, 'Veuillez renseigner un prénom'),
  nom: z
    .string({
      required_error: 'Veuillez renseigner un nom',
      invalid_type_error: 'Veuillez renseigner un nom',
    })
    .trim()
    .min(1, 'Veuillez renseigner un nom'),
  telephone: telephoneValidation,
  pasDeTelephone: z.boolean().nullish(),
  email: z.union([
    z.string().email('Veuillez renseigner une adresse email valide'),
    z
      .string()
      .max(0)
      .transform((value) => value || null),
    z.null(),
    z.undefined(),
  ]),
  anneeNaissance: anneeNaissanceValidation,
  adresse: z.string().nullish(),
  dejaAccompagne: z.boolean().nullish(),
  communeResidence: AdresseBanValidation.nullish(),
  genre: z.enum(genreValues).nullish(),
  trancheAge: z.enum(trancheAgeValues).nullish(),
  statutSocial: z.enum(statutSocialValues).nullish(),
  notes: z.string().nullish(),
})

export type BeneficiaireData = z.infer<typeof BeneficiaireValidation>

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
