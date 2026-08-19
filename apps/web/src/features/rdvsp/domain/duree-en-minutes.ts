import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/** Durée d'un rendez-vous, en minutes. */
export const DureeEnMinutes = defineModel(
  z.number().int().positive().brand('DureeEnMinutes'),
)

export type DureeEnMinutes = Model.TypeOf<typeof DureeEnMinutes>
