import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const PorteeDuTag = defineModel(
  z
    .enum(['Personnel', 'Equipe', 'Departemental', 'National'])
    .brand('PorteeDuTag'),
)

export type PorteeDuTag = Model.TypeOf<typeof PorteeDuTag>
