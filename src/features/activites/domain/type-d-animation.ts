import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const TypeDAnimation = defineModel(
  z
    .enum([
      'Assemblee',
      'Comite',
      'GroupeDeTravail',
      'Echange',
      'ReunionCoordination',
      'Webinaire',
    ])
    .brand('TypeDAnimation'),
)

export type TypeDAnimation = Model.TypeOf<typeof TypeDAnimation>
