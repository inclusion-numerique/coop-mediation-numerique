import { z } from 'zod'
import { format } from '@/libraries/date'
import { defineModel, type Model } from '@/libraries/model'

export const Jour = defineModel(z.iso.date().brand('Jour'))

export type Jour = Model.TypeOf<typeof Jour>

export const jourDe = (date: Date): Jour => Jour(format(date, 'yyyy-MM-dd'))
