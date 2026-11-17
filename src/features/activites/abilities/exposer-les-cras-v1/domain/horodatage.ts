import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Horodatage = defineModel(z.date().brand('Horodatage'))

export type Horodatage = Model.TypeOf<typeof Horodatage>
