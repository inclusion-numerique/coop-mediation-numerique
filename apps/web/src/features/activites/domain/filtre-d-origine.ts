import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const FILTRES_D_ORIGINE = ['RendezVous', 'HorsRendezVous'] as const

export const FiltreDOrigine = defineModel(
  z.enum(FILTRES_D_ORIGINE).brand('FiltreDOrigine'),
)

export type FiltreDOrigine = Model.TypeOf<typeof FiltreDOrigine>
