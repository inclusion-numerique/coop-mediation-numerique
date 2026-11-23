import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

const visibilitesCartographie = ['Publie', 'NonPublie'] as const

export const VisibiliteCartographie = defineModel(
  z.enum(visibilitesCartographie).brand('VisibiliteCartographie'),
)

export type VisibiliteCartographie = Model.TypeOf<typeof VisibiliteCartographie>

export const estPublie = (visibilite: VisibiliteCartographie): boolean =>
  visibilite === VisibiliteCartographie('Publie')
