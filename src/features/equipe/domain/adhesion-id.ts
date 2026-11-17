import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const AdhesionId = defineModel(z.guid().brand('AdhesionId'))

export type AdhesionId = Model.TypeOf<typeof AdhesionId>
