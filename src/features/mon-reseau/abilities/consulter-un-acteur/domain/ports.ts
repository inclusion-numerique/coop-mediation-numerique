import type {
  Acteur,
  ActeurId,
  CoordinateurId,
  MediateurId,
} from '../../../domain'
import type { StatistiquesSur30Jours } from './fiche-acteur'
import type { AdhesionLue } from './relation-d-equipe'
import type { DerniereActivite } from './statut-d-activite-public'

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
  periode: { readonly du: string; readonly au: string },
) => Promise<StatistiquesSur30Jours>

export type LireLesLiensDEquipe = (
  coordinateurId: CoordinateurId,
  mediateurId: MediateurId,
) => Promise<{
  readonly adhesions: readonly AdhesionLue[]
  readonly invitationEnCours: Date | null
}>

export type ConsulterUnActeurPorts = {
  readonly lireLActeur: LireLActeur
  readonly lireLesLiensDEquipe: LireLesLiensDEquipe
  readonly lireLaDerniereActivite: LireLaDerniereActivite
  readonly lireLesStatistiquesSur30Jours: LireLesStatistiquesSur30Jours
}
