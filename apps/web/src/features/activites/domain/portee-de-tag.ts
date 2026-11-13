import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const PorteeDeTag = defineModel(
  z
    .enum(['Personnel', 'Equipe', 'Departemental', 'National'])
    .brand('PorteeDeTag'),
)

export type PorteeDeTag = Model.TypeOf<typeof PorteeDeTag>
