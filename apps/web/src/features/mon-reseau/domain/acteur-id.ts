import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const ActeurId = defineModel(z.guid().brand('ActeurId'))

export type ActeurId = Model.TypeOf<typeof ActeurId>
