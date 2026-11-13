import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const PresenceDeCrasV1 = defineModel(
  z.enum(['Presents', 'Absents']).brand('PresenceDeCrasV1'),
)

export type PresenceDeCrasV1 = Model.TypeOf<typeof PresenceDeCrasV1>
