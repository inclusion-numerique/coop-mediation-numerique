export type EchecTechnique = {
  readonly _tag: 'EchecTechnique'
  readonly cause: unknown
}

export const EchecTechnique = (cause: unknown): EchecTechnique => ({
  _tag: 'EchecTechnique',
  cause,
})

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
