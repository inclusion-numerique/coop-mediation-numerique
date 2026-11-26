import { z } from 'zod'
import { optional } from '@/features/beneficiaire/action/champ-optionnel.validation'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import { Email } from '@/features/beneficiaire/domain/email'
import { genres } from '@/features/beneficiaire/domain/genre'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Notes } from '@/features/beneficiaire/domain/notes'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { statutsSociaux } from '@/features/beneficiaire/domain/statut-social'
import { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import { Telephone } from '@/libraries/telephone'

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

export const beneficiaireFormShape = z.object({
  prenom: Prenom.schema,
  nom: Nom.schema,
  telephone: optional(Telephone.schema),
  pasDeTelephone: z.boolean().nullish(),
  email: optional(Email.schema),
  anneeNaissance: optional(AnneeNaissance(new Date()).schema),
  communeResidence: CommuneResidenceForm.nullish(),
  genre: z.enum(genres).nullish(),
  trancheAge: TrancheAge.schema,
  statutSocial: z.enum(statutsSociaux).nullish(),
  notes: optional(Notes.schema),
})
