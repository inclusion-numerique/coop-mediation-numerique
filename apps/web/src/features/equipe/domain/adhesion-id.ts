import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const AdhesionId = defineModel(z.guid().brand('AdhesionId'))

export type AdhesionId = Model.TypeOf<typeof AdhesionId>
