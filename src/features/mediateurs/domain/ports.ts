import type { MediateurId } from './mediateur-id'
import type { Contrat } from './rupture-en-attente'

export type MediateurEtContrats = {
  readonly id: MediateurId
  readonly visibiliteChoisieLe: Date | null
  readonly contrats: readonly Contrat[]
}

export type LireMediateurEtContrats = (
  mediateurId: MediateurId,
) => Promise<MediateurEtContrats | null>
