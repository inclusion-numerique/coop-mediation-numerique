import type { CompteRdvIntrouvable } from '../../../domain/errors'
import type { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'

export type NonAutorise = { readonly _tag: 'NonAutorise' }

export const NonAutorise = (): NonAutorise => ({ _tag: 'NonAutorise' })

export type MarquageDEchec = {
  readonly agentId: RdvAgentId
  readonly message: string
  readonly le: Date
}

export type SynchronisationEchouee = {
  readonly _tag: 'SynchronisationEchouee'
  readonly marquage: MarquageDEchec | null
}

export const SynchronisationEchouee = (
  marquage: MarquageDEchec | null,
): SynchronisationEchouee => ({ _tag: 'SynchronisationEchouee', marquage })

export type EchecDeDeclencherSynchronisation =
  | NonAutorise
  | CompteRdvIntrouvable
  | SynchronisationEchouee
