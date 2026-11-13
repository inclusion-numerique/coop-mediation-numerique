import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Prenom = defineModel(z.string().trim().min(1).brand('Prenom'))

export type Prenom = Model.TypeOf<typeof Prenom>
