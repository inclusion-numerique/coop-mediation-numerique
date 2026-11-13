import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const ORDRES_CHRONOLOGIQUES = ['PlusRecentes', 'PlusAnciennes'] as const

export const OrdreChronologique = defineModel(
  z.enum(ORDRES_CHRONOLOGIQUES).brand('OrdreChronologique'),
)

export type OrdreChronologique = Model.TypeOf<typeof OrdreChronologique>

export const ordreChronologiqueLu = (ordre: unknown): OrdreChronologique =>
  ordre === 'asc'
    ? OrdreChronologique('PlusAnciennes')
    : OrdreChronologique('PlusRecentes')
