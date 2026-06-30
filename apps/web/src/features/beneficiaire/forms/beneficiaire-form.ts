import { AnneeNaissance } from '@app/web/features/beneficiaire/domain/annee-naissance'
import { CommuneResidence } from '@app/web/features/beneficiaire/domain/commune-residence'
import { Email } from '@app/web/features/beneficiaire/domain/email'
import { genres } from '@app/web/features/beneficiaire/domain/genre'
import { Nom } from '@app/web/features/beneficiaire/domain/nom'
import { Notes } from '@app/web/features/beneficiaire/domain/notes'
import { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import { statutsSociaux } from '@app/web/features/beneficiaire/domain/statut-social'
import { Telephone } from '@app/web/features/beneficiaire/domain/telephone'
import { optional } from '@app/web/libraries/zod'
import { z } from 'zod'

/**
 * Normalisation de frontière : une commune incomplète (un des champs clés
 * manquant ou vide) signifie « pas de commune ». Le formulaire nettoie sa
 * propre entrée vers `CommuneResidence | null`.
 */
const CommuneResidenceForm = z
  .object({
    commune: z.string(),
    codePostal: z.string(),
    codeInsee: z.string(),
    adresse: optional(z.string()),
  })
  .transform((fields) =>
    fields.commune && fields.codePostal && fields.codeInsee
      ? CommuneResidence({
          commune: fields.commune,
          codePostal: fields.codePostal,
          codeInsee: fields.codeInsee,
          ...(fields.adresse ? { adresse: fields.adresse } : {}),
        })
      : null,
  )

/**
 * Forme « à plat » du formulaire bénéficiaire : champs tels que saisis, validés
 * par les value objects du domaine. Couche formulaire (pas domaine), partagée
 * entre les abilities créer et modifier — chacune applique ensuite son propre
 * `.transform` vers son type métier.
 */
export const beneficiaireFormShape = z.object({
  prenom: Prenom.schema,
  nom: Nom.schema,
  telephone: optional(Telephone.schema),
  pasDeTelephone: z.boolean().nullish(),
  email: optional(Email.schema),
  anneeNaissance: optional(AnneeNaissance.schema),
  communeResidence: CommuneResidenceForm.nullish(),
  genre: z.enum(genres).nullish(),
  statutSocial: z.enum(statutsSociaux).nullish(),
  notes: optional(Notes.schema),
})

export type BeneficiaireFormOutput = z.output<typeof beneficiaireFormShape>
