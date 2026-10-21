import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const AuteurId = defineModel(z.guid().brand('AuteurId'))

export type AuteurId = Model.TypeOf<typeof AuteurId>
