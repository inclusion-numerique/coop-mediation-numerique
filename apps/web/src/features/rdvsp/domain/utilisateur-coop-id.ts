import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Identifiant de l'utilisateur La Coop propriétaire du compte RDV. C'est le seul
 * identifiant de cette feature qui ne vienne pas de RDV Service Public, et c'est
 * lui qui porte le périmètre de propriété des requêtes (AB-3).
 */
export const UtilisateurCoopId = defineModel(
  z.string().uuid().brand('UtilisateurCoopId'),
)

export type UtilisateurCoopId = Model.TypeOf<typeof UtilisateurCoopId>
