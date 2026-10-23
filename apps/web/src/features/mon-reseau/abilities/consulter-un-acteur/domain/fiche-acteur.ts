import type {
  Acteur,
  ActeurId,
  CoordinateurId,
  Effectif,
  MediateurId,
} from '../../../domain'
import type { LienDEquipe } from './relation-d-equipe'
import type {
  DerniereActivite,
  StatutDActivitePublic,
} from './statut-d-activite-public'

export type StatistiquesSur30Jours = {
  readonly beneficiairesAccompagnes: Effectif
  readonly accompagnements: Effectif
}

export type ContratAffiche = {
  readonly type: string
  readonly debut: string | null
  readonly fin: string | null
  readonly echeance: 'prochainement' | 'termine' | null
}

export type RelationDEquipe =
  | Exclude<LienDEquipe, { _tag: 'Membre' }>
  | {
      readonly _tag: 'Membre'
      readonly statistiques: StatistiquesSur30Jours
      readonly contrat: ContratAffiche | null
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

export type ActeurLu = {
  readonly acteur: Acteur
  readonly profilCreeLe: Date
}

export type LireLActeur = (acteurId: ActeurId) => Promise<ActeurLu | null>

export type LireLaDerniereActivite = (
  acteurId: ActeurId,
) => Promise<DerniereActivite>

export type LireLesStatistiquesSur30Jours = (
  coordinateurId: CoordinateurId,
  mediateurId: MediateurId,
) => Promise<StatistiquesSur30Jours>

export type LireLeContrat = (
  acteurId: ActeurId,
) => Promise<ContratAffiche | null>
