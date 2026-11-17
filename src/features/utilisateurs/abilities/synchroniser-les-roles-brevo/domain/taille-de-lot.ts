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
  elements.reduce<readonly (readonly T[])[]>(
    (lots, element, index) =>
      index % taille === 0
        ? [...lots, [element]]
        : [...lots.slice(0, -1), [...(lots.at(-1) ?? []), element]],
    [],
  )
