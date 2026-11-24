import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const UtilisateurId = defineModel(z.guid().brand('UserId'))

export type UtilisateurId = Model.TypeOf<typeof UtilisateurId>
