import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Voie = defineModel(z.string().trim().min(1).brand('Voie'))

export type Voie = Model.TypeOf<typeof Voie>
