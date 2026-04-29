import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const ANNEE_NAISSANCE_MIN = 1900

export const AnneeNaissance = defineModel(
  z
    .number()
    .int()
    .min(ANNEE_NAISSANCE_MIN)
    .max(new Date().getFullYear())
    .brand('AnneeNaissance'),
)

export type AnneeNaissance = Model.TypeOf<typeof AnneeNaissance>
