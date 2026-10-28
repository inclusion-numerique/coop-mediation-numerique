import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NOM_DU_TAG_LONGUEUR_MAX = 80

export const NomDuTag = defineModel(z.string().trim().min(1).brand('NomDuTag'))

export type NomDuTag = Model.TypeOf<typeof NomDuTag>
