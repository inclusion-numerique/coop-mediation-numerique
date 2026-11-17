import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const AdresseCourriel = defineModel(
  z.string().trim().toLowerCase().pipe(z.email()).brand('AdresseCourriel'),
)

export type AdresseCourriel = Model.TypeOf<typeof AdresseCourriel>
