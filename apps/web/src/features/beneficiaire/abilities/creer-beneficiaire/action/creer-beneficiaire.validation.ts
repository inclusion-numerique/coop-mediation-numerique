import { AnneeNaissance } from '@app/web/features/beneficiaire/domain/annee-naissance'
import { CommuneResidence } from '@app/web/features/beneficiaire/domain/commune-residence'
import type { ContactTelephone } from '@app/web/features/beneficiaire/domain/contact-telephone'
import { Email } from '@app/web/features/beneficiaire/domain/email'
import { Genre, genres } from '@app/web/features/beneficiaire/domain/genre'
import { Nom } from '@app/web/features/beneficiaire/domain/nom'
import { Notes } from '@app/web/features/beneficiaire/domain/notes'
import { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import {
  StatutSocial,
  statutsSociaux,
} from '@app/web/features/beneficiaire/domain/statut-social'
import { Telephone } from '@app/web/features/beneficiaire/domain/telephone'
import { z } from 'zod'
import type { BeneficiaireACreer } from '../domain/beneficiaire-a-creer'

const blankToUndefined = (value: unknown): unknown =>
  value == null || (typeof value === 'string' && value.trim() === '')
    ? undefined
    : value

const optional = <S extends z.ZodTypeAny>(schema: S) =>
  z.preprocess(blankToUndefined, schema.optional())

const CommuneResidenceWire = z.object({
  commune: z.string(),
  codePostal: z.string(),
  codeInsee: z.string(),
  adresse: optional(z.string()),
})

/**
 * Forme « wire » du formulaire : champs à plat, validés par les value objects
 * du domaine. Réutilisée par modifier-beneficiaire (qui ajoute `id`).
 */
export const beneficiaireWireShape = z.object({
  prenom: Prenom.schema,
  nom: Nom.schema,
  telephone: optional(Telephone.schema),
  pasDeTelephone: z.boolean().nullish(),
  email: optional(Email.schema),
  anneeNaissance: optional(AnneeNaissance.schema),
  communeResidence: CommuneResidenceWire.nullish(),
  genre: z.enum(genres).nullish(),
  statutSocial: z.enum(statutsSociaux).nullish(),
  notes: optional(Notes.schema),
})

export type BeneficiaireWireOutput = z.output<typeof beneficiaireWireShape>

const toContactTelephone = (
  telephone: Telephone | undefined,
  pasDeTelephone: boolean | null | undefined,
): ContactTelephone =>
  telephone
    ? { _tag: 'disponible', numero: telephone }
    : pasDeTelephone
      ? { _tag: 'pasDeTelephone' }
      : { _tag: 'nonRenseigne' }

const toCommuneResidence = (
  wire: z.output<typeof CommuneResidenceWire> | null | undefined,
): CommuneResidence | null =>
  wire?.commune && wire.codePostal && wire.codeInsee
    ? CommuneResidence({
        commune: wire.commune,
        codePostal: wire.codePostal,
        codeInsee: wire.codeInsee,
        ...(wire.adresse ? { adresse: wire.adresse } : {}),
      })
    : null

/** Mapping wire → modèle domaine, partagé entre creer et modifier. */
export const toBeneficiaireACreer = (
  input: BeneficiaireWireOutput,
): BeneficiaireACreer => ({
  prenom: input.prenom,
  nom: input.nom,
  contactTelephone: toContactTelephone(input.telephone, input.pasDeTelephone),
  email: input.email ?? null,
  anneeNaissance: input.anneeNaissance ?? null,
  communeResidence: toCommuneResidence(input.communeResidence),
  genre: Genre(input.genre ?? 'NonCommunique'),
  statutSocial: StatutSocial(input.statutSocial ?? 'NonCommunique'),
  notes: input.notes ?? null,
})

export const CreerBeneficiaireValidation =
  beneficiaireWireShape.transform(toBeneficiaireACreer)
