import { JAMAIS, type Jalon, plusRecent } from './jalon'
import {
  coordinateurDe,
  mediateurDe,
  type Rattachements,
} from './rattachements'

export type ActiviteMediateur = {
  readonly derniereActivite: Jalon
  readonly dernierBeneficiaire: Jalon
}

export type ActiviteCoordinateur = {
  readonly aUneEquipe: boolean
  readonly aCoordonne: boolean
}

export type SituationDActivite = {
  readonly rattachements: Rattachements<ActiviteMediateur, ActiviteCoordinateur>
  readonly derniereVisite: Jalon
}

const activiteDeMediateur = (mediateur: ActiviteMediateur | null): Jalon =>
  mediateur === null
    ? JAMAIS
    : plusRecent(mediateur.derniereActivite, mediateur.dernierBeneficiaire)

const activiteDeCoordinateur = (
  coordinateur: ActiviteCoordinateur | null,
  derniereVisite: Jalon,
): Jalon =>
  coordinateur !== null && (coordinateur.aUneEquipe || coordinateur.aCoordonne)
    ? derniereVisite
    : JAMAIS

export const derniereActiviteDe = ({
  rattachements,
  derniereVisite,
}: SituationDActivite): Jalon =>
  plusRecent(
    activiteDeMediateur(mediateurDe(rattachements)),
    activiteDeCoordinateur(coordinateurDe(rattachements), derniereVisite),
  )
