import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const ThematiqueDAnimation = defineModel(
  z
    .enum(['Partage', 'Reseau', 'Soutien', 'Professionnel', 'RH'])
    .brand('ThematiqueDAnimation'),
)

export type ThematiqueDAnimation = Model.TypeOf<typeof ThematiqueDAnimation>
