import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import { Siren } from './siren'

export const Siret = defineModel(
  z
    .string()
    .trim()
    .regex(/^\d{14}$/)
    .brand('Siret'),
)

export type Siret = Model.TypeOf<typeof Siret>

export const sirenDuSiret = (siret: Siret): Siren => Siren(siret.slice(0, 9))
