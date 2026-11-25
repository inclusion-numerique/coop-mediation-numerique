import z from 'zod'
import { anneeNaissanceValidation } from '@/features/beneficiaire/domain/annee-naissance'
import { genres as genreValues } from '@/features/beneficiaire/domain/genre'
import { statutsSociaux as statutSocialValues } from '@/features/beneficiaire/domain/statut-social'
import { tranchesAge as trancheAgeValues } from '@/features/beneficiaire/domain/tranche-age'
import { AdresseBanValidation } from '@/libraries/adresse'
import { telephoneCanonique } from '@/libraries/telephone'

const telephoneValidation = z
  .string()
  .nullish()
  .transform((saisie, ctx) => {
    if (saisie == null || saisie.trim() === '') return null
    const canonique = telephoneCanonique(saisie)
    if (canonique == null) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Veuillez renseigner un numéro valide (e.g. 04 55 66 77 88 ou +32 470 12 34 56)',
      })
      return z.NEVER
    }
    return canonique
  })
  .optional()

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
