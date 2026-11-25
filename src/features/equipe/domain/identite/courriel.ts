import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const Courriel = defineModel(
  z.string().trim().toLowerCase().pipe(z.email()).brand('Email'),
)

export type Courriel = Model.TypeOf<typeof Courriel>
