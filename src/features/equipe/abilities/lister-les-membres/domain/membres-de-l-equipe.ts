import type { Paginated } from '@arckit/resultset'
import type { CodeDepartement } from '@/libraries/insee'
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
  readonly departementCode: CodeDepartement
}

export type MembresDeLEquipe = Paginated<LigneEquipe> & {
  readonly coordinateur: CoordinateurDeLaListe
  readonly statistiques: StatistiquesEquipe
}
