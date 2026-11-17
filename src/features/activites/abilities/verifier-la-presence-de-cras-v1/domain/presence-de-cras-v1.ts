import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const PresenceDeCrasV1 = defineModel(
  z.enum(['Presents', 'Absents']).brand('PresenceDeCrasV1'),
)

export type PresenceDeCrasV1 = Model.TypeOf<typeof PresenceDeCrasV1>
