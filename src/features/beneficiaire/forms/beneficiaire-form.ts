import { z } from 'zod'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import { Email } from '@/features/beneficiaire/domain/email'
import { genres } from '@/features/beneficiaire/domain/genre'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Notes } from '@/features/beneficiaire/domain/notes'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { statutsSociaux } from '@/features/beneficiaire/domain/statut-social'
import { Telephone } from '@/features/beneficiaire/domain/telephone'
import { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import { optional } from '@/libraries/zod'

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
  trancheAge: TrancheAge.schema,
  statutSocial: z.enum(statutsSociaux).nullish(),
  notes: optional(Notes.schema),
})
