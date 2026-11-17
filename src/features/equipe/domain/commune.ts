import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Commune = defineModel(z.string().trim().min(1).brand('Commune'))

export type Commune = Model.TypeOf<typeof Commune>
