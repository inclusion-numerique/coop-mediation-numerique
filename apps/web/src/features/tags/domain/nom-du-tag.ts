import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomDuTag = defineModel(z.string().trim().min(1).brand('NomDuTag'))

export type NomDuTag = Model.TypeOf<typeof NomDuTag>
