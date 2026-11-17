import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const MediateurId = defineModel(z.guid().brand('MediateurId'))

export type MediateurId = Model.TypeOf<typeof MediateurId>
