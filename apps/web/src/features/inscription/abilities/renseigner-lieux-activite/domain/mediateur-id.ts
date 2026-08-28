import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const MediateurId = defineModel(z.string().uuid().brand('MediateurId'))

export type MediateurId = Model.TypeOf<typeof MediateurId>
