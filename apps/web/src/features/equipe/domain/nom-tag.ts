import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomTag = defineModel(z.string().trim().min(1).brand('NomTag'))

export type NomTag = Model.TypeOf<typeof NomTag>

/**
 * La forme sous laquelle deux noms de tag se comparent.
 *
 * La normalisation vit dans le schéma, comme `libraries/model` l'exige : posée
 * autour, elle serait contournée dès que ce modèle serait composé dans un autre.
 */
export const NomTagCanonique = defineModel(
  z.string().trim().toLowerCase().min(1).brand('NomTagCanonique'),
)

export type NomTagCanonique = Model.TypeOf<typeof NomTagCanonique>

/**
 * Deux tags du même détenteur portant le même nom à la casse près sont le MÊME
 * tag.
 *
 * C'est une règle d'identité, pas une commodité de requête : c'est elle qui
 * empêche de laisser à quelqu'un deux entrées indiscernables dans sa liste
 * lorsqu'un tag essaime chez lui. Elle vit ici plutôt que dans une clause
 * `mode: 'insensitive'`, où personne ne l'aurait trouvée ni testée.
 */
export const memeNom = (un: NomTag, autre: NomTag): boolean =>
  NomTagCanonique(un) === NomTagCanonique(autre)
