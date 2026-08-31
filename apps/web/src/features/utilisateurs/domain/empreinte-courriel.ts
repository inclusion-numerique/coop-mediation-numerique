import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const EMPREINTE_COURRIEL_LONGUEUR = 12

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
export const EmpreinteCourriel = defineModel(
  z
    .string()
    .regex(
      new RegExp(`^[A-Za-z0-9_-]{${EMPREINTE_COURRIEL_LONGUEUR}}$`),
      'Empreinte attendue : 12 caractères base64url',
    )
    .brand('EmpreinteCourriel'),
)

export type EmpreinteCourriel = Model.TypeOf<typeof EmpreinteCourriel>
