import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const TermeDeRecherche = defineModel(
  z.string().trim().min(3).brand('TermeDeRecherche'),
)

export type TermeDeRecherche = Model.TypeOf<typeof TermeDeRecherche>
