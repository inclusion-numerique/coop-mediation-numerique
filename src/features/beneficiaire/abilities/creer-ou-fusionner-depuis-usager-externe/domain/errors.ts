import type { EchecTechnique } from '@/libraries/result'

export type IdentiteIncomplete = {
  readonly _tag: 'IdentiteIncomplete'
  readonly rdvUserId: number
}

export const IdentiteIncomplete = (rdvUserId: number): IdentiteIncomplete => ({
  _tag: 'IdentiteIncomplete',
  rdvUserId,
})

export type MotifDEcart = EchecTechnique | IdentiteIncomplete

export type EchecDeCreerOuFusionnerDepuisUsagerExterne = never
