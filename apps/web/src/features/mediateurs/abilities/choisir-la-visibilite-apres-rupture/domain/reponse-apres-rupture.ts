import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const reponsesApresRupture = [
  'SouhaiteApparaitre',
  'PrefereResterMasque',
] as const

export const ReponseApresRupture = defineModel(
  z.enum(reponsesApresRupture).brand('ReponseApresRupture'),
)

export type ReponseApresRupture = Model.TypeOf<typeof ReponseApresRupture>

export const visibiliteApres = (reponse: ReponseApresRupture): boolean =>
  reponse === 'SouhaiteApparaitre'
