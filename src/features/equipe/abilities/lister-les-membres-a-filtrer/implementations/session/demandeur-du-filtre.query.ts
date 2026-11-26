import { CoordinateurId } from '../../../../domain/identifiants/coordinateur-id'
import { MediateurId } from '../../../../domain/identifiants/mediateur-id'
import { mediateurCoordonnesEtAnciensIdsFor } from '../../../../domain/mediateurs-coordonnes'
import type { EquipeAFiltrer } from '../../domain'

type Coordination = { mediateurId: string }

export const demandeurDuFiltre = (demandeur: {
  readonly mediateur: { readonly id: string } | null
  readonly coordinateur: {
    readonly id: string
    readonly mediateursCoordonnes: Coordination[]
    readonly ancienMediateursCoordonnes: Coordination[]
  } | null
}): {
  readonly equipe: EquipeAFiltrer | null
  readonly demandeur: MediateurId | null
} => ({
  equipe:
    demandeur.coordinateur == null
      ? null
      : {
          coordinateurId: CoordinateurId(demandeur.coordinateur.id),
          membres: mediateurCoordonnesEtAnciensIdsFor(demandeur).map((id) =>
            MediateurId(id),
          ),
        },
  demandeur:
    demandeur.mediateur == null ? null : MediateurId(demandeur.mediateur.id),
})
