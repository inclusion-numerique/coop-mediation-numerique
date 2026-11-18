import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

/** Durée d'un rendez-vous, en minutes. */
export const DureeEnMinutes = defineModel(
  z.number().int().positive().brand('DureeEnMinutes'),
)

export type DureeEnMinutes = Model.TypeOf<typeof DureeEnMinutes>
