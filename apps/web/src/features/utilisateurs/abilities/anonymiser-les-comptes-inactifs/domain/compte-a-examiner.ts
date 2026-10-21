import {
  type AdresseCourriel,
  coordinateurDe,
  type Jalon,
  mediateurDe,
  type Prenom,
  type Rattachements,
  type UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { max } from 'date-fns'

export type PresenceMediateur = {
  readonly dernierCompteRendu: Jalon
  readonly derniereConnexion: Jalon
}

export type PresenceCoordinateur = {
  readonly derniereVisite: Jalon
}

export type CompteAExaminer = {
  readonly id: UtilisateurId
  readonly courriel: AdresseCourriel
  readonly prenom: Prenom | null
  readonly inscritLe: Date
  readonly presence: Rattachements<PresenceMediateur, PresenceCoordinateur>
  readonly avertiLe: Jalon
}

const dates = (...jalons: readonly Jalon[]): readonly Date[] =>
  jalons.flatMap((jalon) => (jalon._tag === 'Le' ? [jalon.date] : []))

const traces = ({ presence }: CompteAExaminer): readonly Date[] => {
  const mediateur = mediateurDe(presence)
  const coordinateur = coordinateurDe(presence)

  return [
    ...(mediateur === null
      ? []
      : dates(mediateur.dernierCompteRendu, mediateur.derniereConnexion)),
    ...(coordinateur === null ? [] : dates(coordinateur.derniereVisite)),
  ]
}

export const derniereActivite = (compte: CompteAExaminer): Date =>
  max([compte.inscritLe, ...traces(compte)])
