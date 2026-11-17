import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

/** Forme canonique : sans espaces de bord, en minuscules. */
export const Email = defineModel(
  z.string().trim().toLowerCase().pipe(z.email()).brand('Email'),
)

export type Email = Model.TypeOf<typeof Email>
