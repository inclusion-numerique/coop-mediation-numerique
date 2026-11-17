import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Prenom = defineModel(z.string().trim().min(1).brand('Prenom'))

export type Prenom = Model.TypeOf<typeof Prenom>
