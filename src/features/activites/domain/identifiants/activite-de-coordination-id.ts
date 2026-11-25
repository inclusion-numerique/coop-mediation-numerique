import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const ActiviteDeCoordinationId = defineModel(
  z.guid().brand('ActiviteDeCoordinationId'),
)

export type ActiviteDeCoordinationId = Model.TypeOf<
  typeof ActiviteDeCoordinationId
>
