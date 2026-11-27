import type { Page, PageSize } from '@arckit/resultset'
import type { CodeInsee } from '@/libraries/insee'
import type {
  CoordinateurId,
  CriteresEquipe,
  LireLeCoordinateur,
} from '../../../domain'
import type { MembresDeLEquipe } from './membres-de-l-equipe'

export type LireLaCommuneDuCoordinateur = (
  coordinateurId: CoordinateurId,
) => Promise<CodeInsee | null>

export type LireLesMembres = (lecture: {
  readonly coordinateurId: CoordinateurId
  readonly criteres: CriteresEquipe
  readonly page: Page
  readonly pageSize: PageSize
  readonly maintenant: Date
}) => Promise<Omit<MembresDeLEquipe, 'coordinateur'>>

export type ListerLesMembresPorts = {
  readonly lireLeCoordinateur: LireLeCoordinateur
  readonly lireLaCommuneDuCoordinateur: LireLaCommuneDuCoordinateur
  readonly lireLesMembres: LireLesMembres
}
