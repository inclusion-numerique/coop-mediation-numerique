import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

const capitaliserLeSegment = (segment: string): string =>
  `${segment.slice(0, 1).toUpperCase()}${segment.slice(1).toLowerCase()}`

const capitaliserLePrenom = (prenom: string): string =>
  prenom
    .split(' ')
    .map((mot) => mot.split('-').map(capitaliserLeSegment).join('-'))
    .join(' ')

export const NomDuRegistre = defineModel(
  z.string().trim().min(1).max(50).toUpperCase().brand('NomDuRegistre'),
)

export type NomDuRegistre = Model.TypeOf<typeof NomDuRegistre>

export const PrenomDuRegistre = defineModel(
  z
    .string()
    .trim()
    .min(1)
    .max(50)
    .transform(capitaliserLePrenom)
    .brand('PrenomDuRegistre'),
)

export type PrenomDuRegistre = Model.TypeOf<typeof PrenomDuRegistre>
