import type { statutsPresence } from '../../domain/statut-presence'

/**
 * Statuts de RDV Service Public, plus `past` que La Coop dérive de l'heure de
 * fin — voir `domain/statut-rdv`, qui porte la même distinction sous le nom
 * `passe`. Les deux coexistent tant que les filtres d'activités écrivent `past`
 * dans les URLs.
 */
export type RdvStatus = (typeof statutsPresence)[number] | 'past'

const rdvStatusPluralLabels: {
  [key in RdvStatus]: string
} = {
  unknown: 'À venir',
  past: 'Passés',
  seen: 'Honorés',
  revoked: 'Annulés',
  excused: 'Annulés par bénéficiaire',
  noshow: 'Absence',
}

export const rdvStatusValues = Object.keys(rdvStatusPluralLabels) as [
  RdvStatus,
  ...RdvStatus[],
]
