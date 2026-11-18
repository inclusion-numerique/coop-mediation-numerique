import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

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
