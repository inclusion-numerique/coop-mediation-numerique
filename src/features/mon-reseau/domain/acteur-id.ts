import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const ActeurId = defineModel(z.guid().brand('ActeurId'))

export type ActeurId = Model.TypeOf<typeof ActeurId>
