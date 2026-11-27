import type { EchecTechnique } from '@/libraries/result'
import type { RdvUserId } from './rdv-user-id'

export type IdentiteIncomplete = {
  readonly _tag: 'IdentiteIncomplete'
  readonly rdvUserId: RdvUserId
}

export const IdentiteIncomplete = (
  rdvUserId: RdvUserId,
): IdentiteIncomplete => ({
  _tag: 'IdentiteIncomplete',
  rdvUserId,
})

export type MotifDEcart = EchecTechnique | IdentiteIncomplete

export type EchecDeCreerOuFusionnerDepuisUsagerExterne = never
