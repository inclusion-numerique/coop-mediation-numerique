import { z } from 'zod'
import { AnneeNaissance } from './annee-naissance'
import type { BeneficiaireACreer } from './beneficiaire-a-creer'
import { CommuneResidence } from './commune-residence'
import type { ContactTelephone } from './contact-telephone'
import { Email } from './email'
import { Genre, genres } from './genre'
import { Nom } from './nom'
import { Notes } from './notes'
import { Prenom } from './prenom'
import { StatutSocial, statutsSociaux } from './statut-social'
import { Telephone } from './telephone'

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
 * du domaine. Partagée entre les abilities creer et modifier (qui ajoute `id`).
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
