import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const UtilisateurCoopId = defineModel(
  z.guid().brand('UtilisateurCoopId'),
)

export type UtilisateurCoopId = Model.TypeOf<typeof UtilisateurCoopId>
