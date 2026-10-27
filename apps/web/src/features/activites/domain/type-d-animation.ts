import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

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
