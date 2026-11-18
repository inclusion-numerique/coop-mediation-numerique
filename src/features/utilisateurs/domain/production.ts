import {
  coordinateurDe,
  mediateurDe,
  type Rattachements,
} from './rattachements'

export type ProductionMediateur = {
  readonly activites: boolean
  readonly beneficiaires: boolean
}

export type ProductionCoordinateur = {
  readonly equipe: boolean
  readonly activitesCoordination: boolean
  readonly invitationsEnAttente: boolean
}

export type Production = Rattachements<
  ProductionMediateur,
  ProductionCoordinateur
>

export const mediateurEstVierge = ({
  activites,
  beneficiaires,
}: ProductionMediateur): boolean => !activites && !beneficiaires

export const coordinateurEstVierge = ({
  equipe,
  activitesCoordination,
  invitationsEnAttente,
}: ProductionCoordinateur): boolean =>
  !equipe && !activitesCoordination && !invitationsEnAttente

export const aProduit = (production: Production): boolean => {
  const mediateur = mediateurDe(production)
  const coordinateur = coordinateurDe(production)

  return (
    (mediateur !== null && !mediateurEstVierge(mediateur)) ||
    (coordinateur !== null && !coordinateurEstVierge(coordinateur))
  )
}
