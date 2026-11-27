import type {
  ActeurAvecCommunes,
  ActeurId,
  CoordinateurId,
  MediateurId,
} from '../../../domain'
import type { StatistiquesSur30Jours } from './fiche-acteur'
import type { AdhesionLue } from './relation-d-equipe'
import type { DerniereActivite } from './statut-d-activite-public'

export type ActeurLu = {
  readonly acteur: ActeurAvecCommunes
  readonly profilCreeLe: Date
}

export type LireLActeur = (acteurId: ActeurId) => Promise<ActeurLu | null>

export type LireLaDerniereActivite = (
  acteurId: ActeurId,
) => Promise<DerniereActivite>

export type LireLesStatistiquesSur30Jours = (
  coordinateurId: CoordinateurId,
  mediateurId: MediateurId,
  periode: { readonly du: Date; readonly au: Date },
) => Promise<StatistiquesSur30Jours>

export type LireLesLiensDEquipe = (
  coordinateurId: CoordinateurId,
  mediateurId: MediateurId,
) => Promise<{
  readonly adhesions: readonly AdhesionLue[]
  readonly invitationEnCours: Date | null
}>

export type LecturesDuRegard = {
  readonly lireLesLiensDEquipe: LireLesLiensDEquipe
  readonly lireLesStatistiquesSur30Jours: LireLesStatistiquesSur30Jours
}

export type ConsulterUnActeurPorts = LecturesDuRegard & {
  readonly lireLActeur: LireLActeur
  readonly lireLaDerniereActivite: LireLaDerniereActivite
}
