import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const TriDesTags = defineModel(
  z.enum(['alphabetique', 'visibilite']).brand('TriDesTags'),
)

export type TriDesTags = Model.TypeOf<typeof TriDesTags>

export const triDemande = (demande: string | undefined): TriDesTags => {
  const tri = TriDesTags.schema.safeParse(demande)
  return tri.success ? tri.data : TriDesTags('alphabetique')
}
