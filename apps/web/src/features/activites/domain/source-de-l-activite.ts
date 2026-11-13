import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const SOURCES_DE_L_ACTIVITE = ['ImportV1', 'Coop'] as const

export const SourceDeLActivite = defineModel(
  z.enum(SOURCES_DE_L_ACTIVITE).brand('SourceDeLActivite'),
)

export type SourceDeLActivite = Model.TypeOf<typeof SourceDeLActivite>
