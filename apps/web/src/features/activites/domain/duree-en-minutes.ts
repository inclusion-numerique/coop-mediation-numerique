import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const DUREE_MAXIMALE_EN_MINUTES = 23 * 60 + 59

export const DureeEnMinutes = defineModel(
  z
    .number()
    .int()
    .positive()
    .max(DUREE_MAXIMALE_EN_MINUTES)
    .brand('DureeEnMinutes'),
)

export type DureeEnMinutes = Model.TypeOf<typeof DureeEnMinutes>
