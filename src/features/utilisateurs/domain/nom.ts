import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Nom = defineModel(z.string().trim().min(1).brand('Nom'))

export type Nom = Model.TypeOf<typeof Nom>
