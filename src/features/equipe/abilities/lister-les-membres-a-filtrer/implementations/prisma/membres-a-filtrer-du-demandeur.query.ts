import { CoordinateurId, MediateurId } from '@/features/equipe/domain'
import { mediateurCoordonnesEtAnciensIdsFor } from '@/features/equipe/domain/mediateurs-coordonnes'
import { listerLesMembresAFiltrer } from './membres-a-filtrer.query'

type Coordination = { mediateurId: string }

export const membresAFiltrerDuDemandeur = async (demandeur: {
  readonly mediateur: { readonly id: string } | null
  readonly coordinateur: {
    readonly id: string
    readonly mediateursCoordonnes: Coordination[]
    readonly ancienMediateursCoordonnes: Coordination[]
  } | null
}) =>
  demandeur.coordinateur
    ? listerLesMembresAFiltrer({
        coordinateurId: CoordinateurId(demandeur.coordinateur.id),
        demandeur: demandeur.mediateur
          ? MediateurId(demandeur.mediateur.id)
          : null,
        membres: mediateurCoordonnesEtAnciensIdsFor(demandeur).map((id) =>
          MediateurId(id),
        ),
      })
    : []
