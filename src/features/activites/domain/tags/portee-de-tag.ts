import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const PorteeDeTag = defineModel(
  z
    .enum(['Personnel', 'Equipe', 'Departemental', 'National'])
    .brand('PorteeDeTag'),
)

export type PorteeDeTag = Model.TypeOf<typeof PorteeDeTag>
