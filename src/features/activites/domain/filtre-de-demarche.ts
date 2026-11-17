import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const FILTRES_DE_DEMARCHE = ['Avec', 'Sans'] as const

export const FiltreDeDemarche = defineModel(
  z.enum(FILTRES_DE_DEMARCHE).brand('FiltreDeDemarche'),
)

export type FiltreDeDemarche = Model.TypeOf<typeof FiltreDeDemarche>
