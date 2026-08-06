import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import { CodeInsee } from './code-insee'
import { CodePostal } from './code-postal'

/**
 * Adresse telle qu'on la reçoit avant de créer une employeuse : celle d'un
 * choix Sirene, d'une réponse de l'API Recherche d'entreprises ou d'un payload
 * Dataspace. À ne pas confondre avec `AdresseEmployeuse`, qui est la ligne
 * `main.adresse` déjà géocodée.
 *
 * Seule la commune est requise : sans localité, il n'y a rien à soumettre à la
 * BAN. Le code postal et le code INSEE peuvent manquer — c'est justement une
 * partie de ce que le géocodage nous rend — et certaines identités Sirene
 * n'en portent pas (établissements non diffusibles).
 */
export const AdresseAGeocoder = defineModel(
  z
    .object({
      voie: z
        .string()
        .trim()
        .nullish()
        .transform((value) => value || null),
      commune: z.string().trim().min(1),
      codePostal: CodePostal.schema
        .nullish()
        .transform((value) => value ?? null),
      codeInsee: CodeInsee.schema.nullish().transform((value) => value ?? null),
    })
    .brand('AdresseAGeocoder'),
)

export type AdresseAGeocoder = Model.TypeOf<typeof AdresseAGeocoder>
