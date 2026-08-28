import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/** Forme canonique : sans espaces de bord, en minuscules. */
export const Email = defineModel(
  z.string().trim().toLowerCase().email().brand('Email'),
)

export type Email = Model.TypeOf<typeof Email>
