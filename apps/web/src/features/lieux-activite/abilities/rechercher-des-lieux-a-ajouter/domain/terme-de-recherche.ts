import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const TermeDeRecherche = defineModel(
  z.string().trim().min(3).brand('TermeDeRecherche'),
)

export type TermeDeRecherche = Model.TypeOf<typeof TermeDeRecherche>
