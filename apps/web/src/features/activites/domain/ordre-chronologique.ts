import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const ORDRES_CHRONOLOGIQUES = ['PlusRecentes', 'PlusAnciennes'] as const

export const OrdreChronologique = defineModel(
  z.enum(ORDRES_CHRONOLOGIQUES).brand('OrdreChronologique'),
)

export type OrdreChronologique = Model.TypeOf<typeof OrdreChronologique>
