import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/** Identifiant d'un compte (`coop.users.id`). */
export const UtilisateurId = defineModel(
  z.string().uuid().brand('UtilisateurId'),
)

export type UtilisateurId = Model.TypeOf<typeof UtilisateurId>
