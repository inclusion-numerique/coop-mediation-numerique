import type {
  CoordinateurId,
  CriteresEquipe,
  LigneEquipe,
  UtilisateurId,
} from '../../../domain'
import type { LigneContrat } from './contrat-membre'

export type LireLesMembresAExporter = (lecture: {
  readonly coordinateurId: CoordinateurId
  readonly criteres: CriteresEquipe
  readonly maintenant: Date
}) => Promise<readonly LigneEquipe[]>

export type LireLesContratsDesMembres = (
  utilisateurIds: readonly UtilisateurId[],
) => Promise<ReadonlyMap<UtilisateurId, readonly LigneContrat[]>>

export type ExporterLesMembresPorts = {
  readonly lireLesMembresAExporter: LireLesMembresAExporter
  readonly lireLesContratsDesMembres: LireLesContratsDesMembres
}
