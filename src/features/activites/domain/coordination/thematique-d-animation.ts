import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const ThematiqueDAnimation = defineModel(
  z
    .enum(['Partage', 'Reseau', 'Soutien', 'Professionnel', 'RH'])
    .brand('ThematiqueDAnimation'),
)

export type ThematiqueDAnimation = Model.TypeOf<typeof ThematiqueDAnimation>
