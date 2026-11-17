import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const PorteeDuTag = defineModel(
  z
    .enum(['Personnel', 'Equipe', 'Departemental', 'National'])
    .brand('PorteeDuTag'),
)

export type PorteeDuTag = Model.TypeOf<typeof PorteeDuTag>
