import type { Result } from '@/libraries/result'
import type { RafraichissementImpossible } from './errors'

export type IdToken = {
  readonly valeur: string
  readonly expiration: Date | null
}

export type JetonsProconnect = {
  readonly idToken: IdToken | null
  readonly refreshToken: string | null
}

export type LireLesJetonsProconnect = (
  utilisateurId: string,
) => Promise<JetonsProconnect>

export type RafraichirLIdToken = (
  refreshToken: string,
) => Promise<Result<string, RafraichissementImpossible>>

export type SeDeconnecterPorts = {
  readonly lireLesJetonsProconnect: LireLesJetonsProconnect
  readonly rafraichirLIdToken: RafraichirLIdToken
}
