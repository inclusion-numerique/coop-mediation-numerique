import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

const TYPES = ['Animation', 'Evenement', 'Partenariat'] as const

export const TypeDActiviteDeCoordination = defineModel(
  z.enum(TYPES).brand('TypeDActiviteDeCoordination'),
)

export type TypeDActiviteDeCoordination = Model.TypeOf<
  typeof TypeDActiviteDeCoordination
>

export const typesDActiviteDeCoordination: readonly TypeDActiviteDeCoordination[] =
  TYPES.map(TypeDActiviteDeCoordination)
