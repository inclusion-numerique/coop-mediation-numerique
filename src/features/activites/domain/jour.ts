import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Jour = defineModel(z.iso.date().brand('Jour'))

export type Jour = Model.TypeOf<typeof Jour>
