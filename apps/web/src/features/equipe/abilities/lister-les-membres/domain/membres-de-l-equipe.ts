import type { CoordinateurDeLEquipe, LigneEquipe } from '../../../domain'

export type StatistiquesEquipe = {
  readonly total: number
  readonly actifs: number
  readonly inactifs: number
  readonly invitations: number
  readonly archives: number
  readonly conseillersNumeriques: number
}

export type CoordinateurDeLaListe = CoordinateurDeLEquipe & {
  readonly departementCode: string
}

export type MembresDeLEquipe = {
  readonly coordinateur: CoordinateurDeLaListe
  readonly lignes: readonly LigneEquipe[]
  readonly statistiques: StatistiquesEquipe
  readonly nombreDeResultats: number
  readonly nombreDePages: number
}
