import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const TailleDeLot = defineModel(
  z.number().int().positive().brand('TailleDeLot'),
)

export type TailleDeLot = Model.TypeOf<typeof TailleDeLot>

export const enLots = <T>(
  elements: readonly T[],
  taille: TailleDeLot,
): readonly (readonly T[])[] =>
  Array.from({ length: Math.ceil(elements.length / taille) }, (_, rang) =>
    elements.slice(rang * taille, (rang + 1) * taille),
  )
