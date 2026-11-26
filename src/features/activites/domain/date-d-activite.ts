import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const PREMIERE_DATE_D_ACTIVITE = '2020-11-17'

export const DateDActivite = defineModel(
  z.iso
    .date()
    .refine((date) => date >= PREMIERE_DATE_D_ACTIVITE)
    .brand('DateDActivite'),
)

export type DateDActivite = Model.TypeOf<typeof DateDActivite>

export const dateDActiviteDuJour = (instant: Date): DateDActivite =>
  DateDActivite(instant.toISOString().slice(0, 10))
