import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

const FILTRES_DE_DEMARCHE = ['Avec', 'Sans'] as const

export const FiltreDeDemarche = defineModel(
  z.enum(FILTRES_DE_DEMARCHE).brand('FiltreDeDemarche'),
)

export type FiltreDeDemarche = Model.TypeOf<typeof FiltreDeDemarche>
