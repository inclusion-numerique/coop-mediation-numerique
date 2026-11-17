import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Voie = defineModel(z.string().trim().min(1).brand('Voie'))

export type Voie = Model.TypeOf<typeof Voie>
