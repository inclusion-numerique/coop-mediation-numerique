import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

const FILTRES_D_ORIGINE = ['RendezVous', 'HorsRendezVous'] as const

export const FiltreDOrigine = defineModel(
  z.enum(FILTRES_D_ORIGINE).brand('FiltreDOrigine'),
)

export type FiltreDOrigine = Model.TypeOf<typeof FiltreDOrigine>
