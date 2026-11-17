import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const ActiviteDeCoordinationId = defineModel(
  z.guid().brand('ActiviteDeCoordinationId'),
)

export type ActiviteDeCoordinationId = Model.TypeOf<
  typeof ActiviteDeCoordinationId
>
