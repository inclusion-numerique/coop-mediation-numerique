import { CoordinateurId, MediateurId } from '../../../../domain'
import type { Demandeur } from '../../domain'

export const demandeurDe = ({
  mediateurId,
  coordinateurId,
  equipe,
}: {
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
  readonly equipe: readonly string[]
}): Demandeur => ({
  mediateurId: mediateurId === null ? null : MediateurId.safe(mediateurId),
  coordinateurId:
    coordinateurId === null ? null : CoordinateurId.safe(coordinateurId),
  equipe: equipe.flatMap((id) => {
    const membre = MediateurId.safe(id)
    return membre === null ? [] : [membre]
  }),
})
