import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Courriel = defineModel(
  z.string().trim().toLowerCase().pipe(z.email()).brand('Courriel'),
)

export type Courriel = Model.TypeOf<typeof Courriel>
