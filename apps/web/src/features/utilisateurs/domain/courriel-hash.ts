import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const COURRIEL_HASH_LENGTH = 12

/**
 * Empreinte qui rend unique le courriel d'un compte anonymisé.
 *
 * Elle est calculée par empreinte (sha256 tronqué) et non tirée au hasard,
 * contrairement à ce que faisait le couloir automatique : deux comptes ne
 * peuvent pas se disputer la même adresse, et l'anonymisation reste
 * reproductible à partir du compte d'origine.
 *
 * Elle n'est POSÉE QU'UNE FOIS. Un compte déjà anonymisé garde son adresse au
 * rejeu : la recalculer sur le courriel courant — qui vaut déjà `deleted+…` —
 * en produirait une nouvelle à chaque passage.
 */
export const CourrielHash = defineModel(
  z
    .string()
    .regex(
      new RegExp(`^[A-Za-z0-9_-]{${COURRIEL_HASH_LENGTH}}$`),
      'Hash attendue : 12 caractères base64url',
    )
    .brand('CourrielHash'),
)

export type CourrielHash = Model.TypeOf<typeof CourrielHash>
