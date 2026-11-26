import type { Acteur, CoordinateurId, Effectif } from '../../../domain'
import type { LienDEquipe } from './relation-d-equipe'
import type { StatutDActivitePublic } from './statut-d-activite-public'

export const FENETRE_DES_STATISTIQUES_EN_JOURS = 30

export type StatistiquesSur30Jours = {
  readonly beneficiairesAccompagnes: Effectif
  readonly accompagnements: Effectif
}

export type RelationDEquipe =
  | Exclude<LienDEquipe, { _tag: 'Membre' }>
  | {
      readonly _tag: 'Membre'
      readonly statistiques: StatistiquesSur30Jours
    }

export type RegardDuLecteur =
  | { readonly _tag: 'Mediateur' }
  | {
      readonly _tag: 'Coordinateur'
      readonly coordinateurId: CoordinateurId
      readonly relation: RelationDEquipe
    }

export type FicheActeur = {
  readonly acteur: Acteur
  readonly profilCreeLe: Date
  readonly statut: StatutDActivitePublic
  readonly regard: RegardDuLecteur
}
