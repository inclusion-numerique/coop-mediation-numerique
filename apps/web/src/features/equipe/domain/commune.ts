import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Commune = defineModel(z.string().trim().min(1).brand('Commune'))

export type Commune = Model.TypeOf<typeof Commune>
