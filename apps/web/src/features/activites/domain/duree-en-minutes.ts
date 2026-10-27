import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const DureeEnMinutes = defineModel(
  z.number().int().positive().brand('DureeEnMinutes'),
)

export type DureeEnMinutes = Model.TypeOf<typeof DureeEnMinutes>
