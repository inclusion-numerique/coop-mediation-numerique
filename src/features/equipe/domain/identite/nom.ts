import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Nom = defineModel(z.string().trim().min(1).brand('Nom'))

export type Nom = Model.TypeOf<typeof Nom>
