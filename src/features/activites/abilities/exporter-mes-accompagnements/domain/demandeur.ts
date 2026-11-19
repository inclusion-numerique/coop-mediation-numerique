import { CoordinateurId, MediateurId } from '../../../domain'
import type { Demandeur } from './perimetre-de-l-export'

export const demandeurDe = ({
  mediateurId,
  coordinateurId,
  equipe,
}: {
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
  readonly equipe: readonly string[]
}): Demandeur => ({
  mediateurId: mediateurId === null ? null : MediateurId(mediateurId),
  coordinateurId:
    coordinateurId === null ? null : CoordinateurId(coordinateurId),
  equipe: equipe.map((id) => MediateurId(id)),
})
