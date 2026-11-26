import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const JetonAcces = defineModel(z.string().min(1).brand('JetonAcces'))
export type JetonAcces = Model.TypeOf<typeof JetonAcces>

export const JetonRafraichissement = defineModel(
  z.string().min(1).brand('JetonRafraichissement'),
)
export type JetonRafraichissement = Model.TypeOf<typeof JetonRafraichissement>

export const PorteeOAuth = defineModel(z.string().min(1).brand('PorteeOAuth'))
export type PorteeOAuth = Model.TypeOf<typeof PorteeOAuth>

export type JetonsOAuth = {
  readonly acces: JetonAcces
  readonly rafraichissement: JetonRafraichissement | null
  readonly expiration: Date | null
  readonly portee: PorteeOAuth | null
}

const MARGE_RENOUVELLEMENT_MS = 60_000

export const jetonsARenouveler = (
  { expiration }: JetonsOAuth,
  maintenant: Date,
): boolean =>
  expiration !== null &&
  expiration.getTime() - maintenant.getTime() < MARGE_RENOUVELLEMENT_MS
