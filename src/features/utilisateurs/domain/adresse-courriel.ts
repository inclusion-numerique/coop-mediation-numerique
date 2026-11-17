import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const AdresseCourriel = defineModel(
  z.string().trim().toLowerCase().pipe(z.email()).brand('AdresseCourriel'),
)

export type AdresseCourriel = Model.TypeOf<typeof AdresseCourriel>
