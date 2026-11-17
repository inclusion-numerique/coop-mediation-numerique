import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Horodatage = defineModel(z.date().brand('Horodatage'))

export type Horodatage = Model.TypeOf<typeof Horodatage>
