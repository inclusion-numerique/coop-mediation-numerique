import { AdresseBanValidation } from '@app/web/external-apis/ban/AdresseBanValidation'
import { anneeNaissanceValidation } from '@app/web/features/beneficiaire/domain/annee-naissance'
import { genres as genreValues } from '@app/web/features/beneficiaire/domain/genre'
import { statutsSociaux as statutSocialValues } from '@app/web/features/beneficiaire/domain/statut-social'
import { tranchesAge as trancheAgeValues } from '@app/web/features/beneficiaire/domain/tranche-age'
import { telephoneValidation } from '@app/web/utils/telephoneValidation'
import z from 'zod'

export const BeneficiaireValidation = z.object({
  id: z.guid().nullish(), // defined if update, nullish if create
  prenom: z
    .string({
      error: 'Veuillez renseigner un prénom',
    })
    .trim()
    .min(1, 'Veuillez renseigner un prénom'),
  nom: z
    .string({
      error: 'Veuillez renseigner un nom',
    })
    .trim()
    .min(1, 'Veuillez renseigner un nom'),
  telephone: telephoneValidation,
  pasDeTelephone: z.boolean().nullish(),
  email: z
    .union([
      z.email('Veuillez renseigner une adresse email valide'),
      z
        .string()
        .max(0)
        .transform((value) => value || null),
      z.null(),
    ])
    .optional(),
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
