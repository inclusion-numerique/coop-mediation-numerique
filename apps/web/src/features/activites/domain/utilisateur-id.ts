import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const UtilisateurId = defineModel(z.guid().brand('UtilisateurId'))

export type UtilisateurId = Model.TypeOf<typeof UtilisateurId>
